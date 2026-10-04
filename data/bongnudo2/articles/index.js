// 봉누도 2 · BBS 기사 아카이브
//
// 실제 기사 데이터는 articles.json 하나에 배열로 들어간다 (scripts/import-bbs-articles.mjs 로 생성).
// 기사 본문은 content 블록 배열이며, 배열의 순서가 곧 원본 기사의 순서다.
//   paragraph · image · video · heading · quote · divider · gallery
// 이 파일은 정규화만 한다. 기사 내용을 만들거나 고치지 않는다. 스키마: docs/bongnudo2-archive.md

import raw from './articles.json';
import {archive} from '../meta';
import {peopleById} from '../people';
import {makeSampleArticles} from '../dev/sampleArticles';

// 개발 전용 샘플: `NEXT_PUBLIC_BBS_DEV_SAMPLE=858 npm run dev` 처럼 켰을 때만. production 에서는 절대 포함되지 않는다.
const DEV_SAMPLE_COUNT =
  process.env.NODE_ENV !== 'production' ? Number(process.env.NEXT_PUBLIC_BBS_DEV_SAMPLE || 0) : 0;

const DAY_MS = 86400000;
function dayOf(iso) {
  const start = archive.serverPeriod.start;
  if (!iso || !start) return null;
  const d = Math.floor((new Date(iso.slice(0, 10)) - new Date(start)) / DAY_MS) + 1;
  return d > 0 ? d : null;
}

const arr = (v) => (Array.isArray(v) ? v : []);
const norm = (s) => (s || '').toString().toLowerCase().replace(/\s+/g, ' ');

// ── 블록 ─────────────────────────────
const imageBlock = (b) => ({type: 'image', src: b.src ?? null, originalUrl: b.originalUrl ?? null, width: b.width ?? null, height: b.height ?? null, alt: b.alt ?? null, caption: b.caption ?? null});
const BLOCK = {
  paragraph: (b) => ({type: 'paragraph', text: b.text ?? ''}),
  heading: (b) => ({type: 'heading', text: b.text ?? '', level: b.level ?? 2}),
  quote: (b) => ({type: 'quote', text: b.text ?? '', cite: b.cite ?? null}),
  divider: () => ({type: 'divider'}),
  image: imageBlock,
  video: (b) => ({type: 'video', src: b.src ?? null, poster: b.poster ?? null, originalUrl: b.originalUrl ?? null, width: b.width ?? null, height: b.height ?? null, duration: b.duration ?? null}),
  // 원본에서 여러 이미지가 한 묶음으로 표현된 경우에만
  gallery: (b) => ({type: 'gallery', images: arr(b.images).map(imageBlock), caption: b.caption ?? null}),
};
export const BLOCK_TYPES = Object.keys(BLOCK);
// 모르는 type 은 그대로 보존하고(데이터 손실 방지) 렌더러가 건너뛴다. validate 가 경고한다.
const normalizeBlock = (b) => (BLOCK[b?.type] ? BLOCK[b.type](b) : {...b, unknown: true});

// 예전 형식(body 문자열 + images[] + videos[] + [[image:n]] 표식) → content 블록 (호환용)
function legacyToContent(a) {
  const images = arr(a.images);
  const videos = arr(a.videos);
  const used = {image: new Set(), video: new Set()};
  const out = [];
  String(a.body || '')
    .split(/\n{2,}/)
    .forEach((para) => {
      let last = 0;
      for (const m of para.matchAll(/\[\[(image|video):(\d+)\]\]/g)) {
        const text = para.slice(last, m.index).trim();
        if (text) out.push({type: 'paragraph', text});
        const n = Number(m[2]) - 1;
        const item = m[1] === 'image' ? images[n] : videos[n];
        if (item) {
          used[m[1]].add(n);
          out.push({type: m[1], ...item});
        }
        last = m.index + m[0].length;
      }
      const rest = para.slice(last).trim();
      if (rest) out.push({type: 'paragraph', text: rest});
    });
  images.forEach((im, i) => !used.image.has(i) && out.push({type: 'image', ...im}));
  videos.forEach((v, i) => !used.video.has(i) && out.push({type: 'video', ...v}));
  return out;
}

// ── 블록에서 계산하는 값 (저장하지 않는다) ──
export const getArticleImages = (a) =>
  a.content.flatMap((b) => (b.type === 'image' ? [b] : b.type === 'gallery' ? b.images : [])).filter((im) => im.src);
