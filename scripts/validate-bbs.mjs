#!/usr/bin/env node
// 봉누도 2 아카이브 데이터 검사
//   npm run validate:bbs              → 경고만 출력 (종료 코드 0)
//   npm run validate:bbs -- --strict  → 오류가 있으면 종료 코드 1
//   npm run validate:bbs -- --verbose → 참고 정보(원격 미디어 등)까지
//
// 검사: 중복 id · 제목 없음 · 잘못된 publishedAt · 알 수 없는 기자/관련 인물/관련 사건 ·
//       content 블록(모르는 type, src 없는 사진/영상, 빈 본문) · 없는 미디어 파일 · 같은 미디어 중복 ·
//       rawSource 파일 없음 · 깨진 사건↔기사 연결 · 롤링페이퍼 작성자/원문

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadEsmData} from './lib/load-esm-data.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const D = (p) => path.join(ROOT, 'data/bongnudo2', p);
const STRICT = process.argv.includes('--strict');
const VERBOSE = process.argv.includes('--verbose');
const BLOCK_TYPES = new Set(['paragraph', 'image', 'video', 'heading', 'quote', 'divider', 'gallery']);

const articles = JSON.parse(fs.readFileSync(D('articles/articles.json'), 'utf8'));
const {people} = loadEsmData(D('people.js'));
const {events} = loadEsmData(D('events.js'));
const {rollingPapers} = loadEsmData(D('rollingPapers.js'));
const {archive} = loadEsmData(D('meta.js'));

const personIds = new Set(people.map((p) => p.id));
const eventIds = new Set(events.map((e) => e.id));
const issues = [];
const warn = (kind, where, msg) => issues.push({kind, where, msg});

// 예전 형식(body/images/videos)도 검사할 수 있게 블록으로 본다
const blocksOf = (a) =>
  Array.isArray(a.content)
    ? a.content
    : [
        ...(a.body ? [{type: 'paragraph', text: a.body}] : []),
        ...(a.images || []).map((im) => ({type: 'image', ...im})),
        ...(a.videos || []).map((v) => ({type: 'video', ...v})),
      ];

const seen = new Map();
const mediaSeen = new Map();
const checkMedia = (m, where, id, kind) => {
  if (!m.src) {
    warn(kind === 'video' ? 'warn' : 'error', where, `${kind} 블록에 src 가 없습니다${m.originalUrl ? ` (원본: ${m.originalUrl})` : ''}`);
    return;
  }
  if (m.src.startsWith('/')) {
    if (!fs.existsSync(path.join(ROOT, 'public', decodeURIComponent(m.src)))) warn('error', where, `미디어 파일 없음: public${m.src}`);
    if (mediaSeen.has(m.src) && mediaSeen.get(m.src) !== id) warn('warn', where, `같은 미디어가 기사 ${mediaSeen.get(m.src)} 에도 있음: ${m.src}`);
    mediaSeen.set(m.src, id);
  } else if (/^https?:/.test(m.src)) {
    warn('info', where, `원격 미디어 (서버 종료 시 사라질 수 있음 → --download 권장): ${m.src}`);
  }
};

for (const a of articles) {
  const id = String(a.id ?? a.originalId ?? '');
  const where = `article ${id || '(no id)'}`;
  if (!id) warn('error', where, 'id 가 없습니다');
  if (seen.has(id)) warn('error', where, `중복 id (첫 번째: index ${seen.get(id)})`);
  seen.set(id, articles.indexOf(a));
  if (!a.title || !String(a.title).trim()) warn('error', where, '제목이 없습니다');
  if (a.publishedAt && Number.isNaN(new Date(String(a.publishedAt).replace(' ', 'T')).getTime())) warn('error', where, `publishedAt 형식 오류: ${a.publishedAt}`);
  if (!a.publishedAt) warn('info', where, 'publishedAt 없음');
  const authorId = a.authorId ?? a.author?.id ?? null;
  if (authorId && !personIds.has(authorId)) warn('warn', where, `알 수 없는 기자 id: ${authorId} (people.js 에 추가하거나 authorName 으로)`);
  if (!authorId && !(a.authorName || a.author?.name)) warn('warn', where, '기자 정보가 없습니다');
  if (a.isShinIbiArticle && authorId && authorId !== 'shin-ibi') warn('warn', where, `isShinIbiArticle 인데 기자가 ${authorId}`);
  for (const p of a.relatedPeople || []) if (!personIds.has(p)) warn('warn', where, `알 수 없는 관련 인물: ${p}`);
  for (const e of a.relatedEvents || []) if (!eventIds.has(e)) warn('error', where, `알 수 없는 관련 사건: ${e}`);
  if (a.rawSource && !fs.existsSync(path.join(ROOT, a.rawSource))) warn('warn', where, `rawSource 파일 없음: ${a.rawSource}`);
  if (a.thumbnail) checkMedia(a.thumbnail, where, id, 'thumbnail');

  const blocks = blocksOf(a);
  if (!blocks.length) warn('warn', where, '본문(content)이 비어 있습니다');
  blocks.forEach((b, i) => {
    const at = `${where} · block ${i + 1}`;
    if (!BLOCK_TYPES.has(b?.type)) return warn('error', at, `모르는 블록 type: ${b?.type} (렌더링되지 않음)`);
    if ((b.type === 'paragraph' || b.type === 'heading' || b.type === 'quote') && !String(b.text || '').trim()) warn('info', at, `빈 ${b.type}`);
    if (b.type === 'image' || b.type === 'video') checkMedia(b, at, id, b.type);
    if (b.type === 'gallery') {
      if (!(b.images || []).length) warn('error', at, 'gallery 에 사진이 없습니다');
      (b.images || []).forEach((im) => checkMedia(im, at, id, 'image'));
    }
  });
}

