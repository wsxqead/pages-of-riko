#!/usr/bin/env node
// BBS 봉누도방송국 기사 → data/bongnudo2/articles/articles.json  (content 블록 형식)
//
// 사용법
//   node scripts/import-bbs-articles.mjs <원본.json> [--download] [--dry] [--no-raw] [--out <articles.json>]
//   node scripts/import-bbs-articles.mjs archive/bongnudo2/source/articles.json --from-backup   (backup:bbs 결과 — 받아 둔 미디어 재사용)
//
//   <원본.json>  : 백업한 기사 배열(JSON). 기사마다 아래 중 하나가 있으면 된다 (우선순위 순)
//                   1) content: [...블록]            이미 블록으로 정리된 기사
//                   2) html / contentHtml / wr_content(태그 포함) 원본 기사 HTML → DOM 순서대로 블록 변환
//                   3) body(텍스트) + images[] + videos[]  예전 형식 (본문의 [[image:1]] 표식 위치 보존)
//   --download   : 원격 사진/영상을 public/media/bongnudo-2/articles/{id}/image-01.jpg … 로 내려받고 src 를 로컬로 바꾼다.
//   --dry        : 파일을 쓰지 않고 결과만 출력.
//   --no-raw     : 원본 HTML 을 data/bongnudo2/archive/raw/{id}.html 로 보관하지 않는다 (기본은 보관).
//
// 이미 있는 기사는 id 로 합친다: 원문 필드는 갱신, 전시용 필드(featured, isShinIbiArticle, featuresShinIbi,
// relatedPeople, relatedEvents, archiveNote, thumbnail)는 기존 값을 보존 → 여러 번 import 해도 안전.

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {htmlToBlocks} from './lib/html-to-blocks.mjs';
import {loadEsmData} from './lib/load-esm-data.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data/bongnudo2/articles/articles.json');
const RAW_DIR = path.join(ROOT, 'data/bongnudo2/archive/raw');
const MEDIA_DIR = path.join(ROOT, 'public/media/bongnudo-2/articles');
const MEDIA_URL = '/media/bongnudo-2/articles';
const SHIN_ID = 'shin-ibi';

const args = process.argv.slice(2);
const optValue = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const input = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--out');
const DOWNLOAD = args.includes('--download');
const DRY = args.includes('--dry');
const KEEP_RAW = !args.includes('--no-raw');
// --from-backup: backup:bbs 가 만든 archive/bongnudo2/source/articles.json 을 읽는다.
//   이미 받아 둔 미디어(localPath)는 다시 내려받지 않고 public/ 로 복사하고, 원본 HTML 은 백업 쪽 raw 파일을 가리킨다.
const FROM_BACKUP = args.includes('--from-backup');
const OUT_FILE = optValue('--out') ? path.resolve(optValue('--out')) : OUT;
if (!input) {
  console.error('usage: node scripts/import-bbs-articles.mjs <raw.json> [--from-backup] [--download] [--dry] [--no-raw] [--out <articles.json>]');
  process.exit(1);
}
const BACKUP_ROOT = FROM_BACKUP ? path.resolve(path.dirname(path.resolve(input)), '..') : null;
const posix = (p) => p.split(path.sep).join('/');

