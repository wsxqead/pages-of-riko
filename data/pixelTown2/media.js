// 픽크타2 · 영상 / 클립 / 사진  (MEDIA DATA — 주민·사건 데이터와 분리)
//
// publishedAt: 영상 공개 시각 / eventDate: 영상 속 사건이 실제로 일어난 날 (영상 내용 확인 전 null)
//   → 공개일을 사건 날짜로 쓰지 않는다.
// url: 확인된 공식 URL만. 추측해서 넣지 않는다. null 이면 "영상 보기" 버튼을 만들지 않는다.
// titleNames: 제목에 직접 등장하는 이름 { name, resident? } — 제목에 나온다는 사실만 뜻한다.
// metadataTags: 검색 메타데이터의 관련 태그 — 실제 등장인물로 확정하지 않으며 화면에 쓰지 않는다.
// verification: confirmed | metadata | unconfirmed
// 사진(type: 'photo')은 region 을 넣으면 지도 위 사진 핀 개수에 자동 반영된다.
//   예: { id: 'photo-sepia-01', type: 'photo', src: '/images/pixel-town-2/photos/sepia-01.webp',
//         width: 1280, height: 720, date: '2026-03-01', region: 'sepia', people: ['riko'],
//         encounter: null, caption: '', verification: 'confirmed' }

export const media = [
  {
    id: 'riko-pct2-01',
    type: 'video',
    series: 'pixel-town-2',
    episode: 1,
    label: 'EP.01',
    sourceTitle: '유니 선배한테 얘기 많이 들었어요~ [픽크타2 #1]',
    title: '유니 선배한테 얘기 많이 들었어요~',
    publishedAt: '2026-02-27T15:00',
    eventDate: null,
    url: null,
    thumbnail: null,
    people: ['riko'],
    titleNames: [{ name: '유니' }],
    metadataTags: [],
    encounters: [],
    verification: 'metadata',
  },
  {
    id: 'riko-pct2-02',
    type: 'video',
    series: 'pixel-town-2',
    episode: 2,
    label: 'EP.02',
    sourceTitle: '관심 받고 싶은 멘헤라 선배에게 찍혔습니다 [픽크타2 #2]',
    title: '관심 받고 싶은 멘헤라 선배에게 찍혔습니다',
    publishedAt: '2026-03-06T15:00',
    eventDate: null,
    url: null, // 공식 유즈하 리코 YouTube 영상 — 정확한 URL 확인 후 입력 (추측 금지)
    thumbnail: null,
    people: ['riko'],
    titleNames: [],
    metadataTags: [],
    encounters: [],
    verification: 'metadata',
  },
  {
    id: 'riko-pct2-03',
    type: 'video',
    series: 'pixel-town-2',
    episode: 3,
    label: 'EP.03',
    sourceTitle: '평균 나이 31세 스텔라이브 4기생 [픽크타2 #3]',
    title: '평균 나이 31세 스텔라이브 4기생',
    publishedAt: '2026-03-13T15:02',
    eventDate: null,
    url: null,
    thumbnail: null,
    people: ['riko'],
    titleNames: [],
    metadataTags: ['다주', '강지', '아라하시 타비', '아카네 리제'], // 화면 미사용
    encounters: [],
    verification: 'metadata',
  },
  {
    id: 'riko-pct2-04',
    type: 'video',
    series: 'pixel-town-2',
    episode: 4,
    label: 'EP.04 · FINAL',
    sourceTitle: '스텔 10자매 강지네 막내딸 [픽크타2 #4 完]',
    title: '스텔 10자매 강지네 막내딸',
    publishedAt: '2026-03-18T15:00',
    eventDate: null,
    url: null,
    thumbnail: null,
    people: ['riko'],
    titleNames: [{ name: '강지', resident: 'kangji' }],
    metadataTags: [],
    encounters: [],
    verification: 'metadata',
  },
];

export const officialEdits = media.filter((m) => m.type === 'video').sort((a, b) => a.episode - b.episode);
export const photos = media.filter((m) => m.type === 'photo' && m.src);
export const photosIn = (regionId) => photos.filter((p) => p.region === regionId);
// 주민 카드용: 리코 본인 영상 + 제목에 이름이 직접 나오는 영상
export const mediaWith = (residentId) =>
  media.filter((m) => (residentId === 'riko' ? m.people.includes('riko') : m.titleNames?.some((t) => t.resident === residentId)));
export const formatDate = (iso) => (iso ? iso.slice(0, 10).replace(/-/g, '.') : null);
export const dayKey = (iso) => (iso ? iso.slice(5, 10).replace('-', '.') : null);