for (const e of events) {
  for (const aid of e.articleIds || []) if (!seen.has(String(aid))) warn('error', `event ${e.id}`, `없는 기사 id: ${aid}`);
  for (const p of e.people || []) if (!personIds.has(p)) warn('warn', `event ${e.id}`, `알 수 없는 인물: ${p}`);
}
// 사람 · 관계 · NEWSROOM STORIES · 보도국 입장 기록
const {newsroomStories, STORY_TYPES} = loadEsmData(D('newsroomStories.js'));
const {politicsDays} = loadEsmData(D('politics.js'));
const storyIds = new Set(newsroomStories.map((s) => s.id));
const VERIFICATION = new Set(['confirmed', 'partial', 'unverified']);
for (const p of people) {
  if (!p.name) warn('error', `person ${p.id}`, '이름이 없습니다');
  for (const r of p.relationships || []) {
    const where = `person ${p.id} → ${r.personId}`;
    if (!personIds.has(r.personId)) warn('error', where, `관계 대상이 people.js 에 없음: ${r.personId}`);
    if (r.personId === p.id) warn('error', where, '자기 자신과의 관계');
    if (!r.summary) warn('warn', where, '관계 summary 가 비어 있습니다');
    for (const sid of r.storyIds || []) if (!storyIds.has(sid)) warn('error', where, `없는 story id: ${sid}`);
    for (const e of r.eventIds || []) if (!eventIds.has(e)) warn('error', where, `없는 event id: ${e}`);
    for (const aid of r.articleIds || []) if (!seen.has(String(aid))) warn('warn', where, `없는 기사 id: ${aid}`);
  }
}
for (const s of newsroomStories) {
  const where = `story ${s.id}`;
  if (!STORY_TYPES[s.type]) warn('error', where, `모르는 story type: ${s.type}`);
  if (!s.title) warn('error', where, '제목이 없습니다');
  if (s.verification && !VERIFICATION.has(s.verification)) warn('warn', where, `verification 값 확인: ${s.verification}`);
  for (const id of [...(s.people || []), ...(s.contrast?.people || [])]) if (!personIds.has(id)) warn('error', where, `알 수 없는 인물: ${id}`);
  for (const aid of [...(s.articleIds || []), ...(s.steps || []).flatMap((st) => st.articleIds || [])]) if (!seen.has(String(aid))) warn('warn', where, `없는 기사 id: ${aid}`);
  for (const e of s.eventIds || []) if (!eventIds.has(e)) warn('error', where, `없는 event id: ${e}`);
  if (s.verification !== 'confirmed' && !(s.articleIds || []).length && !(s.clipUrls || []).length) warn('info', where, '원자료(BBS 기사·클립) 연결 전');
}
// DAY 14 종군 장면은 입장 기록과 같은 구성원이어야 한다
const war = newsroomStories.find((s) => s.id === 'day14-war-correspondents');
const warDay = politicsDays.find((d) => d.id === 'day14');
if (war && warDay) {
  const key = (l) => [...l].sort().join(',');
  const corr = warDay.groups.find((g) => g.id === 'war-correspondent');
  if (corr && key(corr.members) !== key(war.people)) warn('warn', 'story day14-war-correspondents', 'politics.js DAY 14 종군기자 구성과 다릅니다');
}
for (const d of politicsDays) for (const g of d.groups) for (const id of g.members) if (!personIds.has(id)) warn('error', `politics ${d.id}`, `알 수 없는 인물: ${id}`);

for (const r of rollingPapers) {
  if (!personIds.has(r.fromPersonId)) warn('error', `letter ${r.id}`, `알 수 없는 작성자: ${r.fromPersonId}`);
  if (!r.body || !r.body.trim()) warn('error', `letter ${r.id}`, '원문(body)이 비어 있습니다');
}

const count = (k) => issues.filter((i) => i.kind === k).length;
for (const i of issues.filter((x) => x.kind !== 'info' || VERBOSE)) console.log(`[${i.kind.toUpperCase()}] ${i.where}: ${i.msg}`);
const blocks = articles.reduce((n, a) => n + blocksOf(a).length, 0);
console.log(`\narticles ${articles.length} / source ${archive.totalExpectedArticles} · blocks ${blocks} · people ${people.length} · events ${events.length} · letters ${rollingPapers.length}`);
console.log(`errors ${count('error')} · warnings ${count('warn')} · info ${count('info')}${count('info') && !VERBOSE ? ' (--verbose 로 보기)' : ''}`);
if (STRICT && count('error')) process.exit(1);
