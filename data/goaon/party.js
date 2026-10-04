// 고아온 · 6인 파티
//
// 확인된 사실만: 이름, 길드 내 역할(길드장/길드원), 활동 성격(전원 레이드 · 생활).
// RPG 직업·스탯·확인되지 않은 관계 설명은 넣지 않는다.
// 이 사람과 관련된 장면/퀘스트/기억은 다른 데이터의 people 필드에서 자동으로 모인다.
//
// portrait: null 이면 placeholder. 예: { src: '/images/goaon/party/gosudal.webp' }
// notes: 이 사람에 대해 확인된 짧은 사실 (없으면 빈 배열)

export const party = [
  {
    id: 'gosudal',
    name: '고수달',
    role: 'GUILD MASTER',
    roleKo: '길드장',
    style: '레이드 · 생활',
    portrait: null,
    notes: ['고아온의 길드장', '길드 이름의 유래 — "고수달 아트 온라인"'],
  },
  {
    id: 'aokumo-rin',
    name: '아오쿠모 린',
    role: 'MEMBER',
    roleKo: '길드원',
    style: '레이드 · 생활',
    portrait: null,
    notes: ['12월 24일, 린의 커버곡을 두고 길드원들이 감상을 나눴다'],
  },
  {
    id: 'ambition',
    name: '앰비션',
    role: 'MEMBER',
    roleKo: '길드원',
    style: '레이드 · 생활',
    portrait: null,
    notes: [],
  },
  {
    id: 'riko',
    name: '유즈하 리코',
    role: 'MEMBER',
    roleKo: '길드원',
    style: '레이드 · 생활',
    player: true, // 이 전시의 시점 인물
    portrait: null,
    notes: ['12월 21일 베타 테스트부터 참여', '12월 24일 35레벨 달성'],
  },
  {
    id: 'lee-chunhyang',
    name: '이춘향',
    role: 'MEMBER',
    roleKo: '길드원',
    style: '레이드 · 생활',
    portrait: null,
    notes: [],
  },
  {
    id: 'tamtam',
    name: '탬탬버린',
    role: 'MEMBER',
    roleKo: '길드원',
    style: '레이드 · 생활',
    portrait: null,
    notes: ['오픈 첫날 리코가 처음 만나 대화를 나눈 사람', '12월 24일, 요리사 히든을 추리했다'],
  },
];

export const partyById = Object.fromEntries(party.map((m) => [m.id, m]));
export const getMember = (id) => partyById[id] || null;
