// 고아온 · 레이드 클리어 기록
// 확인된 것: 고아온 이름의 클리어 순번과 참여 조합.
// 레이드 이름·날짜·클리어 시각·전투 내용은 자료가 확보되면 채운다.

export const raids = [
  {
    id: 'raid-clear-14',
    clearNo: 14,
    raidName: null,
    date: null,
    clearTime: null,
    people: ['gosudal', 'aokumo-rin', 'riko', 'tamtam'],
    media: [],
  },
  {
    id: 'raid-clear-13',
    clearNo: 13,
    raidName: null,
    date: null,
    clearTime: null,
    people: ['aokumo-rin', 'ambition', 'riko', 'tamtam'],
    media: [],
  },
];

export const raidsById = Object.fromEntries(raids.map((r) => [r.id, r]));
