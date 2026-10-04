// 봉누도 1 · 시간에 따라 변하는 관계
//
// links 는 "변화가 있는 phase만" 적는다. 적지 않은 phase는 직전 상태를 이어받는다.
// state: strong | on | faint | secret | cut | memory | hidden
// side : north | south  (split phase에서만 사용, 기본 south)
// note : 해당 phase에서 그 관계를 설명하는 짧은 메모

export const phases = [
  {
    id: 'before',
    label: 'BEFORE POLICE',
    date: '11월 말',
    title: '칠쌍파의 막내딸',
    caption: '수영장 알바에서 만난 친구들, 먼저 손을 내민 담길동. 정유자의 봉누도는 칠쌍파에서 시작된다.',
    status: '칠쌍파 · 홍보팀장',
    yujaX: 60,
  },
  {
    id: 'class03',
    label: 'POLICE CLASS 03',
    date: '12월 초 – 12.05',
    title: '스파이, 경찰 3기가 되다',
    caption: '칠쌍파를 잠시 떠나 경찰 3기로. 칠쌍파와의 선은 보이지 않는 곳으로 숨는다.',
    status: '경찰 3기 교육생 · 칠쌍파(비밀)',
    yujaX: 55,
  },
  {
    id: 'dec08',
    label: 'DEC 08',
    date: '12.08 – 12.09',
    title: '경찰 안의 자리',
    caption: '야차룰 10승 6패, 이튿날 후방침투. 동기와 선배들이 또 하나의 가족이 되어 간다.',
    status: '경찰 3기',
    yujaX: 50,
  },
  {
    id: 'dec13',
    label: 'DEC 13',
    date: '12.13',
    title: '강등, 그리고 습격',
    caption: '다시 교육생. 청장의 죽음과 경찰청 습격 — 정유자는 정문을 홀로 지켰다.',
    status: '경찰 3기 · 교육생 재강등',
    yujaX: 50,
  },
  {
    id: 'dec14',
    label: 'DEC 14',
    date: '12.14',
    title: '갈라지는 지도',
    caption: '갱단은 북부로. 담길동은 정유자를 칠쌍파에서 내보냈고, 경찰과 청룡의 인연도 남과 북으로 갈라졌다.',
    status: '경찰 · 칠쌍파 탈퇴',
    split: true,
    yujaX: 50,
  },
  {
    id: 'war',
    label: 'WAR',
    date: '12.14 밤',
    title: '돌아온 가족',
    caption: '칠쌍파가 남부로 돌아왔다. 끊겼던 선이 다시 이어진다. 김동균은 아직 북부에 있다.',
    status: '남부 · 경찰',
    split: true,
    yujaX: 50,
  },
  {
    id: 'last',
    label: 'LAST DAY',
    date: '12.15 – 12.17',
    title: '하나로 모이는 밤',
    caption: '경찰에게 작별하고, 칠쌍파 아지트로. 어느 쪽에도 선을 긋지 않은 마지막 밤.',
    status: '경찰이자 칠쌍파',
    converge: true,
    yujaX: 50,
  },
];

