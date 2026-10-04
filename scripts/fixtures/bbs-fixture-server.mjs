#!/usr/bin/env node
// BBS 백업기 시험용 로컬 서버 — 실제 사이트에 요청하지 않고 파이프라인 전체를 검증한다.
// 실제 사이트의 기사 내용이 아니다 (제목·본문은 모두 FIXTURE 로 표시). 목록 구조만 실제 관찰을 따랐다:
//   <a href="/bbs/article/{UUID}"> + RSC initialArticles{ id,title,author,authorStreamerName,approvedAt,thumbnailUrl,media } + total/totalPages
//
//   node scripts/fixtures/bbs-fixture-server.mjs [port] [stateDir]
//   stateDir/fail-toggle  가 있으면 /cdn/toggle.png 가 500 (--retry-failed 시험)
//   FIXTURE_VIDEO=<mp4 경로> 가 있으면 그 파일을 영상으로 쓴다 (없으면 작은 MP4 형식 바이트)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import os from 'node:os';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PORT = Number(process.argv[2] || 3199);
const STATE = path.resolve(process.argv[3] || path.join(os.tmpdir(), 'bbs-fixture-state'));
fs.mkdirSync(STATE, {recursive: true});
const ORIGIN = `http://localhost:${PORT}`;

const ID = {
  A: '0a0a0a0a-1111-4111-8111-aaaaaaaaaaaa',
  B: '0b0b0b0b-2222-4222-8222-bbbbbbbbbbbb',
  C: '0c0c0c0c-3333-4333-8333-cccccccccccc',
  D: '0d0d0d0d-4444-4444-8444-dddddddddddd', // 404
  E: '0e0e0e0e-5555-4555-8555-eeeeeeeeeeee', // 콘텐츠 루트 없음 → RSC 본문만
};

// ── 생성 이미지 (PNG, 크기 지정) ────────
const crcTable = Array.from({length: 256}, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (b) => {
  let c = 0xffffffff;
  for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};
function png(w, h, seed) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const row = Buffer.alloc(1 + w * 3);
  const rows = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) row.set([(x + seed * 40) % 256, (y + seed * 70) % 256, (seed * 90) % 256], 1 + x * 3);
    rows.push(Buffer.from(row));
  }
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(Buffer.concat(rows))), chunk('IEND', Buffer.alloc(0))]);
}
const VIDEO = process.env.FIXTURE_VIDEO && fs.existsSync(process.env.FIXTURE_VIDEO) ? fs.readFileSync(process.env.FIXTURE_VIDEO) : Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from('ftypmp42'), Buffer.alloc(12), Buffer.alloc(4096)]);
const realJpeg = fs.readFileSync(path.join(ROOT, 'public/images/goaon.jpg'));
const realWebp = fs.readFileSync(path.join(ROOT, 'public/images/pages/goaon/logo.webp'));

// ── 페이지 ──────────────────────────────
const rscScript = (obj) => `<script>self.__next_f.push([1,${JSON.stringify(`1c:${JSON.stringify(obj)}\n`)}])</script>`;
const shell = (body, rsc = '') => `<!DOCTYPE html><html lang="ko"><head><meta charSet="utf-8"/><meta name="robots" content="noindex, nofollow, noarchive"/><title>FIXTURE BBS</title></head>
<body><header><a href="/"><img src="/static/site-logo.png" alt="logo"></a><nav><a href="/bbs">BBS</a><a href="/bbs?category=%EC%A0%95%EB%B3%B4">정보</a></nav></header>
<main>${body}</main><footer><img src="/static/footer-icon.png" alt=""></footer>${rsc}</body></html>`;

