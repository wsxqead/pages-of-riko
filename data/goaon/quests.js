// 고아온 · QUEST LOG (목표 단위)
// Adventure(날짜 단위)와 겹치지 않도록 "무엇을 하려 했고 어떻게 됐나"만 적는다.
//
// status: complete | not-found | ongoing | trail | clear
// people: 확인된 참여자. 'guild' 는 "길드원들과" — 개별 명단이 확인되지 않은 경우.
// memories / raid: 다른 데이터 id 참조

export const questStatus = {
  complete: { label: 'COMPLETE', ko: '완료' },
  'not-found': { label: 'NOT FOUND', ko: '찾지 못함' },
  ongoing: { label: 'IN PROGRESS', ko: '진행 기록' },
  trail: { label: 'ON THE TRAIL', ko: '추적 중' },
  clear: { label: 'RAID CLEAR', ko: '클리어' },
};

export const quests = [
  {
    id: 'create-guild',
    type: 'quest',
    title: '길드 만들기',
    date: '12.22',
    status: 'complete',
    people: ['gosudal', 'aokumo-rin', 'ambition', 'riko', 'lee-chunhyang', 'tamtam'],
    goal: '오픈 첫날, 함께할 길드를 만든다.',
    result: '여섯 명의 길드 "고아온" 결성.',
    resultNote: null,
    memories: ['guild-name', 'first-talk'],
  },
  {
    id: 'hidden-search',
    type: 'quest',
    title: '히든을 찾아라',
    date: '12.23',
    status: 'not-found',
    people: ['riko', 'guild'],
    goal: '길드원들과 히든 콘텐츠를 찾아낸다.',
    result: '히든은 찾지 못했다.',
    resultNote: '그래도 좋은 하루. 파티는 흩어지지 않았다.',
    memories: ['hidden-together'],
  },
  {
    id: 'gear-up',
    type: 'quest',
    title: '장비를 맞춰라',
    date: '12.23 – 12.24',
    status: 'ongoing',
    people: ['riko', 'guild'],
    goal: '레벨업과 재료 파밍으로 장비를 갖춘다.',
    result: '레벨업, 장비 맞추기, 재료 파밍이 이틀 동안 이어졌다.',
    resultNote: null,
    memories: ['back-to-farm', 'boss-day'],
  },
  {
    id: 'level-35',
    type: 'quest',
    title: '35레벨',
    date: '12.24',
    status: 'complete',
    levelUp: 35,
    people: ['riko'],
    helpers: ['빅헤드'],
    goal: '리코 35레벨 달성.',
    result: '빅헤드의 도움으로 35레벨 달성.',
    resultNote: null,
    memories: ['level-35'],
  },
  {
    id: 'chef-hidden',
    type: 'quest',
    title: '요리사 히든의 흔적',
    date: '12.24',
    status: 'trail',
    people: ['tamtam', 'riko', 'guild'],
    goal: '탬탬버린의 추리를 따라 요리사 히든을 찾는다.',
    result: '탬탬버린의 추리를 듣고, 다 같이 히든을 찾아 이동했다.',
    resultNote: '탐색 결과는 자료 추가 예정.',
    memories: ['chef-hidden'],
  },
  {
    id: 'raid-14',
    type: 'raid',
    title: '고아온 출격',
    raid: 'raid-clear-14',
    date: null,
    status: 'clear',
    people: ['gosudal', 'aokumo-rin', 'riko', 'tamtam'],
    goal: '레이드 클리어.',
    result: '고아온 이름으로 14번째 클리어 기록.',
    resultNote: '레이드 이름과 날짜는 자료 추가 예정.',
    memories: ['raid-clears'],
  },
  {
    id: 'raid-13',
    type: 'raid',
    title: '고아온 출격',
    raid: 'raid-clear-13',
    date: null,
    status: 'clear',
    people: ['aokumo-rin', 'ambition', 'riko', 'tamtam'],
    goal: '레이드 클리어.',
    result: '고아온 이름으로 13번째 클리어 기록.',
    resultNote: '레이드 이름과 날짜는 자료 추가 예정.',
    memories: ['raid-clears'],
  },
];

export const questsById = Object.fromEntries(quests.map((q) => [q.id, q]));
