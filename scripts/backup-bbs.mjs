#!/usr/bin/env node
// BBS 원본 백업기 (ARCHIVER) — 원본 HTML · 원본 미디어 URL · 다운로드한 미디어를 먼저 보존하고, 해석은 그다음.
//
//   npm run backup:bbs                       → 시험 모드, 목록 앞 3건 (기본 --limit 3)
//   npm run backup:bbs -- --limit 3 --dry    → 목록 탐색·선택만 (파일 저장 없음)
//   npm run backup:bbs -- --article <UUID>   → 특정 기사 (여러 번 지정 가능, URL 도 가능)
//   npm run backup:bbs -- --no-media         → HTML 만
//   npm run backup:bbs -- --retry-failed     → logs/failed-*.json 의 항목만 다시
//   npm run backup:bbs -- --article <UUID> --force   → 원본 HTML 다시 받기 (기존 파일은 _previous/ 로 보관)
//   --source <origin> · --archive-dir <dir> · --selectors <json>
//   --permission-granted  : 사이트가 noarchive/nofollow 를 표시하고 있을 때, 운영자 허락을 받았음을 명시 (없으면 중단)
//   --all                 : 전체 백업 — 선택자 확인(confirmed) + 전체 목록 수집 방식이 준비된 뒤에만
//
// 같은 명령을 다시 실행하면 이어서 한다: complete → SKIP, 원본이 있는 기사 → 미디어만 RESUME, 나머지 → START.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {BBS, SELECTORS, OBSERVED} from './lib/bbs-config.mjs';
import {fetchRaw, request, politeDelay, stop, FetchError} from './lib/bbs-fetch.mjs';
import {discoverLinks, parseArticle, robotsMeta, robotsTxtBlocks, UUID} from './lib/bbs-parser.mjs';
import {downloadAsset} from './lib/bbs-media.mjs';
import {Archive, dirSize} from './lib/bbs-manifest.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ── 옵션 ───────────────────────────────
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const values = (n) => argv.flatMap((a, i) => (a === n && argv[i + 1] ? [argv[i + 1]] : []));
const value = (n, d = null) => values(n).at(-1) ?? d;
const opt = {
  limit: Number(value('--limit', BBS.defaultLimit)),
  all: flag('--all'),
  articles: values('--article').map((a) => a.match(UUID)?.[0]?.toLowerCase()).filter(Boolean),
  dry: flag('--dry'),
  noMedia: flag('--no-media'),
  retryFailed: flag('--retry-failed'),
  force: flag('--force'),
  permission: flag('--permission-granted'),
  source: (value('--source') || BBS.source).replace(/\/$/, ''),
  archiveDir: path.resolve(ROOT, value('--archive-dir', 'archive/bongnudo2')),
  selectors: value('--selectors') ? {...SELECTORS, ...JSON.parse(fs.readFileSync(path.resolve(value('--selectors')), 'utf8'))} : SELECTORS,
};
if (values('--article').length && opt.articles.length !== values('--article').length) {
  console.error('! --article 값에서 UUID 를 찾지 못했습니다:', values('--article').join(', '));
  process.exit(1);
}
if (!Number.isInteger(opt.limit) || opt.limit < 1) opt.limit = BBS.defaultLimit;

