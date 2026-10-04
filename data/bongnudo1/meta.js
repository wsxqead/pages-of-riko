// 봉누도 1 · 공통 메타 데이터
// 화면 문구가 아닌 "사실/분류" 위주로 둔다.

export const server = {
  name: '봉누도',
  en: 'BONGNUDO',
  game: 'GTA 5 RP SERVER',
  start: '2024-11-26T18:00',
  end: '2024-12-17T00:07',
  startLabel: '2024.11.26 18:00',
  endLabel: '2024.12.17 00:07',
};

export const yuja = {
  id: 'jeong-yuja',
  name: '정유자',
  en: 'JEONG YU-JA',
  age: 20,
  streamer: '유즈하 리코',
  photo: null, // 예: { src: '/images/bongnudo-1/yuja.jpg', caption: '' }
  police: {
    label: 'BONGNUDO POLICE',
    sub: 'POLICE CLASS 03',
    titles: ['경찰 3기', '자칭 3기 에이스', '3기 폐급즈', '초록머리 3인방'],
  },
  chilssang: {
    label: '칠쌍파',
    sub: 'PRINCESS / PR TEAM',
    titles: ['공주', '철부지 막내딸', '아픈 손가락', '홍보팀장'],
  },
  traits: ['밝고 장난스러움', '큰 리액션', '어트랙션 알바 연기', '리코더', '분위기 메이커'],
};

// CASE FILE 첫 화면의 단체사진 (DUAL SIDE 렌즈와 연동)
// src: null 이면 PHOTO PENDING. width/height: 원본 픽셀 크기 (비율 유지와 자리 확보에 사용)
// maxWidth: 사진 묶음 안에서 차지할 최대 너비(%) — 비율이 달라도 존재감이 비슷하도록 사진별로 조절
// objectPosition: 원본을 자르지 않으므로 평소엔 영향이 없고, 프레임과 비율이 어긋날 때의 정렬 기준
export const groupPhotos = {
  police: {
    src: '/images/bongnudo-1/group-police.webp',
    width: 800,
    height: 304,
    alt: '정유자가 포함된 봉누도 경찰 단체사진',
    caption: 'BONGNUDO POLICE · 경찰 단체사진',
    maxWidth: 66,
    objectPosition: '50% 50%',
  },
  chilssang: {
    src: '/images/bongnudo-1/group-chilssang.webp',
    width: 500,
    height: 281,
    alt: '정유자가 포함된 칠쌍파 단체사진',
    caption: '칠쌍파 · 가족사진',
    maxWidth: 44,
    objectPosition: '50% 50%',
  },
};

// 같은 사람을 두 조직은 어떻게 기록했나 (메인 CASE FILE의 렌즈 비교용)
export const profileRows = [
  { key: '소속', police: '봉누도 경찰 3기', chilssang: '칠쌍파 홍보팀' },
  { key: '불린 이름', police: '자칭 3기 에이스 · 3기 폐급즈', chilssang: '공주 · 철부지 막내딸' },
  { key: '특기', police: '찰진 테이저건 리액션 · 야차룰 10승 6패', chilssang: '봉봉그램 · 분위기 띄우기' },
  { key: '약점', police: '싹윤모에게 짐 · 툭하면 교육생', chilssang: '마이너스 통장 · 잦은 추락사' },
  { key: '가까운 사람', police: '김은휘 · 싹윤모 · 김망내 · 김편집', chilssang: '쌍칠아재(아부지) · 담길동 · 김떡순 · 엄태봉' },
  { key: '기록상 신분', police: '경찰관 (스파이인 줄 알면서 눈감아 줌)', chilssang: '탈퇴자 (그래도 막내딸)' },
];

export const groups = {
  police: { name: '봉누도 경찰', en: 'BONGNUDO POLICE', short: 'POLICE' },
  chilssang: { name: '칠쌍파', en: 'CHILSSANG', short: '칠쌍파' },
  cheongryong: { name: '청룡그룹', en: 'CHEONGRYONG', short: '청룡' },
  ems: { name: 'EMS', en: 'EMS', short: 'EMS' },
  other: { name: '기타 인연', en: 'OTHERS', short: '기타' },
};

// 한 사람에게 여러 개를 붙일 수 있다.
export const relationTypes = {
  family: '가족',
  'family-like': '가족 같은',
  'parent-figure': '아버지 같은',
  'close-friend': '절친',
  'police-colleague': '경찰 동료',
  classmate: '3기 동기',
  senior: '선배 · 상관',
  junior: '후배',
  protector: '지켜 준 사람',
  mentor: '길을 열어 준 사람',
  rival: '라이벌',
  teasing: '티격태격',
  acquaintance: '오랜 지인',
  'romantic-tension': '미묘한 관계',
  'former-side': '갈라진 편',
  'war-opponent': '전쟁의 반대편',
  'saved-life': '목숨을 구한 사람',
};

export const linkStates = {
  strong: '깊은 연결',
  on: '연결',
  faint: '옅은 인연',
  secret: '숨겨진 연결',
  cut: '끊어짐',
  memory: '기억 속',
};

export const priorities = { core: 'CORE', important: 'IMPORTANT', extended: 'EXTENDED' };

export const sections = [
  { href: '/bongnudo-1', label: 'CASE FILE', ko: '개요' },
  { href: '/bongnudo-1/story', label: 'STORY', ko: '이야기' },
  { href: '/bongnudo-1/people', label: 'PEOPLE', ko: '사람들' },
  { href: '/bongnudo-1/timeline', label: 'TIMELINE', ko: '날짜별 기록' },
  { href: '/bongnudo-1/incidents', label: 'INCIDENTS', ko: '사건 파일' },
  { href: '/bongnudo-1/ending', label: 'LAST NIGHT', ko: '마지막 밤' },
];
