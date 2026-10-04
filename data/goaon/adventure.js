// 고아온 · ADVENTURE LOG (날짜 단위: "그날 리코가 무엇을 했는가")
// 설명은 짧게. 자세한 내용은 quest / memory id로 연결한다.
//
// entries[].kind: start | party | quest | grow | rest | talk | battle
// entries[].people: 확인된 인물. 'guild' = 길드원들(개별 명단 미확인)
// camp: 그날 사이에 들어가는 휴식 장면(모닥불)

export const days = [
  {
    id: 'dec21',
    date: 'DEC 21',
    dateKo: '12월 21일',
    title: 'BETA TEST',
    titleKo: '먼저 와 본 세계',
    entries: [
      { kind: 'start', text: '멋사 공책 RPG 베타 테스트 참여', people: ['riko'], memory: 'beta' },
    ],
  },
  {
    id: 'dec22',
    date: 'DEC 22',
    dateKo: '12월 22일',
    title: 'THE PARTY FORMS',
    titleKo: '파티가 생긴 날',
    entries: [
      { kind: 'start', text: '정식 서버 오픈런', people: ['riko'] },
      { kind: 'talk', text: '탬탬버린과 만나 대화', people: ['riko', 'tamtam'], memory: 'first-talk' },
      { kind: 'party', text: '아오쿠모 린, 이춘향, 고수달, 앰비션과 함께 길드 결성', people: ['gosudal', 'aokumo-rin', 'ambition', 'lee-chunhyang', 'tamtam', 'riko'], quest: 'create-guild' },
      { kind: 'talk', text: '이세계 용사 RP에서 시작된 만담 끝에 — 길드명 "고아온"', people: ['tamtam', 'riko', 'gosudal'], memory: 'guild-name' },
    ],
  },
  {
    id: 'dec23',
    date: 'DEC 23',
    dateKo: '12월 23일',
    title: 'HIDDEN SEARCH',
    titleKo: '같이 찾는 사람들',
    entries: [
      { kind: 'quest', text: '길드원들과 히든 찾기에 몰두 — 찾지는 못했다', people: ['riko', 'guild'], quest: 'hidden-search' },
      { kind: 'grow', text: '레벨업, 장비 맞추기, 재료 파밍', people: ['riko', 'guild'], quest: 'gear-up' },
      { kind: 'rest', text: '서버 점검이 길어져 길드원들과 Dead by Daylight', people: ['riko', 'guild'], memory: 'dbd-maintenance' },
      { kind: 'grow', text: '점검이 끝나고 다시 돌아와 레벨업과 파밍', people: ['riko', 'guild'], memory: 'back-to-farm' },
    ],
    camp: '서버 점검 중 · 잠시 다른 게임에서',
  },
  {
    id: 'dec24',
    date: 'DEC 24',
    dateKo: '12월 24일',
    title: 'LEVELING & COOKING HIDDEN',
    titleKo: '평범한 모험의 하루',
    entries: [
      { kind: 'battle', text: '보스전, 장비 재료 파밍', people: ['riko', 'guild'], memory: 'boss-day' },
      { kind: 'grow', text: '빅헤드의 도움으로 35레벨 달성', people: ['riko'], quest: 'level-35' },
      { kind: 'rest', text: '서버 점검, 그리고 다시 파밍', people: ['riko', 'guild'], memory: 'boss-day' },
      { kind: 'talk', text: '아오쿠모 린의 커버곡에 길드원들이 각자 감상', people: ['aokumo-rin', 'riko', 'guild'], memory: 'rin-cover' },
      { kind: 'quest', text: '탬탬버린의 요리사 히든 추리 — 다 같이 따라 이동', people: ['tamtam', 'riko', 'guild'], quest: 'chef-hidden' },
    ],
  },
];

// 아직 날짜 단위 기록이 확보되지 않은 구간
export const pending = {
  from: '12월 25일 이후',
  text: '이후의 모험 기록은 조사 중입니다. 기록이 확인되면 이 일지에 이어서 적힙니다.',
};