export const links = {
  // 칠쌍파
  'dam-gildong': {
    before: { state: 'strong', note: '먼저 연락해 칠쌍파로 이끈 사람' },
    class03: { state: 'secret', note: '스파이 계획을 허락 — 겉으로는 탈퇴' },
    dec14: { state: 'cut', side: 'north', note: '연락하지 말라는 말 — 지키기 위한 결별' },
    war: { state: 'strong', side: 'south', note: '칠쌍파 남부 합류, 다시 연락' },
    last: { state: 'strong', note: '아지트에서 다시 가족으로' },
  },
  'ssangchil-ajae': {
    before: { state: 'strong', note: '"아부지"' },
    class03: { state: 'secret', note: '탈퇴한 척, 여전히 집안의 막내딸' },
    dec14: { state: 'cut', side: 'north', note: '칠쌍파와의 결별' },
    war: { state: 'strong', side: 'south', note: '다시 한 집안' },
    last: { state: 'strong', note: '아지트로 돌아온 막내딸' },
  },
  'kim-tteoksun': {
    before: { state: 'strong', note: '수영장 알바 찐친' },
    class03: { state: 'secret', note: '숨겨 둔 우정' },
    dec14: { state: 'cut', side: 'north', note: '칠쌍파와의 결별' },
    war: { state: 'strong', side: 'south', note: '다시 연락' },
    last: { state: 'strong', note: '마지막 가족의 시간' },
  },
  'eom-taebong': {
    before: { state: 'strong', note: '처음부터 함께 어울린 사이' },
    class03: { state: 'secret', note: '숨겨 둔 가족' },
    dec14: { state: 'cut', side: 'north', note: '칠쌍파와의 결별' },
    war: { state: 'strong', side: 'south', note: '남부 합류 소식을 전해 준 사람' },
    last: { state: 'strong', note: '은행털이의 일등공신' },
  },

  // 경찰
  'kim-eunhwi': {
    class03: { state: 'on', note: '처음엔 어색한 동기' },
    dec08: { state: 'strong', note: '초록머리 3인방' },
    dec14: { side: 'south' },
    last: { state: 'strong', note: '마지막 은행털이까지 함께' },
  },
  'ssak-yunmo': {
    class03: { state: 'on', note: '처음엔 어색한 동기' },
    dec08: { state: 'strong', note: '놀리고, 지고, 또 놀리고' },
    dec14: { side: 'south' },
    last: { state: 'strong', note: '우주 비행선 탈출 동료' },
  },
  'kim-mangnae': {
    before: { state: 'faint', note: '경찰이 되기 전부터 알던 사이' },
    class03: { state: 'strong', note: '경찰 안의 오랜 얼굴' },
    dec14: { side: 'south' },
    last: { state: 'strong', note: '가장 흔들렸던 인사' },
  },
  'kim-pyeonjip': {
    class03: { state: 'on', note: '동기들 사이를 이어 준 선배' },
    dec08: { state: 'strong', note: '야차룰, 그리고 후방침투' },
    dec14: { side: 'south' },
    war: { state: 'strong', note: '스파이인 걸 알고도 눈감아 줬다' },
    last: { state: 'strong', note: '결혼식 사회' },
  },
  'no-dabi': {
    before: { state: 'faint', note: '경찰이 되기 전부터 알던 사이' },
    class03: { state: 'on', note: '3기 적응을 도운 선배' },
    dec14: { state: 'cut', side: 'north', note: '북부로' },
    last: { state: 'faint', note: '이후 관계는 자료 추가 예정' },
  },
  'kang-duman': {
    class03: { state: 'on', note: '상관' },
    dec08: { state: 'strong', note: '헬기 사격수로 임명' },
    dec14: { side: 'south' },
    last: { state: 'memory', note: '경찰청 옥상, 유령과의 통화' },
  },
  'hwang-rinjun': {
    class03: { state: 'on', note: '3기 적응을 도운 선배' },
    dec14: { state: 'cut', side: 'north', note: '북부로 — 마지막 통화' },
    last: { state: 'faint', note: '이후 관계는 자료 추가 예정' },
  },
  'bong-changseop': {
    class03: { state: 'on', note: '경찰청장' },
    dec13: { state: 'memory', note: '12.13 사망' },
    dec14: { side: 'south' },
  },
  jjanu: {
    dec08: { state: 'on', note: '야차룰 상대' },
    dec14: { side: 'south' },
    last: { state: 'on', note: '우주 비행선 동승' },
  },
  'seo-bogeon': {
    dec08: { state: 'on', note: '12.09 후방침투조' },
    dec14: { side: 'south' },
  },
  'kim-silpae': {
    class03: { state: 'on', note: '경찰 동료' },
    dec14: { side: 'south' },
  },
  yuunyang: {
    dec08: { state: 'on', note: '야차룰 상대' },
    dec14: { side: 'south' },
  },
  garena: {
    class03: { state: 'faint', note: '경찰 동료' },
    dec14: { state: 'cut', side: 'north', note: '북부로' },
    last: { state: 'faint', note: '이후 관계는 자료 추가 예정' },
  },
  'kim-ttiyong': {
    dec13: { state: 'on', note: '일일 경찰의 마편 → 강등' },
    dec14: { state: 'hidden' },
  },

  // 청룡그룹
  'kim-donggyun': {
    before: { state: 'faint', note: '택시의 첫 손님 (유자는 기억 못 함)' },
    class03: { state: 'on', note: '다시 만난 사람' },
    dec08: { state: 'strong', note: '썸 직전의 미묘한 사이' },
    dec14: { state: 'cut', side: 'north', note: '서로 몸조심하라며 작별' },
    war: { state: 'cut', side: 'north', note: '북부에 남다' },
    last: { state: 'strong', note: '생사를 거친 재회 — 좋은 인연으로' },
  },
  // TODO: 김승윤·정복자와의 첫 인연 시점 확인 후 조정
  'kim-seungyun': {
    class03: { state: 'on', note: '티격태격 삼촌과 조카' },
    dec14: { state: 'faint', side: 'north', note: '청룡그룹은 북부에' },
    last: { state: 'strong', note: '마지막까지 주먹, 그리고 웃음' },
  },
  'jeong-bokja': {
    class03: { state: 'on', note: '할머니 같은 사람' },
    dec14: { state: 'faint', side: 'north', note: '청룡그룹은 북부에' },
    last: { state: 'on', note: '마지막 밤의 기억 속에' },
  },

  // EMS / 기타
  ems: {
    last: { state: 'on', note: '전쟁 뒤, 정유자를 살려 낸 곳' },
  },
  'temin-tv': {
    last: { state: 'on', note: '우주 비행선 동승' },
  },
};

// 정유자를 거치지 않는 사람들 사이의 연결 (둘 다 보일 때만 그린다)
export const ties = [
  ['kim-eunhwi', 'ssak-yunmo'],
  ['kim-tteoksun', 'eom-taebong'],
  ['dam-gildong', 'ssangchil-ajae'],
  ['kim-donggyun', 'kim-seungyun'],
];

const phaseIndex = Object.fromEntries(phases.map((p, i) => [p.id, i]));

// 특정 phase 시점의 연결 상태 (이전 phase 값을 이어받음)
export function linkAt(personId, phaseId) {
  const steps = links[personId];
  if (!steps) return null;
  let cur = null;
  for (let i = 0; i <= phaseIndex[phaseId]; i++) {
    const s = steps[phases[i].id];
    if (s) cur = { ...(cur || {}), ...s, note: s.note ?? cur?.note, changed: phases[i].id };
  }
  if (!cur || !cur.state || cur.state === 'hidden') return null;
  return { side: 'south', ...cur };
}

// 상세 화면용: 변화가 기록된 phase만 순서대로
export function linkHistory(personId) {
  const steps = links[personId] || {};
  return phases
    .filter((p) => steps[p.id] && (steps[p.id].state || steps[p.id].note))
    .map((p) => ({ phase: p, ...linkAt(personId, p.id), raw: steps[p.id] }))
    .filter((h) => h.raw.state !== 'hidden');
}