// 백업기의 sourceBlocks(원본 DOM 순서) → content 블록
function backupBlocks(r, id, problems) {
  const assets = new Map((r.media || []).map((a) => [a.assetId, a]));
  const out = [];
  for (const b of r.sourceBlocks || []) {
    if (b.type === 'paragraph' || b.type === 'quote') out.push({type: b.type, text: b.text});
    else if (b.type === 'heading') out.push({type: 'heading', text: b.text, level: b.level ?? 2});
    else if (b.type === 'divider') out.push({type: 'divider'});
    else if (b.type === 'image' || b.type === 'video') {
      const a = assets.get(b.assetId) || {};
      const remote = a.resolvedUrl || b.resolvedUrl || b.sourceUrl || null;
      let src = remote;
      if (FROM_BACKUP && a.downloadStatus === 'success' && a.localPath) {
        const from = path.join(BACKUP_ROOT, a.localPath);
        const name = path.basename(a.localPath);
        if (fs.existsSync(from)) {
          if (!DRY) {
            fs.mkdirSync(path.join(MEDIA_DIR, id), {recursive: true});
            fs.copyFileSync(from, path.join(MEDIA_DIR, id, name));
          }
          src = `${MEDIA_URL}/${id}/${name}`;
        } else problems.push(`id ${id}: 백업 파일 없음 ${a.localPath} → 원격 주소 사용`);
      } else if (a.downloadStatus && a.downloadStatus !== 'success') problems.push(`id ${id}: ${b.assetId} ${a.downloadStatus} → 원격 주소로 둠 (${remote ?? '주소 없음'})`);
      if (b.orderKnown === false) problems.push(`id ${id}: ${b.assetId} 는 본문 속 위치가 확인되지 않아 끝에 붙임`);
      const common = {src: /^blob:/.test(src || '') ? null : src, originalUrl: remote, width: a.width ?? b.width ?? null, height: a.height ?? b.height ?? null};
      out.push(b.type === 'image' ? {type: 'image', ...common, alt: b.alt ?? null, caption: null} : {type: 'video', ...common, poster: b.poster ?? a.poster ?? null, duration: a.duration ?? null});
    } else if (b.type === 'embed') problems.push(`id ${id}: 임베드(${b.sourceUrl}) 는 블록으로 옮기지 않음 — 원본 HTML 에 보존`);
  }
  // 본문에는 없고 대표 이미지로만 있는 사진 → thumbnail 후보
  const cover = (r.media || []).find((a) => a.roles?.includes('cover') && !a.roles.includes('body') && a.downloadStatus === 'success' && a.localPath);
  let thumbnail = null;
  if (cover && FROM_BACKUP) {
    const name = path.basename(cover.localPath);
    if (!DRY && fs.existsSync(path.join(BACKUP_ROOT, cover.localPath))) {
      fs.mkdirSync(path.join(MEDIA_DIR, id), {recursive: true});
      fs.copyFileSync(path.join(BACKUP_ROOT, cover.localPath), path.join(MEDIA_DIR, id, name));
    }
    thumbnail = {src: `${MEDIA_URL}/${id}/${name}`, width: cover.width ?? null, height: cover.height ?? null, alt: null, originalUrl: cover.resolvedUrl};
  }
  return {content: out, thumbnail};
}

// 기자 이름 → people.js id (보도국 명단에서 자동)
const {people} = loadEsmData(path.join(ROOT, 'data/bongnudo2/people.js'));
const NAME_TO_ID = Object.fromEntries(people.map((p) => [p.name, p.id]));

// ── 원본 필드 이름 후보 (백업 형식에 맞게 여기만 고치면 된다) ──
const FIELD = {
  id: ['id', 'no', 'articleId', 'article_id', 'idx', 'wr_id'],
  title: ['title', 'subject', 'wr_subject'],
  html: ['html', 'contentHtml', 'content_html', 'bodyHtml'],
  text: ['body', 'contents', 'text', 'wr_content'],
  authorName: ['authorName', 'author', 'writer', 'nickname', 'name', 'wr_name'],
  authorId: ['authorId', 'writerId', 'mb_id'],
  publishedAt: ['publishedAt', 'approvedAt', 'date', 'created_at', 'createdAt', 'regdate', 'wr_datetime'],
  category: ['category', 'section', 'board', 'ca_name'],
  images: ['images', 'imgs', 'photos', 'files'],
  videos: ['videos', 'movies', 'clips'],
  likes: ['likes', 'like', 'good', 'wr_good'],
  dislikes: ['dislikes', 'dislike', 'bad', 'wr_nogood'],
  url: ['originalUrl', 'sourceUrl', 'url', 'link', 'href'],
  tags: ['tags', 'keywords'],
};
const pick = (o, keys) => {
  for (const k of keys) if (o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k];
  return null;
};
// 날짜 → 봉누도 현지(KST) 표기 'YYYY-MM-DDTHH:mm:ss'.
// 시간대(Z, +00:00 …)가 붙은 값은 같은 순간의 KST 로 바꾼다 (그냥 자르면 UTC 값이 9시간 어긋난다).
const toIso = (v) => {
  if (!v) return null;
  const s = String(v).trim().replace(' ', 'T');
  const t = new Date(s).getTime();
  if (Number.isNaN(t)) return null;
  if (!/(Z|[+-]\d{2}:?\d{2})$/i.test(s)) return s.slice(0, 19);
  return new Date(t + 9 * 3600 * 1000).toISOString().slice(0, 19);
};
const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const extOf = (u, fallback) => (String(u).split('?')[0].match(/\.(\w{2,5})$/)?.[1] || fallback).toLowerCase();
const looksHtml = (s) => typeof s === 'string' && /<(p|div|img|br|video|span)\b/i.test(s);