const art = {
  [ID.A]: {id: ID.A, category: '정보', title: '[FIXTURE] 기자 신이비에게 모든 소식을 🎤✨', author: '신이비', authorStreamerName: '유즈하 리코', approvedAt: '2026-10-03T17:35:00+00:00', thumbnailUrl: `${ORIGIN}/cdn/img/cover-a.png?w=640&h=360`, media: []},
  [ID.B]: {id: ID.B, category: '칼럼', title: '[FIXTURE] 문단과 사진이 번갈아', author: '명총희', authorStreamerName: '시라유키 히나', approvedAt: '2026-10-02T12:00:00+00:00', thumbnailUrl: `${ORIGIN}/cdn/img/b1.png?w=800&h=600`, media: []},
  [ID.C]: {id: ID.C, category: '칼럼', title: '[FIXTURE] 사진이 많고 영상이 있는 기사', author: '피터장파커', authorStreamerName: '장마군', approvedAt: '2026-10-03T18:36:20+00:00', thumbnailUrl: `${ORIGIN}/cdn/real.jpg`, media: []},
  [ID.E]: {id: ID.E, category: '기타', title: '[FIXTURE] 본문이 RSC 에만 있는 기사', author: '밥돼길', authorStreamerName: '티뭉', approvedAt: '2026-10-01T03:00:00+00:00', thumbnailUrl: null, content: '<p>RSC 첫 문단 😀</p><p><img src="/cdn/img/e1.png?w=300&h=200"></p><p>RSC 둘째 문단</p>', media: [{url: `${ORIGIN}/cdn/img/e-extra.png?w=120&h=90`, type: 'image'}]},
};

const page = {
  [ID.A]: `<div class="bbs-head"><h1 class="bbs-title">${art[ID.A].title}</h1><p class="byline"><img class="avatar" src="/static/avatar.png"><span class="bbs-author">신이비</span> · <span class="bbs-approved">승인 2026. 10. 4. 02:35</span></p></div>
<figure class="bbs-cover"><img src="/cdn/img/cover-a.png?w=640&h=360" alt="대표"></figure>
<article data-bbs-content><p>첫 문단입니다. 한글과 이모지 😂🔥 그리고 &amp; 기호.</p><p>둘째 문단<br>줄바꿈 있음.</p></article>`,
  [ID.B]: `<h1 class="bbs-title">${art[ID.B].title}</h1><p><span class="bbs-author">명총희</span> <span class="bbs-approved">승인 2026. 10. 2. 21:00</span></p>
<article data-bbs-content><p>TEXT 1</p><p><img src="/_next/image?url=%2Fcdn%2Fimg%2Fb1.png%3Fw%3D800%26h%3D600&amp;w=1080&amp;q=75"></p><p>TEXT 2</p>
<div><img data-src="/cdn/img/b2.png?w=600&h=900" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></div><p>TEXT 3</p>
<img srcset="/cdn/img/b3-small.png?w=200&h=100 200w, /cdn/img/b3.png?w=1000&h=500 1000w"><p>TEXT 4</p></article>`,
  [ID.C]: `<h1 class="bbs-title">${art[ID.C].title}</h1><p><span class="bbs-author">피터장파커</span> <span class="bbs-approved">승인 2026. 10. 4. 03:36</span></p>
<article data-bbs-content><h2>소제목</h2><p>도입 문단</p>
${Array.from({length: 18}, (_, k) => `<p><img src="/cdn/img/c${k + 1}.png?w=${300 + k * 20}&h=${200 + (k % 5) * 60}" alt="사진 ${k + 1}"></p>${k % 6 === 5 ? `<p>중간 문단 ${k}</p>` : ''}`).join('\n')}
<p><img src="/cdn/img/c1.png?w=300&h=200" alt="같은 사진 다시"></p>
<picture><source srcset="/cdn/img/c-pic.png?w=1200&h=800 2x, /cdn/img/c-pic-s.png?w=600&h=400 1x"><img src="/cdn/img/c-pic-s.png?w=600&h=400"></picture>
<p><img src="/cdn/real.jpg"></p><p><img src="/cdn/real.webp"></p>
<p><img src="/cdn/redirect/c-r.png"></p>
<p><img src="/cdn/flaky.png"></p>
<p><img src="/cdn/toggle.png"></p>
<p><img src="/cdn/broken.jpg"></p>
<p>영상 앞 문단</p>
<video controls poster="/cdn/img/poster.png?w=640&h=360"><source src="/cdn/slow-video.mp4" type="video/mp4"></video>
<p>영상 뒤 문단</p>
<video src="blob:${ORIGIN}/9a8b" data-src="/cdn/clip2.mp4"></video>
<video src="blob:${ORIGIN}/ffff"></video>
<video src="/cdn/huge.mp4"></video>
<iframe src="https://www.youtube.com/embed/fixture"></iframe>
<blockquote>인용문</blockquote><hr><p>마지막 문단</p></article>`,
  [ID.E]: `<h1>${art[ID.E].title}</h1><div class="somewhere-else"><p>승인 2026. 10. 1. 12:00</p></div>`,
};

