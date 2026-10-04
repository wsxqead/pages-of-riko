// 픽크타2 · 거주 구역과 MEMORY MAP 배치
//
// 지역 이름 = 실제 자료 (16개 모두 확인됨)
// 지도상의 배치 = 전시용 Memory Map (실제 좌표·지형과 무관, NOT TO SCALE)
//
// name : 한글 지역명 (확정, 주 표시)
// en   : 참고용 로마자 표기 (공식 아님 → 화면 미표시). 공식 영문 표기가 확인되면 enOfficial: true 로 바꾼다.
// slot : mapSlots 의 전시용 자리 번호
// kind : home(리코의 거주지) | featured(주요 인물이 사는 곳) | town(그 외)
// roster: 확인된 주민 이름 전체 (자료가 없으면 null). 카드가 있는 주민은 residents.js 에서 따로 관리한다.

// 전시 지도 위 16개 구역 자리 (viewBox 1200 × 760 기준)
export const mapSlots = [
  { x: 190, y: 170 }, { x: 395, y: 120 }, { x: 610, y: 150 }, { x: 820, y: 120 }, { x: 1010, y: 200 },
  { x: 140, y: 390 }, { x: 350, y: 330 }, { x: 590, y: 390 }, { x: 830, y: 340 }, { x: 1060, y: 420 },
  { x: 220, y: 600 }, { x: 440, y: 560 }, { x: 660, y: 610 }, { x: 880, y: 570 }, { x: 1060, y: 640 },
  { x: 430, y: 700 },
];

// 장식용 길 (자리 번호끼리 연결). 실제 도로가 아니다.
export const mapRoads = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [1, 6], [2, 7], [3, 8], [4, 9],
  [5, 6], [6, 7], [7, 8], [8, 9], [5, 10], [6, 11], [7, 12], [8, 13], [9, 14],
  [10, 11], [11, 12], [12, 13], [13, 14], [11, 15], [10, 15],
];

export const regions = [
  {
    id: 'misron', name: '미스론', en: 'MISRON', slot: 4, kind: 'featured',
    tagline: 'HOME OF TABI',
    note: '아라하시 타비가 살았던 거주 구역. 세피아와는 다른 마을이다.',
    roster: ['나는 만타', '루태', '반님', '시라유키 히나', '실프', '아라하시 타비', '장마군', '채현찌', '피닉스박'],
  },
  {
    id: 'sepia', name: '세피아', en: 'SEPIA', slot: 7, kind: 'home',
    tagline: "RIKO'S HOME",
    note: '리코가 정착한 거주 구역. 아카네 리제도 같은 세피아 주민이었다.',
    roster: ['강지', '고수달', '너불', '달콤레나', '루다', '루코', '사키하네 후야', '아야 AYA', '아오쿠모 린', '아카네 리제', '연초봄', '유즈하 리코', '조경훈'],
  },
  {
    id: 'arsian', name: '아르시안', en: 'ARSIAN', slot: 5, kind: 'featured',
    tagline: 'HOME OF YUBOMNYANG',
    note: '유봄냥이 살았던 거주 구역. 세피아와는 다른 마을이다.',
    roster: ['유봄냥', '김뿡', '다비', '모카형', '바뀐', '빅헤드', '사모장', '살구', '씨랙', '연비니', '조별하', '해마티엘'],
  },
  { id: 'bellin', name: '벨린', en: 'BELLIN', slot: 0, kind: 'town', roster: null },
  { id: 'neriel', name: '네리엘', en: 'NERIEL', slot: 1, kind: 'town', roster: null },
  { id: 'novas', name: '노바스', en: 'NOVAS', slot: 2, kind: 'town', roster: null },
  { id: 'aura', name: '아우라', en: 'AURA', slot: 3, kind: 'town', roster: null },
  { id: 'magna', name: '마그나', en: 'MAGNA', slot: 6, kind: 'town', roster: null },
  { id: 'option', name: '옵시온', en: 'OPTION', slot: 8, kind: 'town', roster: null },
  { id: 'arca', name: '아르카', en: 'ARCA', slot: 9, kind: 'town', roster: null },
  { id: 'elim', name: '엘림', en: 'ELIM', slot: 10, kind: 'town', roster: null },
  { id: 'carmia', name: '카르미아', en: 'CARMIA', slot: 11, kind: 'town', roster: null },
  { id: 'agon', name: '에이곤', en: 'AGON', slot: 12, kind: 'town', roster: null },
  { id: 'carto', name: '카르토', en: 'CARTO', slot: 13, kind: 'town', roster: null },
  { id: 'haeon', name: '해온', en: 'HAEON', slot: 14, kind: 'town', roster: null },
  { id: 'talos', name: '탈로스', en: 'TALOS', slot: 15, kind: 'town', roster: null },
].map((r) => ({ verified: true, enOfficial: false, tagline: null, note: null, ...r }));

// 영문은 공식 표기가 확인된 경우에만 화면에 쓴다 (그 외에는 한글명만)
export const enLabel = (r) => (r && r.enOfficial ? r.en : null);

export const regionsById = Object.fromEntries(regions.map((r) => [r.id, r]));
export const regionPosition = (r) => mapSlots[r.slot];
const KIND_ORDER = {home: 0, featured: 1};
export const primaryRegions = regions.filter((r) => r.kind !== 'town').sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
export const otherRegions = regions.filter((r) => r.kind === 'town');