async function download(url, dest) {
  if (fs.existsSync(dest)) return true;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    fs.mkdirSync(path.dirname(dest), {recursive: true});
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    return true;
  } catch (e) {
    console.warn(`  ! download failed ${url} (${e.message})`);
    return false;
  }
}

// 예전 형식(텍스트 + 첨부) → 블록. [[image:n]] 표식이 있으면 그 위치에.
function legacyBlocks(body, images, videos) {
  const out = [];
  const used = {image: new Set(), video: new Set()};
  const norm = (o) => (typeof o === 'string' ? {src: o} : o);
  String(body || '').split(/\n{2,}/).forEach((para) => {
    let last = 0;
    for (const m of para.matchAll(/\[\[(image|video):(\d+)\]\]/g)) {
      const t = para.slice(last, m.index).trim();
      if (t) out.push({type: 'paragraph', text: t});
      const n = Number(m[2]) - 1;
      const item = (m[1] === 'image' ? images : videos)[n];
      if (item) {
        used[m[1]].add(n);
        out.push({type: m[1], ...norm(item)});
      }
      last = m.index + m[0].length;
    }
    const rest = para.slice(last).trim();
    if (rest) out.push({type: 'paragraph', text: rest});
  });
  images.forEach((im, i) => !used.image.has(i) && out.push({type: 'image', ...norm(im)}));
  videos.forEach((v, i) => !used.video.has(i) && out.push({type: 'video', ...norm(v)}));
  return out;
}

// 블록 안의 미디어: 원본 URL 보존, --download 시 로컬 파일로 (번호는 기사 안의 등장 순서)
async function localizeMedia(blocks, id) {
  const count = {image: 0, video: 0};
  const fix = async (b, kind) => {
    const remote = b.originalUrl || b.url || b.src || null;
    b.originalUrl = remote;
    delete b.url;
    count[kind]++;
    if (DOWNLOAD && remote && /^https?:/.test(remote)) {
      const file = `${kind}-${String(count[kind]).padStart(2, '0')}.${extOf(remote, kind === 'image' ? 'jpg' : 'mp4')}`;
      if (await download(remote, path.join(MEDIA_DIR, id, file))) b.src = `${MEDIA_URL}/${id}/${file}`;
    }
  };
  for (const b of blocks) {
    if (b.src?.startsWith('/')) {
      count[b.type === 'video' ? 'video' : 'image']++; // 이미 로컬 파일 (백업에서 복사) — 다시 받지 않는다
      continue;
    }
    if (b.type === 'image') await fix(b, 'image');
    else if (b.type === 'video' && (b.src || b.originalUrl)) await fix(b, 'video');
    else if (b.type === 'gallery') for (const im of b.images || []) await fix(im, 'image');
  }
  return count;
}

const raw = JSON.parse(fs.readFileSync(path.resolve(input), 'utf8'));
const rawList = Array.isArray(raw) ? raw : raw.articles || raw.data || [];
const existing = fs.existsSync(OUT_FILE) ? JSON.parse(fs.readFileSync(OUT_FILE, 'utf8')) : [];
const byId = new Map(existing.map((a) => [String(a.id), a]));
const capturedAt = new Date().toISOString().slice(0, 10);

