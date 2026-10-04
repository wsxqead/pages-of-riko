// PAGES OF RIKO · 6개 PAGE 공통 데이터
// 메인 앨범과 각 전시 페이지가 함께 사용한다. (getPage('bongnudo-1').logo 등)
//
// image: 대표 썸네일 — 리코가 그 세계에서 활동한 실제 장면 (약 720×404 JPG). null이면 placeholder.
// logo : 그 세계의 공식 타이틀 아트. null이면 제목 텍스트만 표시.
//   src / alt
//   width, height : 원본 픽셀 크기 (비율 유지·자리 확보용, 강제 크기 아님)
//   scale         : 로고마다 시각적 질량이 달라 생기는 크기 차이를 미세조정 (기본 1)
//   type          : 'title'(콘텐츠 로고) | 'event'(대회 키비주얼 등 사각 이미지 — 기록사진처럼 붙여 표시)
// title: 화면에 남는 이름(semantic heading). sub: 보조 표기 (없으면 빈 줄로 리듬 유지)

export const pages = [
  {
    no: '01', slug: 'bongnudo-1', href: '/bongnudo-1', world: 'sides',
    title: '봉누도 1', sub: null,
    desc: '두 조직 사이에서 이어진 이야기',
    date: null,
    image: '/images/bongnudo-1.jpg',
    logo: { src: '/images/pages/bongnudo-1/logo.webp', alt: '봉누도', width: 348, height: 226, scale: 1, type: 'title' },
  },
  {
    no: '02', slug: 'goaon', href: '/goaon', world: 'rpg',
    title: '고아온', sub: null,
    desc: '한 권의 공책에서 시작된 모험',
    date: null,
    image: '/images/goaon.jpg',
    logo: { src: '/images/pages/goaon/logo.webp', alt: '멋사의 공책 RPG', width: 365, height: 264, scale: 1.08, type: 'title' },
  },
  {
    no: '03', slug: 'pixel-town-2', href: '/pixel-town-2', world: 'pixel',
    title: 'PIXEL CREATOR TOWN 2', sub: null,
    desc: '함께 살아간 마을의 기억',
    date: null,
    image: '/images/pixel-town-2.jpg',
    logo: { src: '/images/pages/pixel-town-2/logo.webp', alt: 'PIXEL CREATOR TOWN 2', width: 314, height: 221, scale: 1.06, type: 'title' },
  },
  {
    no: '04', slug: 'bongketmon', href: '/bongketmon', world: 'dex',
    title: '봉켓몬', sub: null,
    desc: '리코의 트레이너 기록',
    date: null,
    image: '/images/bongketmon.jpg',
    logo: { src: '/images/pages/bongketmon/logo.webp', alt: '봉켓몬', width: 200, height: 121, scale: 0.96, type: 'title' },
  },
  {
    no: '05', slug: 'tteobecure', href: '/tteobecure', world: 'broadcast',
    title: '떠비큐어', sub: '2026 CHZZK OPEN CUP · 이터널 리턴 팀',
    desc: '함께 도전했던 하나의 팀',
    date: null,
    image: '/images/tteobecure.jpg',
    // 현재는 대회 키비주얼. 떠비큐어 팀 로고가 생기면 type: 'title'로 교체하거나 teamLogo를 추가한다.
    logo: { src: '/images/pages/tteobecure/event-logo.webp', alt: '2026 치지직 오픈컵', width: 1000, height: 544, scale: 1, type: 'event' },
  },
  {
    no: '06', slug: 'bongnudo-2', href: '/bongnudo-2', world: 'press',
    title: '봉누도 2', sub: null,
    desc: '보도국 기자로 살아간 시간',
    date: null,
    image: '/images/bongnudo-2.jpg',
    logo: { src: '/images/pages/bongnudo-2/logo.webp', alt: '봉누도 시즌 2', width: 385, height: 199, scale: 0.9, type: 'title' },
  },
];

export const getPage = (slug) => pages.find((p) => p.slug === slug) || null;
