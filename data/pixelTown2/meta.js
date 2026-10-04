// 픽크타2 · 서버 기본 정보 (확인된 사실만 · WORLD DATA)

export const server = {
  name: 'Pixel Creator Town 2',
  nameKo: '픽셀 크리에이터 타운 2',
  short: '픽크타2',
  kind: 'Minecraft 기반 MMORPG 크리에이터 서버',
  predecessor: '픽셀 크리에이터 타운의 후속 서버. 친목 중심 바닐라 서버였던 전작과 달리 RPG 요소를 전면에 내세웠다.',
  influences: ['팰월드', '로스트아크'],
  start: '2026-02-21T18:00',
  end: '2026-03-09T00:00',
  startLabel: '2026.02.21 18:00',
  endLabel: '2026.03.09 00:00',
  restDay: '2026.03.03',
  version: 'Minecraft 1.21.4',
  platform: 'CHZZK + SOOP 통합 서버',
  participants: 194,
  totalRegions: 16,
  regionCapacity: 20,
  movingRule: '한 번 정착한 거주 구역에서는 다른 구역으로 이사할 수 없었다.',
  systems: ['거주 구역', '펫', '직업', '어비스 던전', '미궁', '장비 · 성장', '후원 연동 시스템'],
};

export const player = {
  id: 'riko',
  name: '유즈하 리코',
  en: 'YUZUHA RIKO',
  homeRegion: 'sepia',
};

export const sections = [
  { href: '/pixel-town-2', label: 'TOWN', ko: '마을 · 지도' },
  { href: '/pixel-town-2/residents', label: 'RESIDENTS', ko: '주민' },
  { href: '/pixel-town-2/journey', label: 'JOURNEY', ko: '발자국 · 서버 진행' },
  { href: '/pixel-town-2/ending', label: 'LAST DAY', ko: '마지막 날' },
];
