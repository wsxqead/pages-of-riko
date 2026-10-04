// 픽크타2 · WORLD PROGRESS — 서버 전체에서 열린 콘텐츠
// 리코 개인 기록이 아니다. 리코의 참가가 확인되지 않은 항목은 "WORLD EVENT"로만 표시한다.
// 리코 참가가 확인되면 rikoEncounter 에 encounters.js id 를 넣는다.
// 서버에 콘텐츠가 존재했다 ≠ 리코가 해당 콘텐츠를 클리어했다.

export const worldEvents = [
  { date: '02.21', iso: '2026-02-21', kind: 'server', label: 'SERVER OPEN', ko: '서버 오픈 18:00', rikoEncounter: null },
  { date: '02.22', iso: '2026-02-22', kind: 'boss', label: 'WARDEN · WITHER · ENDER DRAGON', ko: '워든 · 위더 · 엔더 드래곤', note: '어비스 던전', rikoEncounter: null },
  { date: '02.23', iso: '2026-02-23', kind: 'dungeon', label: 'LABYRINTH', ko: '미궁 콘텐츠 추가', note: '그록타 · 탈루스 등', rikoEncounter: null },
  { date: '02.24', iso: '2026-02-24', kind: 'boss', label: '그룬자크', ko: '그룬자크', rikoEncounter: null },
  { date: '02.26', iso: '2026-02-26', kind: 'boss', label: '아르카논', ko: '아르카논', rikoEncounter: null },
  { date: '03.01', iso: '2026-03-01', kind: 'boss', label: '바르바토스', ko: '바르바토스', rikoEncounter: null },
  { date: '03.03', iso: '2026-03-03', kind: 'rest', label: 'SERVER REST', ko: '서버 휴식', rikoEncounter: null },
  { date: '03.05', iso: '2026-03-05', kind: 'boss', label: '크로웰', ko: '크로웰', rikoEncounter: null },
  { date: '03.07', iso: '2026-03-07', kind: 'boss', label: '데카엘', ko: '데카엘', note: '최종 단계 · 2관문 구조 · 권장 장비 레벨 1030', rikoEncounter: null },
  { date: '03.09', iso: '2026-03-09', kind: 'server', label: 'SERVER CLOSE', ko: '서버 종료 00:00', rikoEncounter: null },
];

// 서버 달력 (02.21 ~ 03.09)
export const serverDays = (() => {
  const out = [];
  const d = new Date('2026-02-21T00:00:00');
  const end = new Date('2026-03-09T00:00:00');
  while (d <= end) {
    out.push(`${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`);
    d.setDate(d.getDate() + 1);
  }
  return out;
})();
