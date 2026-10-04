// 미디어 원본 다운로드 — Content-Type · 파일 서명 확인, 크기 제한, 리다이렉트 기록, SHA-256, 이미지 크기
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {BBS} from './bbs-config.mjs';
import {request, FetchError, stop} from './bbs-fetch.mjs';

const EXT = {
  'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'image/svg+xml': 'svg',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov', 'video/x-m4v': 'm4v',
};
const urlExt = (u) => (String(u).split(/[?#]/)[0].match(/\.([a-z0-9]{2,5})$/i)?.[1] || '').toLowerCase();

// 파일 앞부분 서명 — HTML 오류 페이지를 사진으로 저장하지 않기 위해
function sniff(head) {
  const s = head.toString('latin1', 0, 16);
  if (head[0] === 0xff && head[1] === 0xd8) return {kind: 'image', ext: 'jpg'};
  if (s.startsWith('\x89PNG')) return {kind: 'image', ext: 'png'};
  if (s.startsWith('GIF8')) return {kind: 'image', ext: 'gif'};
  if (s.startsWith('RIFF') && s.slice(8, 12) === 'WEBP') return {kind: 'image', ext: 'webp'};
  if (s.slice(4, 8) === 'ftyp') return /avif|avis/.test(s.slice(8, 12)) ? {kind: 'image', ext: 'avif'} : {kind: 'video', ext: s.slice(8, 11) === 'qt ' ? 'mov' : 'mp4'};
  if (head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3) return {kind: 'video', ext: 'webm'};
  if (/^\s*</.test(s)) return {kind: 'html', ext: 'html'};
  return {kind: null, ext: null};
}

// 이미지 크기 (JPEG · PNG · GIF · WebP)
export function imageSize(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const b = Buffer.alloc(256 * 1024);
    const n = fs.readSync(fd, b, 0, b.length, 0);
    const s = b.toString('latin1', 0, 16);
    if (s.startsWith('\x89PNG')) return {width: b.readUInt32BE(16), height: b.readUInt32BE(20)};
    if (s.startsWith('GIF8')) return {width: b.readUInt16LE(6), height: b.readUInt16LE(8)};
    if (s.startsWith('RIFF') && s.slice(8, 12) === 'WEBP') {
      const t = s.slice(12, 16);
      if (t === 'VP8X') return {width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3)};
      if (t === 'VP8 ') return {width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff};
      if (t === 'VP8L') {
        const v = b.readUInt32LE(21);
        return {width: (v & 0x3fff) + 1, height: ((v >> 14) & 0x3fff) + 1};
      }
    }
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < n - 9) {
        if (b[i] !== 0xff) return null;
        const m = b[i + 1];
        const len = b.readUInt16BE(i + 2);
        if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return {width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5)};
        i += 2 + len;
      }
    }
  } finally {
    fs.closeSync(fd);
  }
  return null;
}

// ffprobe 가 있으면 영상 길이·크기 (필수 아님)
let ffprobe;
export function probeVideo(file) {
  if (ffprobe === false) return null;
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', file], {encoding: 'utf8', timeout: 15000});
  if (r.error) {
    ffprobe = false;
    return null;
  }
  try {
    const j = JSON.parse(r.stdout);
    return {width: j.streams?.[0]?.width ?? null, height: j.streams?.[0]?.height ?? null, duration: j.format?.duration ? Number(j.format.duration) : null};
  } catch {
    return null;
  }
}