export const getArticleVideos = (a) => a.content.filter((b) => b.type === 'video' && b.src);
export const getArticleText = (a) =>
  a.content
    .map((b) => (b.type === 'paragraph' || b.type === 'heading' || b.type === 'quote' ? b.text : b.caption || ''))
    .filter(Boolean)
    .join('\n');
export const getArticleThumbnail = (a) => a.thumbnail || getArticleImages(a)[0] || null;

export function normalizeArticle(a) {
  const id = String(a.id ?? a.originalId);
  const content = (Array.isArray(a.content) ? a.content : legacyToContent(a)).map(normalizeBlock);
  // 작성자: authorId 가 기준. 예전 형식 author { id, name } 도 읽는다.
  const authorId = a.authorId ?? a.author?.id ?? null;
  const authorName = peopleById[authorId]?.name ?? a.authorName ?? a.author?.name ?? '';
  const art = {
    id,
    originalId: a.originalId ?? null,
    title: a.title || '',
    category: a.category ?? null,
    authorId,
    author: {id: authorId, name: authorName}, // 화면용 (people.js 에서 이름을 가져온다)
    publishedAt: a.publishedAt ?? null,
    day: a.day ?? dayOf(a.publishedAt),
    content,
    thumbnail: a.thumbnail ? imageBlock(a.thumbnail) : null,
    relatedPeople: arr(a.relatedPeople),
    relatedEvents: arr(a.relatedEvents),
    tags: arr(a.tags),
    likes: a.likes ?? null,
    dislikes: a.dislikes ?? null,
    originalUrl: a.originalUrl ?? null,
    archivedAt: a.archivedAt ?? null,
    rawSource: a.rawSource ?? null, // 원본 HTML 보관 경로 (data/bongnudo2/archive/raw/{id}.html) — 렌더링에 쓰지 않는다
    source: {
      service: archive.sourceName,
      originalId: a.originalId ?? null,
      originalUrl: a.originalUrl ?? null,
      capturedAt: a.archivedAt ?? archive.archiveCapturedAt ?? null,
      ...(a.source || {}),
    },
    isShinIbiArticle: Boolean(a.isShinIbiArticle),
    featuresShinIbi: Boolean(a.featuresShinIbi),
    featured: Boolean(a.featured),
    archiveNote: a.archiveNote ?? null, // PAGES OF RIKO 해설 — 원문과 분리해서 표시
    devSample: Boolean(a.devSample),
  };
  // 목록/검색에서 반복 계산하지 않도록 한 번만 계산해 둔다 (원본 데이터에는 저장하지 않음)
  Object.defineProperties(art, {
    _images: {value: getArticleImages(art)},
    _videos: {value: getArticleVideos(art)},
    _text: {value: getArticleText(art)},
  });
  return art;
}

export const articles = [...arr(raw), ...(DEV_SAMPLE_COUNT ? makeSampleArticles(DEV_SAMPLE_COUNT) : [])].map(normalizeArticle);

// 기자 Archive 주소용 id (people.js 에 없는 기자는 이름으로)
export const reporterKey = (a) => a.authorId || (a.author.name ? `name-${encodeURIComponent(a.author.name)}` : null);

// 목록/검색용 가벼운 색인 (본문 전체 대신 excerpt + 정규화된 검색 문자열)
export function toIndexEntry(a, personName = () => null) {
  const plain = a._text.trim();
  const firstPara = (a.content.find((b) => b.type === 'paragraph' && b.text.trim())?.text || plain).trim();
  return {
    id: a.id,
    title: a.title,
    category: a.category,
    author: a.author,
    reporterKey: reporterKey(a),
    publishedAt: a.publishedAt,
    day: a.day,
    excerpt: firstPara.length > 140 ? firstPara.slice(0, 140).trim() + '…' : firstPara,
    thumb: getArticleThumbnail(a),
    photoCount: a._images.length,
    videoCount: a._videos.length,
    tags: a.tags,
    relatedPeople: a.relatedPeople,
    isShinIbiArticle: a.isShinIbiArticle,
    featuresShinIbi: a.featuresShinIbi,
    originalId: a.originalId,
    searchText: norm([a.title, plain, a.author.name, a.tags.join(' '), a.relatedPeople.map((id) => personName(id) || id).join(' ')].join(' ')),
  };
}
