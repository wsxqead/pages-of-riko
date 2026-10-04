// 봉누도 1 · 사진/클립 아카이브
//
// 실제 자료가 생기면 url/thumbnail 을 채운다.
// url 이 null 인 항목은 화면에 노출되지 않는다. (가짜 플레이어를 띄우지 않기 위해)
//
// type: clip | vod | photo
// people: people.js id 목록 / event: incidents.js id 또는 ending.js scene id
// source 예: 'chzzk-clip' | 'chzzk-vod' | 'bongnudo-archive'

export const media = [
  { id: 'clip-interview', type: 'clip', title: '경찰 3기 면접 — 테이저건 리액션', url: null, thumbnail: null, source: null, date: '2024-12', people: [], event: null },
  { id: 'clip-shooting', type: 'clip', title: '서부식 야차룰 10승 6패', url: null, thumbnail: null, source: null, date: '2024-12-08', people: ['jjanu', 'kim-pyeonjip', 'yuunyang'], event: 'shooting-test' },
  { id: 'clip-hq-gate', type: 'clip', title: '경찰청 정문 방어', url: null, thumbnail: null, source: null, date: '2024-12-13', people: [], event: 'hq-attack' },
  { id: 'clip-leave-chilssang', type: 'clip', title: '담길동의 연락', url: null, thumbnail: null, source: null, date: '2024-12-14', people: ['dam-gildong'], event: 'dec14-choice' },
  { id: 'clip-donggyun-farewell', type: 'clip', title: '김동균과의 작별', url: null, thumbnail: null, source: null, date: '2024-12-14', people: ['kim-donggyun'], event: 'dec14-choice' },
  { id: 'clip-rooftop', type: 'clip', title: '경찰청 옥상의 통화', url: null, thumbnail: null, source: null, date: '2024-12-16', people: ['kang-duman'], event: 'duman' },
  { id: 'clip-wedding', type: 'clip', title: '김편집 결혼식 사회', url: null, thumbnail: null, source: null, date: '2024-12-16', people: ['kim-pyeonjip'], event: 'wedding' },
];

const available = (m) => Boolean(m.url);

export const mediaForPerson = (id) => media.filter((m) => available(m) && m.people.includes(id));
export const mediaForEvent = (id) => media.filter((m) => available(m) && m.event === id);
