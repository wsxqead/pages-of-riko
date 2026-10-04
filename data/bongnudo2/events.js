// 봉누도 2 · 사건(EVENT) — 도시에서 일어난 일. 기사와 분리한다(기사 자체가 사건은 아니다).
// 보도국 안의 입장(politics.js)이나 기자들의 장면(newsroomStories.js)과도 다른 기록이다.
//   EVENT    : 보도국 총파업, 경찰서 전투 …
//   POLITICS : 강경파 / 온건파 …            → politics.js
//   STORY    : 공동 현장 취재, 9시 뉴스 진행 … → newsroomStories.js
// 하나의 사건에 여러 기사가, 하나의 기사에 여러 사람이 연결될 수 있다.
// 기사 연결은 articles 의 relatedEvents 로도, 여기의 articleIds 로도 할 수 있다(둘 다 역계산됨).
//
// {
//   id: 'day04-...',
//   day: 4,                 // DAY 번호
//   date: '2026-..-..',     // 모르면 null
//   title: '...',
//   type: 'field' | 'interview' | 'newsroom' | 'war' | 'farewell' | 'other',
//   summary: '...',         // 확인된 내용만
//   people: ['shin-ibi'],
//   articleIds: [],
//   mediaIds: [],
//   verified: true,         // false 면 화면에 나오지 않는다
//   verification: 'confirmed' | 'partial' | 'unverified',
//   sourceType: 'bbs-article' | 'clip' | 'vod' | 'participant' | 'community-summary' | 'curator',
//   sourceUrl: null, notes: null,
// }
//
// 커뮤니티 요약은 사건을 찾는 단서로만 쓰고, BBS 기사·클립·VOD·당사자 대화가 확보되면 그쪽을 우선한다.

export const events = [];