let added = 0;
let updated = 0;
const runIds = new Set();
const problems = [];
for (const r of rawList) {
  const originalId = pick(r, FIELD.id);
  const id = String(r.id ?? originalId ?? `${byId.size + 1}`);
  if (runIds.has(id)) problems.push(`원본 안에서 id 중복: ${id} (뒤의 것으로 덮어씀)`);
  runIds.add(id);
  const rawDate = pick(r, FIELD.publishedAt);
  if (rawDate && !toIso(rawDate)) problems.push(`날짜를 읽지 못함: id ${id} "${rawDate}" → null`);

  // 본문 → content 블록
  let content;
  let rawSource = null;
  let backupThumb = null;
  const html = pick(r, FIELD.html) ?? (looksHtml(pick(r, FIELD.text)) ? pick(r, FIELD.text) : null);
  if (Array.isArray(r.content)) {
    content = r.content.map((b) => ({...b}));
  } else if (Array.isArray(r.sourceBlocks)) {
    // backup:bbs 결과 — 원본 HTML 은 백업 쪽 raw 파일을 그대로 가리킨다 (복사하지 않는다)
    ({content, thumbnail: backupThumb} = backupBlocks(r, id, problems));
    if (r.rawHtmlPath) rawSource = posix(path.relative(ROOT, BACKUP_ROOT ? path.join(BACKUP_ROOT, r.rawHtmlPath) : path.resolve(path.dirname(path.resolve(input)), '..', r.rawHtmlPath)));
    if (r.parseSuccess === false) problems.push(`id ${id}: 백업 해석 실패(${r.parseError}) — 원본 HTML 에서 다시 해석 필요`);
  } else if (html) {
    const {blocks, unknown} = htmlToBlocks(html);
    content = blocks;
    if (unknown.length) problems.push(`id ${id}: 블록으로 옮기지 못한 요소 ${unknown.join(', ')} (원본 HTML 보관됨)`);
    if (KEEP_RAW) {
      rawSource = `data/bongnudo2/archive/raw/${id}.html`;
      if (!DRY) {
        fs.mkdirSync(RAW_DIR, {recursive: true});
        fs.writeFileSync(path.join(ROOT, rawSource), html);
      }
    }
  } else {
    const body = typeof r.content === 'string' ? r.content : pick(r, FIELD.text);
    content = legacyBlocks(body, asList(pick(r, FIELD.images)), asList(pick(r, FIELD.videos)));
  }
  await localizeMedia(content, id);

  const authorName = String(pick(r, FIELD.authorName) || '').trim();
  const prev = byId.get(id);
  const authorId = pick(r, FIELD.authorId) ?? NAME_TO_ID[authorName] ?? prev?.authorId ?? null;
  if (authorName && !authorId) problems.push(`id ${id}: 기자 "${authorName}" 를 people.js 에서 찾지 못함 → authorName 으로만 저장`);
  const article = {
    id,
    originalId,
    title: String(pick(r, FIELD.title) || '').trim(),
    category: pick(r, FIELD.category),
    authorId,
    authorName: authorId ? null : authorName || null,
    publishedAt: toIso(rawDate),
    content, // 원본 순서 그대로
    tags: asList(pick(r, FIELD.tags)),
    likes: pick(r, FIELD.likes) != null ? Number(pick(r, FIELD.likes)) : null,
    dislikes: pick(r, FIELD.dislikes) != null ? Number(pick(r, FIELD.dislikes)) : null,
    originalUrl: pick(r, FIELD.url),
    archivedAt: prev?.archivedAt ?? (r.capturedAt ? String(r.capturedAt).slice(0, 10) : capturedAt),
    rawSource: rawSource ?? prev?.rawSource ?? null,
    // 전시용 필드 — 기존 값 보존
    thumbnail: prev?.thumbnail ?? backupThumb ?? null,
    relatedPeople: prev?.relatedPeople ?? [],
    relatedEvents: prev?.relatedEvents ?? [],
    isShinIbiArticle: prev?.isShinIbiArticle ?? authorId === SHIN_ID,
    featuresShinIbi: prev?.featuresShinIbi ?? false,
    featured: prev?.featured ?? false,
    archiveNote: prev?.archiveNote ?? null,
  };
  if (prev) updated++;
  else added++;
  byId.set(id, article);
}

const result = [...byId.values()];
const blocks = result.reduce((n, a) => n + (a.content?.length || 0), 0);
console.log(`articles: ${result.length} (added ${added}, updated ${updated}) · blocks ${blocks}`);
for (const p of problems) console.warn(`  ! ${p}`);
if (!DRY) {
  fs.writeFileSync(OUT_FILE, JSON.stringify(result, null, 2) + '\n');
  console.log(`written → ${path.relative(ROOT, OUT_FILE)}`);
  console.log('next: npm run validate:bbs');
}
