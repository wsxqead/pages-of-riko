// BBS HTML 해석 — 원본 HTML 은 건드리지 않고 읽기만 한다.
// 실패해도 원본(raw HTML)은 이미 저장되어 있으므로 언제든 다시 해석할 수 있다.
import {parse} from 'node-html-parser';

export const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

// ── 접근 정책 신호 ───────────────────────
export function robotsMeta(html) {
  const root = parse(html);
  const out = {};
  for (const m of root.querySelectorAll('meta')) {
    const name = (m.getAttribute('name') || '').toLowerCase();
    if (name === 'robots' || name === 'googlebot' || name === 'bingbot') {
      out[name] = [...new Set([...(out[name] || []), ...(m.getAttribute('content') || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)])];
    }
  }
  const all = Object.values(out).flat();
  return {directives: out, restrictsArchiving: all.includes('noarchive') || all.includes('none'), restrictsFollowing: all.includes('nofollow') || all.includes('none')};
}

// robots.txt — User-agent: * 또는 우리 UA 에 /bbs 가 Disallow 면 차단 (덮어쓰기 옵션 없음)
export function robotsTxtBlocks(txt, path, ua) {
  if (!txt) return false;
  let applies = false;
  let blocked = false;
  for (const line of txt.split(/\r?\n/)) {
    const [k, ...rest] = line.split(':');
    const v = rest.join(':').trim();
    if (/^user-agent$/i.test(k.trim())) applies = v === '*' || ua.toLowerCase().includes(v.toLowerCase());
    else if (applies && /^disallow$/i.test(k.trim()) && v && path.startsWith(v)) blocked = true;
  }
  return blocked;
}

// ── Next.js RSC 데이터 (self.__next_f.push) ──
export function readRsc(html) {
  let out = '';
  const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  let m;
  while ((m = re.exec(html))) {
    try {
      out += JSON.parse(m[1]);
    } catch {}
  }
  return out;
}