let hits = {};
const once = (k) => (hits[k] = (hits[k] || 0) + 1);

const server = http.createServer((req, res) => {
  const u = new URL(req.url, ORIGIN);
  const p = u.pathname;
  const send = (code, type, body, extra = {}) => {
    res.writeHead(code, {'content-type': type, ...extra});
    res.end(body);
  };
  if (req.headers.cookie) console.warn('! cookie received (should never happen)');
  if (p === '/robots.txt') return send(404, 'text/html; charset=utf-8', '<html>404</html>');
  if (p === '/bbs') {
    const list = [ID.A, ID.B, ID.C].map((id) => art[id]);
    const anchors = list.map((a) => `<a href="/bbs/article/${a.id}"><b>${a.title}</b> ${a.author}</a>`).join('');
    return send(200, 'text/html; charset=utf-8', shell(`<section>${anchors}<a href="/bbs/article/${ID.A}">dup</a></section>`, rscScript({initialArticles: list.map(({content, ...x}) => ({...x, content: ''})), total: 3, totalPages: 1})));
  }
  const m = p.match(/^\/bbs\/article\/([0-9a-f-]{36})$/);
  if (m) {
    const id = m[1];
    if (id === ID.D || !page[id]) return send(404, 'text/html; charset=utf-8', '<html>404</html>');
    if (id === ID.B && once('b-429') === 1) return send(429, 'text/plain', 'slow down', {'retry-after': '1'});
    return send(200, 'text/html; charset=utf-8', shell(page[id], rscScript({article: art[id]})));
  }
  if (p.startsWith('/cdn/img/')) {
    const w = Number(u.searchParams.get('w') || 64);
    const h = Number(u.searchParams.get('h') || 64);
    return send(200, 'image/png', png(Math.min(w, 1600), Math.min(h, 1600), p.length + w));
  }
  if (p === '/cdn/real.jpg') return send(200, 'image/jpeg', realJpeg);
  if (p === '/cdn/real.webp') return send(200, 'application/octet-stream', realWebp); // 잘못된 Content-Type → 파일 서명으로 판별
  if (p.startsWith('/cdn/redirect/')) return send(302, 'text/plain', '', {location: `/cdn/img/redirected.png?w=320&h=240`});
  if (p === '/cdn/flaky.png') return once('flaky') <= 2 ? send(503, 'text/plain', 'busy') : send(200, 'image/png', png(200, 150, 7));
  if (p === '/cdn/toggle.png') return fs.existsSync(path.join(STATE, 'fail-toggle')) ? send(500, 'text/plain', 'down') : send(200, 'image/png', png(260, 180, 9));
  if (p === '/cdn/broken.jpg') return send(200, 'text/html; charset=utf-8', '<html>error page</html>');
  if (p === '/cdn/clip2.mp4') return send(200, 'video/mp4', VIDEO);
  if (p === '/cdn/huge.mp4') return send(200, 'video/mp4', VIDEO.subarray(0, 100), {'content-length': String(600 * 1024 * 1024)});
  if (p === '/cdn/slow-video.mp4') {
    // 느리게 흘려보내는 영상 (중단 시험용): 약 4초
    res.writeHead(200, {'content-type': 'video/mp4'});
    const body = Buffer.concat([VIDEO, Buffer.alloc(Math.max(0, 400000 - VIDEO.length))]);
    let off = 0;
    const t = setInterval(() => {
      if (off >= body.length) return clearInterval(t), res.end();
      res.write(body.subarray(off, (off += 40000)));
    }, 400);
    req.on('close', () => clearInterval(t));
    return;
  }
  if (p.startsWith('/static/')) return send(200, 'image/png', png(16, 16, 1));
  send(404, 'text/plain', 'not found');
});
server.listen(PORT, () => console.log(`fixture BBS on ${ORIGIN}  (state ${STATE})\nA=${ID.A}\nB=${ID.B}\nC=${ID.C}\nD=${ID.D} (404)\nE=${ID.E} (RSC only)`));
