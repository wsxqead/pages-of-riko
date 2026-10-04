// 픽크타2 · RIKO'S JOURNEY — 리코의 방송·영상·클립으로 확인되는 기록만
// WORLD PROGRESS(서버 전체 진행)와 섞지 않는다. 확인되지 않은 이동 경로·장소·만난 사람은 넣지 않는다.
//
// type: home | session(개인 방송 플레이) | encounter | visit
// date: 'YYYY-MM-DD' 또는 null (null 이면 날짜 줄을 숨김)
// region / encounterIds: 확인된 것만 (모르면 null / [])
// verification: confirmed | metadata | unconfirmed

export const footprints = [
  {
    id: 'home-sepia',
    type: 'home',
    date: null,
    region: 'sepia',
    title: '세피아에 정착',
    text: '리코의 거주 구역은 세피아. 한 번 정하면 이사할 수 없는 곳이었다. 아카네 리제도 같은 세피아에 정착한 주민이다.',
    encounterIds: [],
    verification: 'confirmed',
  },
  {
    id: 'session-0301',
    type: 'session',
    date: '2026-03-01',
    region: null,
    title: 'PLAY SESSION',
    text: '갠방 — 픽셀 크리에이터 타운 2',
    encounterIds: [],
    verification: 'confirmed',
  },
  {
    id: 'session-0304',
    type: 'session',
    date: '2026-03-04',
    region: null,
    title: 'PLAY SESSION',
    text: '갠방 — 픽셀 크리에이터 타운 2',
    encounterIds: [],
    verification: 'confirmed',
  },
  {
    id: 'session-0305',
    type: 'session',
    date: '2026-03-05',
    region: null,
    title: 'PLAY SESSION',
    text: '갠방 — 픽셀 크리에이터 타운 2',
    encounterIds: [],
    verification: 'confirmed',
  },
];

// 공식 편집본 소개 — 각 편의 구체적인 이야기는 영상 내용을 확인한 뒤 encounters 로 연결한다.
export const recordIntro = {
  label: "RIKO'S PIXEL TOWN RECORD",
  title: '네 편의 공식 편집본',
  text: '리코의 픽크타2 기록은 네 편의 공식 편집본으로 남아 있다. 2월 27일 첫 편을 시작으로 서버 종료 이후까지 네 편의 기록이 순차적으로 공개되었다.',
};
