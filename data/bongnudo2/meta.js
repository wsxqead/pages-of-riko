// 봉누도 2 · 신이비 PRESS ARCHIVE — 아카이브/인물 기본 정보
// 확인되지 않은 값은 null. 화면은 null 을 자연스럽게 숨긴다.

export const archive = {
  archiveName: 'SHIN IBI PRESS ARCHIVE',
  sourceName: 'BBS 봉누도방송국',
  sourceShort: 'BBS',
  station: '봉누도방송국',
  // 원본 BBS에서 확인된 전체 기사 규모. 화면의 "보존된 기사 수"는 실제 저장된 기사 수로 계산한다.
  totalExpectedArticles: 858,
  archiveCapturedAt: null, // 'YYYY-MM-DD' — 원본을 백업한 날
  serverPeriod: {
    start: null, // 'YYYY-MM-DD' — 확정되면 입력 (DAY 계산에 사용)
    end: null,
    label: '3 WEEKS',
    labelKo: '3주',
  },
};

export const reporter = {
  id: 'shin-ibi',
  name: '신이비',
  en: 'SHIN IBI',
  streamer: '유즈하 리코',
  station: '봉누도방송국',
  role: '기자',
  roleEn: 'REPORTER',
  finalPosition: '선임기자',
  finalPositionEn: 'SENIOR REPORTER',
  image: null, // { src, width, height, alt } — 실제 자료가 생기면
};

export const sections = [
  { href: '/bongnudo-2', label: 'FRONT PAGE', ko: '1면' },
  { href: '/bongnudo-2/reporter', label: 'REPORTER', ko: '신이비' },
  { href: '/bongnudo-2/archive', label: 'ARCHIVE', ko: '기사 아카이브' },
  { href: '/bongnudo-2/newsroom', label: 'NEWSROOM', ko: '보도국' },
  { href: '/bongnudo-2/timeline', label: 'TIMELINE', ko: '날짜별 기록' },
  { href: '/bongnudo-2/people', label: 'PEOPLE', ko: '사람들' },
  { href: '/bongnudo-2/rolling-paper', label: 'LETTERS', ko: '롤링페이퍼' },
  { href: '/bongnudo-2/ending', label: 'FINAL EDITION', ko: '마지막 판' },
];

// 아카이브 목록 한 번에 보여 줄 기사 수 (MORE CLIPPINGS 로 이어 보기)
export const ARCHIVE_PAGE_SIZE = 24;
