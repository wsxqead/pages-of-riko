// 봉누도 2 · NEWSROOM STORIES — 보도국 기자들이 함께 보낸 시간의 기록
//
// 파벌(politics.js)·도시의 사건(events.js)과 다른 기록이다.
//   EVENT    : 도시에서 일어난 일 (예: 보도국 총파업)
//   POLITICS : 그날 보도국 안의 입장 (예: 강경파 / 온건파)
//   STORY    : 기자들이 함께 일하고, 취재하고, 다투고, 다시 일한 장면 (여기)
//
// {
//   id, day,                // DAY 번호 — 모르면 null (타임라인에는 날짜가 있는 기록만 놓인다)
//   when,                   // day 가 없을 때의 대략적 시점 표현 (예: '초기') — 모르면 null
//   title, summary,         // 확인된 내용만
//   type,                   // daily-life | reporting | news | conflict | relationship | incident | farewell
//   people: [],             // people.js id
//   steps: [],              // 취재 사례(REPORTING CASE): [{ label, summary, articleIds }]
//   contrast: null,         // 같은 장면에서 다른 선택을 한 사람 { label, people }
//   articleIds: [], eventIds: [], clipUrls: [],
//   verification, sourceType, sourceUrl, notes,
// }
//
// 실제 BBS 기사 ID · 클립 URL 이 확보되면 articleIds / clipUrls 에 연결하고 verification 을 올린다.

const curator = {verification: 'partial', sourceType: 'curator', sourceUrl: null, notes: null};

export const newsroomStories = [
  {
    id: 'early-days-trio',
    day: null,
    when: '초기',
    title: '처음부터 함께 어울린 세 기자',
    summary: '명총희, 밥돼길, 나익수는 보도국 초기부터 함께 시간을 보내며 가까운 동료가 됐다. 보도국 안에 입장 차이가 생기기 전부터 이어진 관계다.',
    type: 'relationship',
    people: ['myung-chonghee', 'bab-dwaegil', 'na-iksu'],
    steps: [], contrast: null,
    articleIds: [], eventIds: [], clipUrls: [],
    ...curator,
  },
  {
    id: 'joint-live-report',
    day: null,
    when: null,
    title: '함께 현장으로 간 기자들',
    summary: '여러 기자가 시장·경찰청장 관련 사건을 함께 취재하고 생방송으로 보도했다.',
    type: 'reporting',
    people: ['shin-ibi', 'myung-chonghee', 'sung-haechun', 'peter-jangparker', 'go-mukhee'],
    steps: [], contrast: null,
    articleIds: [], eventIds: [], clipUrls: [],
    ...curator,
  },
  {
    id: 'day04-shin-police-case',
    day: 4,
    when: null,
    title: '경찰 관련 사건을 끝까지 따라간 취재',
    summary: '신이비는 경찰 관련 사건 하나를 따라가며, 사건을 정리하고 현장에서 보도한 뒤 관련자 인터뷰로 이어 갔다.',
    type: 'reporting',
    people: ['shin-ibi'],
    steps: [
      {label: '사건 정리', summary: null, articleIds: []},
      {label: '현장 보도', summary: null, articleIds: []},
      {label: '관련자 인터뷰', summary: null, articleIds: []},
    ],
    contrast: null,
    articleIds: [], eventIds: [], clipUrls: [],
    ...curator,
  },
  {
    id: 'chief-asks-shin',
    day: null,
    when: '초기',
    title: '국장이 신이비에게 건넨 의심',
    summary: '이윤진은 보도국 안의 수상한 움직임을 감지하고 신이비에게 협력을 요청했다. 여러 기자와 정보를 맞춰 보기도 했다.',
    type: 'conflict',
    people: ['lee-yoonjin', 'shin-ibi'],
    steps: [], contrast: null,
    articleIds: [], eventIds: [], clipUrls: [],
    ...curator,
  },
  {
    id: 'chonghee-tracks',
    day: null,
    when: null,
    title: '명총희가 쫓은 움직임',
    summary: '명총희는 나익수의 수상한 움직임을 추적했고, 그 내용을 이윤진에게 알렸다.',
    type: 'conflict',
    people: ['myung-chonghee', 'na-iksu', 'lee-yoonjin'],
    steps: [], contrast: null,
    articleIds: [], eventIds: [], clipUrls: [],
    ...curator,
  },
  {
    id: 'peter-asks',
    day: null,
    when: '초기',
    title: '함께 움직이기 전의 질문',
    summary: '피터장파커는 나익수에게 계획의 목적과 이윤진 국장의 향후 위치를 직접 물었다. 다른 기자들이 반대한다면 각자의 저널리즘을 존중하겠다는 이야기도 남겼다.',
    type: 'conflict',
    people: ['peter-jangparker', 'na-iksu'],
    steps: [], contrast: null,
    articleIds: [], eventIds: [], clipUrls: [],
    ...curator,
  },
  {
    id: 'news-desk-bab',
    day: null,
    when: null,
    title: '9시 뉴스의 진행석',
    summary: '밥돼길이 9시 뉴스 진행을 맡았다.',
    type: 'news',
    people: ['bab-dwaegil'],
    steps: [], contrast: null,
    articleIds: [], eventIds: [], clipUrls: [],
    ...curator,
  },
  {
    // 구성원은 politics.js DAY 14 기록과 같다 (validate 가 일치 여부를 검사한다)
    id: 'day14-war-correspondents',
    day: 14,
    when: null,
    title: '보도국 기자들이 전쟁 현장으로 들어갔다',
    summary: '전쟁이 벌어진 날, 보도국 기자 여덟 명이 종군기자로 현장에 들어갔다.',
    type: 'reporting',
    people: ['lee-yoonjin', 'shin-ibi', 'go-mukhee', 'king-gija', 'na-iksu', 'peter-jangparker', 'lee-julman', 'sung-haechun'],
    steps: [],
    contrast: {label: '갱단연합으로 참전', people: ['myung-chonghee']},
    articleIds: [], eventIds: [], clipUrls: [],
    verification: 'partial', sourceType: 'community-summary', sourceUrl: null, notes: 'NEWSROOM POLITICS DAY 14 기록과 같은 출처',
  },
];

export const STORY_TYPES = {
  'daily-life': {label: 'DAILY LIFE', ko: '보도국 생활'},
  reporting: {label: 'REPORTING', ko: '취재'},
  news: {label: 'ON AIR', ko: '뉴스 진행'},
  conflict: {label: 'INSIDE THE NEWSROOM', ko: '보도국 안의 갈등'},
  relationship: {label: 'COLLEAGUES', ko: '동료'},
  incident: {label: 'INCIDENT', ko: '휘말린 사건'},
  farewell: {label: 'FAREWELL', ko: '마지막'},
};
