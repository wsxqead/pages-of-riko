// BBS 원본 기사 HTML → content 블록 (원본 DOM 순서 보존)
// 의존성 없이 태그를 앞에서부터 순서대로 읽는다.
//   <p>/<div>/<br> 텍스트 → paragraph   <img> → image   <video>/<source> → video
//   <h1~h6> → heading   <blockquote> → quote   <hr> → divider
// 원본에서 사진 여러 장이 한 묶음 요소(class 에 gallery/slide/swiper/album 포함)로 감싸져 있을 때만 gallery 로 묶는다.
// 모르는 요소(iframe 등)는 버리지 않고 report 에 남긴다 → 원본 HTML 은 rawSource 로 따로 보관.

const ENT = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'"};
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENT[e.toLowerCase()] ?? m;
  });
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? decode(m[2] ?? m[3] ?? m[4] ?? '') : null;
};
const num = (v) => (v && /^\d+$/.test(v) ? Number(v) : null);

const BLOCK_BREAK = /^(p|div|section|article|li|ul|ol|table|tr|figure|figcaption|center)$/i;
const GALLERY_HINT = /(gallery|slide|swiper|album|carousel)/i;

export function htmlToBlocks(html, {resolve = (u) => u} = {}) {
  const blocks = [];
  const report = {unknown: new Set()};
  let text = '';
  let heading = null; // {level}
  let quote = false;
  let galleryDepth = 0;
  let gallery = null;
  const stack = [];

  const flush = () => {
    const t = text.replace(/[ \t\f\v\r]+/g, ' ').replace(/ *\n */g, '\n').trim();
    text = '';
    if (!t) return;
    if (heading) blocks.push({type: 'heading', text: t, level: heading.level});
    else if (quote) blocks.push({type: 'quote', text: t});
    else blocks.push({type: 'paragraph', text: t});
  };
  const pushImage = (img) => (gallery ? gallery.images.push(img) : blocks.push(img));

  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z0-9]+)([^>]*)>|([^<]+)/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[4] != null) {
      text += decode(m[4]);
      continue;
    }
    if (!m[2]) continue;
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    const full = m[0];
    if (tag === 'script' || tag === 'style') {
      const end = html.indexOf(`</${tag}`, re.lastIndex);
      re.lastIndex = end < 0 ? html.length : html.indexOf('>', end) + 1;
      continue;
    }
    if (tag === 'br') {
      text += '\n';
      continue;
    }
    if (/^h[1-6]$/.test(tag)) {
      flush();
      heading = closing ? null : {level: Number(tag[1]) <= 2 ? 2 : 3};
      continue;
    }
    if (tag === 'blockquote') {
      flush();
      quote = !closing;
      continue;
    }
    if (tag === 'hr') {
      flush();
      blocks.push({type: 'divider'});
      continue;
    }
    if (tag === 'img' && !closing) {
      flush();
      const src = attr(full, 'src') || attr(full, 'data-src');
      if (src) pushImage({type: 'image', src: resolve(src, 'image'), originalUrl: src, width: num(attr(full, 'width')), height: num(attr(full, 'height')), alt: attr(full, 'alt') || null, caption: null});
      continue;
    }
    if (tag === 'video' && !closing) {
      flush();
      const src = attr(full, 'src');
      blocks.push({type: 'video', src: src ? resolve(src, 'video') : null, poster: attr(full, 'poster'), originalUrl: src, width: num(attr(full, 'width')), height: num(attr(full, 'height'))});
      continue;
    }
    if (tag === 'source' && !closing) {
      const last = blocks[blocks.length - 1];
      const src = attr(full, 'src');
      if (last?.type === 'video' && !last.src && src) Object.assign(last, {src: resolve(src, 'video'), originalUrl: src});
      continue;
    }
    if (tag === 'iframe' || tag === 'embed' || tag === 'object') {
      if (closing) continue;
      flush();
      report.unknown.add(`${tag}${attr(full, 'src') ? ' ' + attr(full, 'src') : ''}`);
      continue;
    }
    if (BLOCK_BREAK.test(tag)) {
      flush();
      if (!closing) {
        const isGallery = GALLERY_HINT.test(attr(full, 'class') || '');
        stack.push(isGallery);
        if (isGallery && galleryDepth++ === 0) gallery = {type: 'gallery', images: [], caption: null};
      } else if (stack.length) {
        if (stack.pop() && --galleryDepth === 0 && gallery) {
          if (gallery.images.length > 1) blocks.push(gallery);
          else blocks.push(...gallery.images); // 사진 한 장뿐이면 일반 image
          gallery = null;
        }
      }
    }
  }
  flush();
  if (gallery) blocks.push(...gallery.images);
  return {blocks, unknown: [...report.unknown]};
}
