// 고아온 · 공통 메타
// 확인되지 않은 수치(플레이타임, 길드 레벨, 클리어율 등)는 넣지 않는다.

export const guild = {
  name: '고아온',
  en: 'GOAON',
  game: '멋사 공책 RPG',
  gameEn: 'MUTSA NOTE RPG',
  origin: '고수달 아트 온라인',
  master: 'gosudal',
  style: '레이드 · 생활',
  styleEn: 'RAID · LIFE',
  status: 'COMPLETE',
  since: '2025.12.21',
  slot: '02', // PAGES OF RIKO의 PAGE 02 = SAVE SLOT 02
};

export const sections = [
  { href: '/goaon', label: 'SAVE', ko: '세이브' },
  { href: '/goaon/party', label: 'PARTY', ko: '길드원' },
  { href: '/goaon/adventure', label: 'ADVENTURE', ko: '모험 일지' },
  { href: '/goaon/quests', label: 'QUESTS', ko: '퀘스트' },
  { href: '/goaon/memories', label: 'MEMORIES', ko: '기억' },
  { href: '/goaon/ending', label: 'LAST SAVE', ko: '마지막 저장' },
];
