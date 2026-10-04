// 픽크타2 · ENCOUNTER DATA — 리코가 픽크타2 안에서 실제로 누군가와 함께한 장면
//
// 주민 데이터(같은 지역에 산다)·미디어 데이터(영상 제목/태그에 이름이 있다)와 분리한다.
// 같은 지역에 산다 ≠ 같이 행동했다 / 같은 서버 참가 ≠ 같이 플레이 / 영상 태그 ≠ 함께 겪은 사건
// 다른 게임·서버(예: 모라하지마! 서버)의 사건을 넣지 않는다.
//
// 현재 실제 영상/다시보기/클립으로 검증된 장면이 없어 비어 있다. 억지로 채우지 않는다.
// 확인되면 아래 형태로 한 건씩 추가 → 지도 핀, 주민 카드, TOWN STORIES, JOURNEY 달력에 자동 연결된다.
//
// {
//   id: 'example',
//   type: 'encounter' | 'visit' | 'relationship' | 'event',
//   date: '2026-03-01',            // 모르면 null → TOWN STORIES (달력에는 넣지 않음)
//   location: 'sepia',             // 모르면 null → 지도 핀을 만들지 않음
//   people: ['riko', 'lize'],
//   relatedPeople: [],
//   title: '...',
//   summary: '...',                // 확인된 내용만
//   mediaIds: [],
//   verification: 'confirmed',
// }

export const encounters = [];

const ok = (e) => e.verification === 'confirmed';
export const encountersById = Object.fromEntries(encounters.map((e) => [e.id, e]));
export const encountersIn = (regionId) => encounters.filter((e) => ok(e) && e.location === regionId);
export const encountersWith = (residentId) =>
  encounters.filter((e) => ok(e) && residentId !== 'riko' && (e.people.includes(residentId) || e.relatedPeople?.includes(residentId)));
export const rikoStories = () => encounters.filter((e) => ok(e) && e.people.includes('riko'));
export const undatedStories = () => rikoStories().filter((e) => !e.date);
export const storiesWithResidentsOf = (ids) => encounters.filter((e) => ok(e) && ids.some((id) => e.people.includes(id)));
