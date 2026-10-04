// 픽크타2 · 주민 (서버 전체 도감이 아니라 리코와 관련된 사람만)
//
// tier: featured | related
// homeRegion: regions.js id. 확인되지 않았으면 null.
// 카드가 없는 나머지 주민은 regions.js 의 roster(이름 목록)로만 관리한다.
// RESIDENT DATA 는 "어디에 살았는가"만 다룬다. 함께한 사건은 encounters.js 에서만 연결한다.
// connection: 리코와의 연결 중 "확인된 것"만 (예: 같은 세피아 주민)
// streamLog: 본인 채널의 픽크타2 방송 기록 (리코와 함께한 기록이 아님)
// 리코와 함께한 장면은 encounters.js 에서 people 로 연결되며, 개수는 거기서 계산한다.

export const residents = [
  {
    id: 'riko',
    name: '유즈하 리코',
    en: 'YUZUHA RIKO',
    tier: 'featured',
    player: true,
    homeRegion: 'sepia',
    connection: '이 전시의 주인공 · 세피아 주민',
    streamLog: [],
    portrait: null,
  },
  {
    id: 'lize',
    name: '아카네 리제',
    en: 'AKANE LIZE',
    tier: 'featured',
    homeRegion: 'sepia',
    connection: '같은 세피아 주민',
    streamLog: [
      { date: '02.21', label: '픽크타 서버 오픈런 1일차' },
      { date: '02.22', label: '픽크타2 2일차' },
      { date: '02.23', label: '픽크타2 3일차' },
      { date: '02.24', label: '픽크타2 4일차' },
    ],
    streamNote: '장시간 다시보기로 확인된 방송 기록.',
    portrait: null,
  },
  {
    id: 'tabi',
    name: '아라하시 타비',
    en: null,
    tier: 'featured',
    homeRegion: 'misron',
    connection: '다른 거주 구역(미스론) 주민',
    streamLog: [
      { date: '02.21', label: '1일차' },
      { date: '02.22', label: '2일차', extra: '비방 플레이를 따로 녹화해 공개' },
      { date: '02.23', label: '3일차' },
      { date: '02.24', label: '4일차' },
      { date: '02.25', label: '5일차' },
      { date: '02.27', label: '6일차' },
      { date: '02.28', label: '7일차' },
      { date: '03.01', label: '8일차' },
      { date: '03.02', label: '9일차' },
      { date: '03.04', label: '10일차' },
    ],
    streamNote: '픽크타2를 오래, 적극적으로 플레이한 기록.',
    portrait: null,
  },
  {
    id: 'yubomnyang',
    name: '유봄냥',
    en: null,
    tier: 'featured',
    homeRegion: 'arsian',
    connection: '다른 거주 구역(아르시안) 주민',
    streamLog: [],
    portrait: null,
  },
  {
    id: 'aokumo-rin',
    name: '아오쿠모 린',
    en: null,
    tier: 'related',
    homeRegion: 'sepia',
    connection: '같은 세피아 주민',
    streamLog: [],
    portrait: null,
  },
  {
    id: 'sakihane-huya',
    name: '사키하네 후야',
    en: null,
    tier: 'related',
    homeRegion: 'sepia',
    connection: '같은 세피아 주민',
    streamLog: [],
    portrait: null,
  },
  {
    id: 'kangji',
    name: '강지',
    en: null,
    tier: 'related',
    homeRegion: 'sepia',
    connection: '같은 세피아 주민 · EP.04 제목에 이름이 등장',
    streamLog: [],
    portrait: null,
  },
];

export const residentsById = Object.fromEntries(residents.map((r) => [r.id, r]));
export const getResident = (id) => residentsById[id] || null;
export const residentsOf = (regionId) => residents.filter((r) => r.homeRegion === regionId);