const listUrl = `${opt.source}${BBS.listPath}`;
const A = new Archive(opt.archiveDir, listUrl);
const mode = opt.all ? 'all' : 'test';
const line = '────────────────────────';
const kb = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${(n / 1024).toFixed(1)} KB`);
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const relArchive = (p) => path.relative(ROOT, p).split(path.sep).join('/');

// ── Ctrl+C: 진행 상황 저장 후 종료 ─────
let interrupted = false;
// 시험 전용: 미디어 N개를 받은 뒤 Ctrl+C 와 같은 처리를 일으킨다 (중단·재개 검증용)
const TEST_INTERRUPT = Number(process.env.BBS_TEST_INTERRUPT_AFTER_MEDIA || 0);
let mediaDone = 0;
process.on('SIGINT', () => {
  if (interrupted) process.exit(130);
  interrupted = true;
  stop.abort(Object.assign(new Error('interrupted'), {name: 'Interrupted'}));
});
function bailInterrupted() {
  try {
    A.log('INTERRUPTED — progress saved');
    A.save();
  } catch {}
  console.log('\nBackup interrupted.\nProgress has been saved.\nRun the same command to resume.');
  process.exitCode = 130; // process.exit() 은 열린 소켓이 있을 때 Windows 에서 비정상 종료될 수 있어 쓰지 않는다
}

async function main() {
  console.log(`[BBS BACKUP · ${mode === 'all' ? 'FULL MODE' : 'TEST MODE'}${opt.dry ? ' · DRY RUN' : ''}]\n\nSource:\n${listUrl}\n`);
  if (opt.all) {
    if (!opt.selectors.confirmed) return abort('--all 은 실제 기사 DOM 선택자를 확인(SELECTORS.confirmed)한 뒤에만 실행할 수 있습니다.');
    return abort(`--all 은 아직 지원하지 않습니다: 목록 2페이지부터는 href 가 없고 ${OBSERVED.paginationMethod} 로만 불러옵니다. 전체 목록 수집 방식을 정한 뒤 구현합니다.`);
  }

  // 1) 접근 정책: robots.txt
  let robotsTxt = null;
  try {
    const r = await fetchRaw(`${opt.source}/robots.txt`);
    robotsTxt = r.buf.toString('utf8');
  } catch (e) {
    if (!(e instanceof FetchError) || e.status !== 404) throw e;
  }
  if (robotsTxtBlocks(robotsTxt, BBS.listPath, BBS.userAgent)) return abort('robots.txt 가 /bbs 접근을 허용하지 않습니다. 중단합니다.');

  // 2) 목록 (재시도 전용 모드가 아니면)
  let links = [];
  let summary = {};
  if (!opt.retryFailed || opt.articles.length) {
    console.log('Discovering articles...');
    const list = await fetchRaw(listUrl);
    const html = list.buf.toString('utf8');
    const meta = robotsMeta(html);
    A.m.access = {robotsTxt: robotsTxt == null ? 'none (404)' : 'present', meta: meta.directives, permissionGranted: opt.permission, checkedAt: new Date().toISOString()};
    if ((meta.restrictsArchiving || meta.restrictsFollowing) && !opt.permission) {
      return abort(
        `이 사이트는 모든 페이지에 robots 메타 "${Object.values(meta.directives).flat().join(', ')}" 를 표시합니다.\n` +
          '자동 수집·보관(noarchive/nofollow)을 원하지 않는다는 신호이므로 여기서 멈춥니다.\n' +
          '사이트 운영자의 허락을 받은 경우에만 --permission-granted 를 붙여 다시 실행하세요.',
      );
    }
    ({links, summary} = discoverLinks(html, listUrl));
    const {pagination} = discoverLinks(html, listUrl);
    A.m.pagination = {...pagination, observedMethod: OBSERVED.paginationMethod};
    A.m.stats.discovered = links.length;
    console.log(`Found: ${links.length}${pagination.rscTotal ? `  (목록 전체 ${pagination.rscTotal}건 · ${pagination.rscTotalPages}페이지 중 첫 페이지)` : ''}`);
    if (!opt.dry) {
      fs.mkdirSync(A.abs('raw/index'), {recursive: true});
      fs.writeFileSync(A.abs('raw/index/bbs-page-001.html'), list.buf); // 서버가 보낸 바이트 그대로
      const prev = new Map((fs.existsSync(A.p.links) ? JSON.parse(fs.readFileSync(A.p.links, 'utf8')) : []).map((l) => [l.id, l]));
      for (const l of links) prev.set(l.id, {...l, ...(prev.get(l.id) || {}), url: l.url, lastSeenAt: new Date().toISOString(), discoveredAt: prev.get(l.id)?.discoveredAt || new Date().toISOString()});
      fs.mkdirSync(path.dirname(A.p.links), {recursive: true});
      fs.writeFileSync(`${A.p.links}.tmp`, JSON.stringify([...prev.values()], null, 2) + '\n');
      fs.renameSync(`${A.p.links}.tmp`, A.p.links);
      A.log(`LIST ${listUrl} links=${links.length} pagination=${JSON.stringify(A.m.pagination)}`);
    }
    await politeDelay();
  }

  // 3) 선택
  let selected;
  if (opt.articles.length) selected = opt.articles.map((id) => links.find((l) => l.id === id) || {id, url: `${opt.source}${BBS.articlePath}${id}`, discoveredFrom: 'cli'});
  else if (opt.retryFailed) {
    const ids = [...new Set([...A.failedArticles.map((x) => x.id), ...A.failedMedia.map((x) => x.articleId)])];
    selected = ids.map((id) => ({id, url: A.m.articles[id]?.url || `${opt.source}${BBS.articlePath}${id}`, discoveredFrom: A.m.articles[id]?.discoveredFrom || 'retry'}));
  } else selected = links.slice(0, opt.limit);
  console.log(`Selected: ${selected.length}\n`);

  if (opt.dry) {
    selected.forEach((l, i) => console.log(`${i + 1}. ${summary[l.id]?.author ?? '?'} · ${summary[l.id]?.title ?? l.id}\n   ${l.url}`));
    console.log('\nNo files downloaded.');
    return 0;
  }
  if (!selected.length) {
    console.log('처리할 기사가 없습니다.');
    return 0;
  }
  A.m.mode = mode;
  A.m.selectors = {confirmed: Boolean(opt.selectors.confirmed), custom: Boolean(value('--selectors'))};
  A.save();

  // 4) 기사
  let first = true;
  for (const [i, l] of selected.entries()) {
    await backupArticle(l, i, selected.length, first, summary[l.id]);
    first = false;
  }
  return printSummary(links.length, selected);
}

function abort(msg) {
  console.log(`\n! ${msg}`);
  // 중단: 이미 있던 아카이브에만 기록을 남긴다 (새 아카이브 폴더를 만들지 않는다)
  try {
    if (!opt.dry && fs.existsSync(A.p.manifest)) {
      A.log(`ABORT ${msg.replace(/\n/g, ' ')}`);
      A.save();
    }
  } catch {}
  return 2;
}

const mediaFilesOk = (rec) => (rec?.media || []).filter((a) => a.downloadStatus === 'success').every((a) => fs.existsSync(A.abs(a.localPath)));

async function backupArticle(l, i, n, first, listSummary) {
  const id = l.id;
  const st = A.article(id);
  A.set(id, {selected: true, url: l.url, discoveredFrom: st.discoveredFrom || l.discoveredFrom});
  const rawRel = `raw/articles/${id}.html`;
  const rawAbs = A.abs(rawRel);
  const prevRec = A.record(id);
  console.log(`[${i + 1}/${n}]`);

  if (!opt.force && st.status === 'complete' && fs.existsSync(rawAbs) && mediaFilesOk(prevRec)) {
    console.log(`[SKIP] ${id} already complete\n`);
    A.log(`SKIP ${id}`);
    return;
  }

  // 원본 HTML: 없거나 --force 거나 기사 자체가 실패했던 경우에만 요청
  const needFetch = opt.force || !st.rawSaved || !fs.existsSync(rawAbs);
  if (needFetch) {
    if (fs.existsSync(rawAbs)) {
      const keep = A.abs(`raw/articles/_previous/${id}.${(st.capturedAt || 'unknown').replace(/[:.]/g, '-')}.html`);
      fs.mkdirSync(path.dirname(keep), {recursive: true});
      fs.copyFileSync(rawAbs, keep);
      console.log(`  ! --force: 기존 원본을 보관했습니다 → ${A.rel(keep)}`);
    }
    A.set(id, {status: 'fetching'});
    A.save();
    if (!first) await politeDelay();
    try {
      const r = await fetchRaw(l.url, {onRetry: ({attempt, status, waitMs}) => console.log(`  … retry ${attempt} (${status ?? 'network'}) — ${Math.round(waitMs / 100) / 10}s 대기`)});
      fs.mkdirSync(path.dirname(rawAbs), {recursive: true});
      fs.writeFileSync(rawAbs, r.buf); // FETCH → SAVE RAW → PARSE
      const h = sha(r.buf);
      const changed = st.rawSha256 && st.rawSha256 !== h;
      A.set(id, {status: 'raw-saved', rawSaved: true, rawHtmlPath: rawRel, httpStatus: r.status, capturedAt: new Date().toISOString(), rawSha256: h, rawBytes: r.buf.length, ...(changed ? {sourceChanged: true, previousSha256: st.rawSha256} : {})});
      A.clearFailedArticle(id);
      A.log(`RAW ${id} ${r.status} ${r.buf.length}B sha256=${h}${changed ? ' SOURCE CHANGED' : ''}`);
    } catch (e) {
      if (stop.signal.aborted) throw e;
      A.set(id, {status: 'failed', error: e.message, lastStatus: e.status ?? null});
      A.markFailedArticle({id, url: l.url, attempts: e.attempts ?? 1, lastStatus: e.status ?? null, error: e.message, lastAttemptAt: new Date().toISOString()});
      A.log(`FAIL-ARTICLE ${id} ${e.status ?? ''} ${e.message}`);
      A.save();
      console.log(`  ${listSummary?.author ?? ''} ${listSummary?.title ?? id}\n\n  RAW HTML      ✗ (${e.status ?? e.message})\n  STATUS        FAILED\n`);
      return;
    }
  } else {
    console.log(`[RESUME] ${id} (${st.status}) — 저장된 원본 HTML 을 사용합니다`);
  }

  // 해석 (실패해도 원본은 이미 저장됨)
  A.set(id, {status: 'parsing'});
  let parsed;
  try {
    parsed = parseArticle(fs.readFileSync(rawAbs, 'utf8'), {id, url: l.url, selectors: opt.selectors});
  } catch (e) {
    parsed = {meta: {}, blocks: [], cover: null, parseSuccess: false, parseError: `parser crash: ${e.message}`};
  }

  // 미디어 자산 (등장 순서대로 번호, 같은 URL 은 한 번만 받는다 — 블록에는 등장한 만큼 남는다)
  const prevAssets = new Map((prevRec?.media || []).map((a) => [a.key, a]));
  const assets = [];
  const byKey = new Map();
  const counters = {image: 0, video: 0};
  const addAsset = (b, role, occ) => {
    if (b.type === 'embed') {
      const key = `embed:${b.sourceUrl}`;
      if (!byKey.has(key)) {
        const a = {key, assetId: `embed-${String(assets.filter((x) => x.type === 'embed').length + 1).padStart(3, '0')}`, type: 'embed', sourceUrl: b.sourceUrl, resolvedUrl: null, host: hostOf(b.sourceUrl), downloadStatus: 'embed-not-downloaded', error: `${b.tag} — 외부 임베드는 받지 않음 (원본 HTML 에 보존)`};
        byKey.set(key, a);
        assets.push(a);
      }
      return byKey.get(key).assetId;
    }
    const key = b.resolvedUrl ? `url:${b.resolvedUrl}` : `unresolved:${b.sourceUrl}:${occ}`;
    let a = byKey.get(key);
    if (!a) {
      counters[b.type]++;
      const prev = prevAssets.get(key);
      a = {
        key,
        assetId: `${b.type}-${String(counters[b.type]).padStart(3, '0')}`,
        index: counters[b.type],
        type: b.type,
        roles: [],
        sourceUrl: b.sourceUrl,
        resolvedUrl: b.resolvedUrl,
        host: hostOf(b.resolvedUrl || b.sourceUrl),
        poster: b.poster || null,
        orderKnown: b.orderKnown !== false,
        downloadStatus: 'pending',
        ...(prev && prev.assetId === `${b.type}-${String(counters[b.type]).padStart(3, '0')}` ? pickDownload(prev) : {}),
      };
      byKey.set(key, a);
      assets.push(a);
    }
    if (role && !a.roles.includes(role)) a.roles.push(role);
    return a.assetId;
  };
  if (parsed.cover) addAsset({type: 'image', sourceUrl: parsed.cover, resolvedUrl: parsed.cover}, 'cover', 'cover');
  const blocks = parsed.blocks.map((b, k) => (b.type === 'image' || b.type === 'video' || b.type === 'embed' ? {...b, assetId: addAsset(b, 'body', k)} : b));

  // 다운로드
  const media = assets.filter((a) => a.type !== 'embed');
  const todo = media.filter((a) => a.downloadStatus !== 'success' || !fs.existsSync(A.abs(a.localPath || '')));
  todo.forEach((a) => a.downloadStatus === 'success' && Object.assign(a, {downloadStatus: 'pending'}));
  const saveRecord = (status) => {
    const done = media.filter((a) => a.downloadStatus === 'success');
    A.set(id, {
      status,
      title: parsed.meta.title ?? null,
      author: parsed.meta.author ?? null,
      parseSuccess: parsed.parseSuccess,
      parseError: parsed.parseError,
      blocks: blocks.length,
      mediaExpected: media.length,
      mediaDownloaded: done.length,
      mediaFailed: media.filter((a) => a.downloadStatus === 'failed').length,
      mediaUnresolved: media.filter((a) => a.downloadStatus === 'unresolved').length,
      mediaSkipped: media.filter((a) => /^skipped/.test(a.downloadStatus)).length,
    });
    const assetById = new Map(assets.map((a) => [a.assetId, a]));
    A.putRecord({
      id,
      sourceUrl: l.url,
      discoveredFrom: A.article(id).discoveredFrom,
      title: parsed.meta.title ?? null,
      author: parsed.meta.author ?? null,
      authorStreamerName: parsed.meta.authorStreamerName ?? null,
      category: parsed.meta.category ?? null,
      approvedAtRaw: parsed.meta.approvedAtRaw ?? null,
      approvedAt: parsed.meta.approvedAt ?? null,
      metaSource: parsed.meta.metaSource ?? null,
      rawHtmlPath: rawRel,
      rawSha256: A.article(id).rawSha256,
      capturedAt: A.article(id).capturedAt,
      httpStatus: A.article(id).httpStatus,
      parseSuccess: parsed.parseSuccess,
      parseError: parsed.parseError,
      blocksSource: parsed.blocksSource ?? null,
      sourceBlocks: blocks.map((b) => {
        const a = b.assetId && assetById.get(b.assetId);
        return a ? {...b, localPath: a.localPath ?? null, downloadStatus: a.downloadStatus, width: a.width ?? b.attrWidth ?? null, height: a.height ?? b.attrHeight ?? null} : b;
      }),
      media: assets,
    });
    A.syncMediaLogs(id, assets);
    A.save();
  };

  if (opt.noMedia) {
    saveRecord('raw-saved');
  } else if (todo.length) {
    saveRecord('media-downloading');
    let next = 0;
    const worker = async () => {
      while (next < todo.length) {
        const a = todo[next++];
        await downloadAsset(a, {archiveDir: A.dir, articleId: id, index: a.index});
        A.log(`MEDIA ${id} ${a.assetId} ${a.downloadStatus} ${a.resolvedUrl ?? a.sourceUrl} ${a.error ?? ''}`);
        saveRecord('media-downloading');
        if (TEST_INTERRUPT && ++mediaDone === TEST_INTERRUPT) process.emit('SIGINT');
      }
    };
    await Promise.all(Array.from({length: Math.min(BBS.mediaConcurrency, todo.length)}, worker));
  }
  const incomplete = media.some((a) => a.downloadStatus !== 'success');
  const status = opt.noMedia ? 'raw-saved' : !parsed.parseSuccess || incomplete ? 'partial' : 'complete';
  saveRecord(status);
  A.log(`DONE ${id} ${status}`);

  const cnt = (t) => {
    const all = media.filter((a) => a.type === t);
    return opt.noMedia ? `—/${all.length} (no-media)` : `${all.filter((a) => a.downloadStatus === 'success').length}/${all.length}`;
  };
  const issues = media.filter((a) => a.downloadStatus !== 'success' && a.downloadStatus !== 'pending');
  console.log(
    `${parsed.meta.author ?? '(작성자 미확인)'}\n${parsed.meta.title ?? '(제목 미확인)'}\n\n` +
      `  RAW HTML      ✓\n  Metadata      ${parsed.meta.title && parsed.meta.author ? '✓' : '△'}  (approved ${parsed.meta.approvedAt ?? '—'})\n` +
      `  Blocks        ${blocks.length}${parsed.parseSuccess ? '' : `  ✗ ${parsed.parseError}`}\n` +
      `  Images        ${cnt('image')}\n  Videos        ${cnt('video')}\n` +
      (assets.some((a) => a.type === 'embed') ? `  Embeds        ${assets.filter((a) => a.type === 'embed').length} (not downloaded)\n` : '') +
      issues.map((a) => `  ! ${a.assetId} ${a.downloadStatus}: ${a.error}\n`).join('') +
      `  STATUS        ${status.toUpperCase()}\n`,
  );
}

const hostOf = (u) => {
  try {
    return new URL(u).host || null;
  } catch {
    return null;
  }
};
const pickDownload = (p) => {
  const keys = ['downloadStatus', 'localPath', 'contentType', 'bytes', 'sha256', 'width', 'height', 'duration', 'finalUrl', 'redirected', 'attempts', 'lastStatus', 'error', 'lastAttemptAt', 'downloadedAt'];
  return Object.fromEntries(keys.filter((k) => p[k] !== undefined).map((k) => [k, p[k]]));
};

function printSummary(discovered, selected) {
  const ids = new Set(selected.map((l) => l.id));
  const arts = Object.entries(A.m.articles).filter(([id]) => ids.has(id)).map(([, a]) => a);
  const recs = [...ids].map((id) => A.record(id)).filter(Boolean);
  const m = recs.flatMap((r) => r.media.filter((a) => a.type !== 'embed'));
  const t = (type, ok) => m.filter((a) => a.type === type && (!ok || a.downloadStatus === 'success')).length;
  const pad = (s, n = 24) => String(s).padEnd(n);
  console.log(
    `${line}\nBBS BACKUP ${mode.toUpperCase()} COMPLETE\n${line}\n\n` +
      `${pad('Articles discovered')}${discovered}\n${pad('Articles selected')}${selected.length}\n\n` +
      `${pad('Complete')}${arts.filter((a) => a.status === 'complete').length}\n${pad('Partial')}${arts.filter((a) => a.status === 'partial').length}\n` +
      `${pad('Failed')}${arts.filter((a) => a.status === 'failed').length}\n${pad('HTML only (no-media)')}${arts.filter((a) => a.status === 'raw-saved').length}\n\n` +
      `${pad('Raw HTML')}${arts.filter((a) => a.rawSaved).length} / ${selected.length}\n\n` +
      `${pad('Images')}${t('image', true)} / ${t('image')}\n${pad('Videos')}${t('video', true)} / ${t('video')}\n\n` +
      `${pad('Failed media')}${A.failedMedia.filter((x) => ids.has(x.articleId)).length}\n${pad('Skipped / unresolved')}${A.skipped.filter((x) => ids.has(x.articleId)).length}\n\n` +
      `${pad('Archive size')}${kb(dirSize(A.dir))}\n\nManifest\n${relArchive(A.p.manifest)}\n\nSource JSON\n${relArchive(A.p.articles)}\n\n${line}`,
  );
  return arts.some((a) => a.status === 'failed') ? 1 : 0;
}

main()
  .then((code) => (process.exitCode = code ?? 0))
  .catch((e) => {
    if (stop.signal.aborted || e?.name === 'Interrupted') return bailInterrupted();
    console.error(`\n! ${e.stack || e.message}`);
    try {
      A.log(`CRASH ${e.message}`);
      A.save();
    } catch {}
    process.exitCode = 1;
  });
