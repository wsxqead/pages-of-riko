// 고아온 · 사진/클립
// url 이 null 인 항목은 화면에 나오지 않는다. (빈 플레이어를 만들지 않기 위해)
//
// type: clip | vod | photo
// people: party.js id / quest: quests.js id / memory: memories.js id

export const media = [
  { id: 'clip-guild-name', type: 'clip', title: '고아온, 이름이 생기다', date: '2025-12-22', people: ['tamtam', 'riko', 'gosudal'], quest: 'create-guild', memory: 'guild-name', url: null, thumbnail: null },
  { id: 'clip-hidden', type: 'clip', title: '히든 탐색', date: '2025-12-23', people: ['riko'], quest: 'hidden-search', memory: 'hidden-together', url: null, thumbnail: null },
  { id: 'clip-dbd', type: 'clip', title: '점검 중 데바데', date: '2025-12-23', people: ['riko'], quest: null, memory: 'dbd-maintenance', url: null, thumbnail: null },
  { id: 'clip-rin-cover', type: 'clip', title: '린의 커버곡 감상', date: '2025-12-24', people: ['aokumo-rin', 'riko'], quest: null, memory: 'rin-cover', url: null, thumbnail: null },
  { id: 'clip-chef', type: 'clip', title: '요리사 히든 추리', date: '2025-12-24', people: ['tamtam', 'riko'], quest: 'chef-hidden', memory: 'chef-hidden', url: null, thumbnail: null },
];

const has = (m) => Boolean(m.url);
export const mediaForMember = (id) => media.filter((m) => has(m) && m.people.includes(id));
export const mediaForQuest = (id) => media.filter((m) => has(m) && m.quest === id);
export const mediaForMemory = (id) => media.filter((m) => has(m) && m.memory === id);