// 자산 1개 다운로드. asset 객체를 갱신해 돌려준다 (예외를 던지지 않는다 — 중단(Ctrl+C)만 예외)
export async function downloadAsset(asset, {archiveDir, articleId, index}) {
  const now = new Date().toISOString();
  asset.attempts = (asset.attempts || 0);
  asset.lastAttemptAt = now;
  const url = asset.resolvedUrl;
  if (!url) return Object.assign(asset, {downloadStatus: 'unresolved', error: asset.sourceUrl?.startsWith('blob:') ? 'blob: URL — 실제 원본 주소를 찾지 못함' : '원본 주소 없음'});
  if (!/^https?:/i.test(url)) return Object.assign(asset, {downloadStatus: 'skipped-scheme', error: `scheme ${url.split(':')[0]}: 는 받지 않음`});

  const dir = path.join(archiveDir, 'media/articles', articleId);
  fs.mkdirSync(dir, {recursive: true});
  const base = `${asset.type}-${String(index).padStart(3, '0')}`;
  const part = path.join(dir, `${base}.part`);
  let res;
  try {
    res = await request(url, {accept: asset.type === 'image' ? 'image/*,*/*;q=0.5' : 'video/*,*/*;q=0.5'});
  } catch (e) {
    if (stop.signal.aborted) throw e;
    asset.attempts += e.attempts || 1;
    return Object.assign(asset, {downloadStatus: 'failed', lastStatus: e.status ?? null, error: e.message});
  }
  asset.attempts += res.attempts;
  asset.finalUrl = res.url;
  asset.redirected = res.url !== url;
  asset.lastStatus = res.status;
  const ct = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  asset.contentType = ct || null;
  const max = BBS.maxBytes[asset.type] ?? BBS.maxBytes.image;
  const declared = Number(res.headers.get('content-length')) || null;
  if (declared && declared > max) {
    await res.body?.cancel();
    return Object.assign(asset, {downloadStatus: 'skipped-too-large', bytes: declared, error: `${declared} bytes > ${max}`});
  }
  if (ct && !ct.startsWith(`${asset.type}/`) && ct !== 'application/octet-stream' && ct !== 'binary/octet-stream') {
    await res.body?.cancel();
    return Object.assign(asset, {downloadStatus: 'failed', error: `Content-Type 불일치: ${ct} (${asset.type} 아님)`});
  }

  // 스트리밍 저장 (.part → 검사 후 이름 확정)
  const hash = crypto.createHash('sha256');
  const out = fs.createWriteStream(part);
  let bytes = 0;
  let head = Buffer.alloc(0);
  try {
    for await (const chunk of res.body) {
      bytes += chunk.length;
      if (bytes > max) throw new FetchError(`too-large ${bytes} > ${max}`, {permanent: true});
      if (head.length < 32) head = Buffer.concat([head, chunk]).subarray(0, 32);
      hash.update(chunk);
      if (!out.write(chunk)) await new Promise((r) => out.once('drain', r));
    }
    await new Promise((r, j) => out.end((e) => (e ? j(e) : r())));
  } catch (e) {
    out.destroy();
    fs.rmSync(part, {force: true});
    if (stop.signal.aborted) throw stop.signal.reason;
    if (/too-large/.test(e.message)) return Object.assign(asset, {downloadStatus: 'skipped-too-large', bytes, error: e.message});
    return Object.assign(asset, {downloadStatus: 'failed', error: `stream: ${e.message}`});
  }
  const sig = sniff(head);
  if (!bytes || sig.kind === 'html' || (sig.kind && sig.kind !== asset.type)) {
    fs.rmSync(part, {force: true});
    return Object.assign(asset, {downloadStatus: 'failed', bytes, error: !bytes ? '빈 파일' : `파일 서명 불일치: ${sig.kind}`});
  }
  const ext = EXT[ct] || sig.ext || urlExt(asset.finalUrl) || urlExt(url) || 'bin';
  const file = path.join(dir, `${base}.${ext}`);
  fs.renameSync(part, file);
  Object.assign(asset, {
    downloadStatus: 'success',
    localPath: path.relative(archiveDir, file).split(path.sep).join('/'),
    bytes,
    sha256: hash.digest('hex'),
    error: null,
    downloadedAt: new Date().toISOString(),
  });
  if (asset.type === 'image') Object.assign(asset, imageSize(file) || {width: null, height: null});
  else Object.assign(asset, probeVideo(file) || {});
  return asset;
}