// 문자열 안의 균형 잡힌 JSON 객체 하나를 읽는다
function balancedObject(text, start) {
  let depth = 0;
  let inStr = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (c === '\\') i++;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

// RSC 안에서 id 가 일치하는 객체 (기사 객체) — 가장 작은 것을 고른다
export function findObjectById(rsc, id) {
  const key = `"id":"${id}"`;
  let at = rsc.indexOf(key);
  const found = [];
  while (at >= 0 && found.length < 5) {
    for (let s = at, tries = 0; s >= 0 && tries < 6; tries++) {
      s = rsc.lastIndexOf('{', s - 1);
      if (s < 0) break;
      const seg = balancedObject(rsc, s);
      if (seg && seg.includes(key)) {
        try {
          const obj = JSON.parse(seg);
          if (obj && obj.id === id) {
            found.push(obj);
            break;
          }
        } catch {}
      }
    }
    at = rsc.indexOf(key, at + key.length);
  }
  // 같은 id 객체가 여러 개면 정보가 가장 많은 것(본문·미디어 포함)을 쓴다
  return found.sort((a, b) => JSON.stringify(b).length - JSON.stringify(a).length)[0] || null;
}

// ── 목록 ────────────────────────────────
export function discoverLinks(html, listUrl) {
  const root = parse(html);
  const seen = new Set();
  const links = [];
  for (const a of root.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (!href.includes('/bbs/article/')) continue;
    const url = new URL(href, listUrl);
    const id = url.pathname.match(UUID)?.[0]?.toLowerCase();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    links.push({id, url: `${url.origin}/bbs/article/${id}`, discoveredFrom: listUrl});
  }
  // 목록 RSC 의 기사 요약(제목·기자) — 드라이런 출력과 대조용
  const rsc = readRsc(html);
  const summary = {};
  for (const l of links) {
    const o = findObjectById(rsc, l.id);
    if (o) summary[l.id] = {title: o.title ?? null, author: o.author ?? null, approvedAt: o.approvedAt ?? null};
  }
  return {links, summary, pagination: detectPagination(html, root, rsc)};
}

function detectPagination(html, root, rsc) {
  const hrefs = root.querySelectorAll('a[href]').map((a) => a.getAttribute('href'));
  const pageHrefs = hrefs.filter((h) => /[?&](page|p|cursor|offset)=/.test(h));
  const total = rsc.match(/"total":(\d+)/)?.[1];
  const totalPages = rsc.match(/"totalPages":(\d+)/)?.[1];
  const pageSize = rsc.match(/"pageSize":(\d+)/)?.[1];
  const loadMore = /더\s?보기|load more/i.test(root.text);
  return {
    hrefPagination: pageHrefs.length > 0,
    pageHrefs: pageHrefs.slice(0, 5),
    rscTotal: total ? Number(total) : null,
    rscTotalPages: totalPages ? Number(totalPages) : null,
    rscPageSize: pageSize ? Number(pageSize) : null,
    loadMoreButton: loadMore,
    rscInitialArticles: rsc.includes('"initialArticles"'),
    categoryFilters: [...new Set(hrefs.filter((h) => /[?&]category=/.test(h)))].length,
  };
}

// ── 날짜 ────────────────────────────────
const pad = (n) => String(n).padStart(2, '0');
// "승인 2026. 10. 4. 02:35" → 원문 + KST 정규화
export function parseApprovedText(text) {
  const m = text?.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return {raw: m[0], iso: `${m[1]}-${pad(m[2])}-${pad(m[3])}T${pad(m[4])}:${m[5]}:00+09:00`};
}
// ISO(+00:00 등) → 같은 순간의 KST 표기
export function toKstIso(iso) {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const d = new Date(t + 9 * 3600 * 1000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}+09:00`;
}

// ── 미디어 URL ──────────────────────────
const abs = (u, base) => {
  try {
    return new URL(u, base).href;
  } catch {
    return null;
  }
};
// srcset 중 가장 큰 후보
function largestFromSrcset(srcset, base) {
  const c = srcset
    .split(',')
    .map((s) => s.trim().split(/\s+/))
    .filter(([u]) => u)
    .map(([u, d = '1x']) => ({u, n: parseFloat(d) * (d.endsWith('w') ? 1 : 1000)}));
  c.sort((a, b) => b.n - a.n);
  return c[0] ? abs(c[0].u, base) : null;
}
// Next/Image (/_next/image?url=...) → 원본 URL
function unwrapNextImage(u, base) {
  try {
    const x = new URL(u, base);
    if (x.pathname.endsWith('/_next/image') && x.searchParams.get('url')) return abs(x.searchParams.get('url'), base);
  } catch {}
  return u;
}
const isVideoUrl = (u) => /\.(mp4|webm|mov|m4v|m3u8)(\?|#|$)/i.test(u || '');

function imageBlock(img, base, picture = null) {
  const written = img.getAttribute('src') || null;
  const cands = [
    img.getAttribute('data-original'),
    img.getAttribute('data-src'),
    img.getAttribute('data-lazy-src'),
    img.getAttribute('srcset') && largestFromSrcset(img.getAttribute('srcset'), base),
    picture && picture.querySelectorAll('source[srcset]').map((s) => largestFromSrcset(s.getAttribute('srcset'), base))[0],
    written,
  ].filter(Boolean);
  const sourceUrl = abs(written || cands[0], base);
  const resolvedUrl = cands.length ? unwrapNextImage(abs(cands[0], base), base) : null;
  return {
    type: 'image',
    sourceUrl,
    resolvedUrl,
    alt: img.getAttribute('alt') || null,
    attrWidth: Number(img.getAttribute('width')) || null,
    attrHeight: Number(img.getAttribute('height')) || null,
  };
}

function videoBlock(v, base) {
  const sources = [v, ...v.querySelectorAll('source')];
  let sourceUrl = null;
  let resolvedUrl = null;
  for (const s of sources) {
    for (const a of ['src', 'data-src', 'data-original', 'data-video', 'data-url']) {
      const val = s.getAttribute(a);
      if (!val) continue;
      if (!sourceUrl) sourceUrl = val.startsWith('blob:') ? val : abs(val, base);
      if (!val.startsWith('blob:') && !resolvedUrl) resolvedUrl = abs(val, base);
    }
  }
  // blob: 이고 속성에서 실제 주소를 못 찾았으면 data-* 전체를 훑는다
  if (!resolvedUrl) {
    for (const [k, val] of Object.entries(v.attributes)) if (k.startsWith('data-') && /^https?:|^\//.test(val) && isVideoUrl(val)) resolvedUrl = abs(val, base);
  }
  return {type: 'video', sourceUrl, resolvedUrl, poster: v.getAttribute('poster') ? abs(v.getAttribute('poster'), base) : null};
}

const SKIP = new Set(['script', 'style', 'noscript', 'svg', 'button', 'nav', 'template', 'head']);
const BLOCK = new Set(['p', 'div', 'section', 'article', 'li', 'ul', 'ol', 'figure', 'figcaption', 'table', 'tr', 'header', 'footer', 'main', 'aside', 'pre']);

// 콘텐츠 루트 안을 DOM 순서대로 걸으며 sourceBlocks 를 만든다
export function blocksFromDom(rootEl, base) {
  const blocks = [];
  let text = '';
  let mode = null; // heading level | 'quote'
  const flush = () => {
    const t = text.replace(/[ \t\f\v\r]+/g, ' ').replace(/ *\n */g, '\n').trim();
    text = '';
    if (!t) return;
    if (typeof mode === 'number') blocks.push({type: 'heading', text: t, level: mode});
    else if (mode === 'quote') blocks.push({type: 'quote', text: t});
    else blocks.push({type: 'paragraph', text: t});
  };
  const walk = (n) => {
    if (n.nodeType === 3) {
      text += n.text; // 엔티티 해제된 텍스트
      return;
    }
    if (n.nodeType !== 1) return;
    const tag = n.rawTagName?.toLowerCase();
    if (!tag || SKIP.has(tag)) return;
    if (tag === 'br') return void (text += '\n');
    if (tag === 'hr') return void (flush(), blocks.push({type: 'divider'}));
    if (tag === 'img') return void (flush(), blocks.push(imageBlock(n, base)));
    if (tag === 'picture') {
      const img = n.querySelector('img');
      flush();
      if (img) blocks.push(imageBlock(img, base, n));
      return;
    }
    if (tag === 'video') return void (flush(), blocks.push(videoBlock(n, base)));
    if (tag === 'iframe' || tag === 'embed' || tag === 'object') {
      flush();
      blocks.push({type: 'embed', sourceUrl: abs(n.getAttribute('src') || n.getAttribute('data') || '', base), tag});
      return;
    }
    const h = tag.match(/^h([1-6])$/);
    if (h || tag === 'blockquote') {
      flush();
      const prev = mode;
      mode = h ? (Number(h[1]) <= 2 ? 2 : 3) : 'quote';
      n.childNodes.forEach(walk);
      flush();
      mode = prev;
      return;
    }
    const isBlock = BLOCK.has(tag);
    if (isBlock) flush();
    n.childNodes.forEach(walk);
    if (isBlock) flush();
  };
  rootEl.childNodes.forEach(walk);
  flush();
  return blocks;
}

const looksHtml = (s) => /<(p|div|img|br|video|span|figure|h\d)\b/i.test(s || '');

// RSC media[] 항목 (형태 미확인 → 문자열/객체 모두 받는다)
function rscMediaItem(m, base) {
  const url = typeof m === 'string' ? m : m?.url || m?.src || m?.originalUrl || m?.path || null;
  if (!url) return null;
  const mime = typeof m === 'object' ? m.mimeType || m.type || '' : '';
  const type = /video/.test(mime) || isVideoUrl(url) ? 'video' : 'image';
  return {type, sourceUrl: abs(url, base), resolvedUrl: abs(url, base), fromRsc: true};
}

// ── 기사 1건 해석 ───────────────────────
export function parseArticle(html, {id, url, selectors}) {
  const root = parse(html, {comment: false});
  const rsc = readRsc(html);
  const obj = findObjectById(rsc, id);
  const sel = selectors || {};
  const pick = (s) => (s ? root.querySelector(s)?.text.trim() || null : null);
  const source = {};
  const take = (k, rscVal, domVal) => {
    const v = rscVal ?? domVal ?? null;
    source[k] = rscVal != null ? 'rsc' : domVal != null ? 'dom' : null;
    return v;
  };

  const title = take('title', obj?.title, pick(sel.title) ?? root.querySelector('h1')?.text.trim() ?? null);
  const author = take('author', obj?.author, pick(sel.author));
  const category = take('category', obj?.category, null);
  const authorStreamerName = obj?.authorStreamerName ?? null;
  // 승인 시각: 화면 원문("승인 …")과 RSC ISO 를 모두 본다
  const approvedTextEl = sel.approvedAt ? root.querySelector(sel.approvedAt) : null;
  const scope = sel.article ? root.querySelector(sel.article)?.parentNode || root : root;
  const fromText = parseApprovedText(approvedTextEl?.text) || parseApprovedText((scope.text.match(/승인\s*\d{4}\.[^\n]{0,20}/) || [])[0]);
  const approvedAtRaw = approvedTextEl?.text.trim() || fromText?.raw || null;
  const approvedAt = obj?.approvedAt ? toKstIso(obj.approvedAt) : fromText?.iso || null;
  source.approvedAt = obj?.approvedAt ? 'rsc' : fromText ? 'dom' : null;

  // 본문 블록: 1) 확인된 콘텐츠 루트(DOM)  2) RSC 의 content  3) 없으면 해석 실패
  let blocks = [];
  let blocksSource = null;
  const contentRoot = sel.article ? root.querySelector(sel.article) : null;
  if (contentRoot) {
    blocks = blocksFromDom(contentRoot, url);
    blocksSource = 'dom';
  } else if (obj?.content) {
    blocks = looksHtml(obj.content)
      ? blocksFromDom(parse(obj.content), url)
      : String(obj.content).split(/\n{2,}/).map((t) => t.trim()).filter(Boolean).map((t) => ({type: 'paragraph', text: t}));
    blocksSource = 'rsc-content';
  }
  // RSC media[] 중 본문에 없는 것은 끝에 붙이되 "순서 미확인"으로 표시
  const inBlocks = new Set(blocks.filter((b) => b.resolvedUrl).map((b) => b.resolvedUrl));
  for (const m of obj?.media || []) {
    const it = rscMediaItem(m, url);
    if (it && !inBlocks.has(it.resolvedUrl)) blocks.push({...it, orderKnown: false});
  }
  // 대표 이미지
  let cover = null;
  const coverEl = sel.cover ? root.querySelector(sel.cover) : null;
  if (coverEl) cover = imageBlock(coverEl, url).resolvedUrl;
  else if (obj?.thumbnailUrl) cover = abs(obj.thumbnailUrl, url);

  const parseSuccess = Boolean(title) && blocks.length > 0;
  return {
    meta: {title, author, authorStreamerName, category, approvedAtRaw, approvedAt, metaSource: source},
    blocks,
    blocksSource,
    cover,
    rscArticleFound: Boolean(obj),
    contentRootFound: Boolean(contentRoot),
    parseSuccess,
    parseError: parseSuccess ? null : !blocks.length ? (sel.article ? 'content root not found and no RSC content' : 'no confirmed selector and no RSC content') : 'title not found',
  };
}
