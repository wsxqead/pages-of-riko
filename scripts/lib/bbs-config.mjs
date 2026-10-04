// BBS 원본 백업기 설정 — 실제 사이트 구조가 바뀌면 여기만 고친다.

export const BBS = {
  source: 'https://bnd2-fanwiki.app',
  listPath: '/bbs',
  articlePath: '/bbs/article/',
  // 정상적인 백업 도구임을 알리는 User-Agent (쿠키·인증 정보는 보내지 않는다)
  userAgent: 'PagesOfRiko-Archiver/1.0 (personal fan archive backup; 1 request at a time)',
  articleDelayMs: [500, 1000], // 기사 요청 사이 간격 (무작위)
  mediaConcurrency: 2, // 미디어 동시 다운로드 상한
  retryStatuses: [408, 429, 500, 502, 503, 504],
  backoffMs: [2000, 5000, 10000], // 1·2·3차 재시도 대기 (Retry-After 가 있으면 그 값)
  timeoutMs: 60000,
  maxBytes: {image: 50 * 1024 * 1024, video: 500 * 1024 * 1024},
  defaultLimit: 3, // 옵션 없이 실행해도 3건만
};

// 기사 페이지 DOM 선택자.
// ⚠ 실제 기사 페이지 DOM 을 아직 확인하지 않았다 → 추측으로 고정하지 않고 비워 둔다.
//   확인 후 채우고 confirmed: true 로 바꾼다 (--all 은 confirmed 일 때만 허용).
//   비어 있는 동안에는 페이지에 들어 있는 Next.js RSC 데이터(기사 객체)만으로 metadata·본문을 읽는다.
//   시험용으로 다른 선택자를 쓰려면 --selectors <json> 으로 덮어쓴다.
export const SELECTORS = {
  confirmed: false,
  article: null, // ARTICLE CONTENT ROOT — 이 안에서만 텍스트·사진·영상을 읽는다
  title: null,
  author: null,
  approvedAt: null, // "승인 2026. 10. 4. 02:35" 이 들어 있는 요소
  cover: null, // 대표 이미지 (본문과 분리되어 있을 때)
};

// 목록 페이지에서 확인한 사실 (2026-10-05, 목록 첫 페이지 1회 요청으로 확인)
//   - 기사 링크: <a href="/bbs/article/{UUID}">  (첫 페이지 12건)
//   - RSC 데이터의 initialArticles: { id, category, title, summary, content, author, authorStreamerName,
//     approvedAt(ISO, +00:00), thumbnailUrl, media[] }  · total 858 · totalPages 72
//   - 다음 페이지: href 링크가 없다. 무한 스크롤이 Next.js Server Action(getBbsArticlesPageAction, page, pageSize 12)을 호출
//   - 사진 호스트 예: r2.fivemanage.com (외부 CDN)
//   - 모든 페이지에 <meta name="robots" content="noindex, nofollow, noarchive"> · robots.txt 없음(404)
export const OBSERVED = {
  listPageSize: 12,
  paginationMethod: 'client infinite scroll via Next.js Server Action (getBbsArticlesPageAction)',
};
