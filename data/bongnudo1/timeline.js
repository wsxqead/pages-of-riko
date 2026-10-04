// 봉누도 1 · 날짜별 기록 (정유자에게 중요한 날만)
//
// edu: 그날 정유자가 교육생 신분이었는지 (교육생의 저주 표시)
// entries[].side: police | chilssang | cheongryong | both
// entries[].kind: relation | join | role | duty | war | loss | farewell | fun | end
// entries[].incident: incidents.js id (사건 파일로 연결)

export const days = [
  {
    id: 'nov',
    date: '11월 말',
    label: 'NOV',
    entries: [
      { side: 'chilssang', kind: 'relation', text: '수영장 아르바이트에서 김떡순·엄태봉과 가까워짐', people: ['kim-tteoksun', 'eom-taebong'] },
      { side: 'chilssang', kind: 'join', text: '담길동의 권유로 칠쌍파 가입 — 창단 때 김떡순도 함께', people: ['dam-gildong', 'kim-tteoksun'] },
      { side: 'chilssang', kind: 'role', text: '봉봉그램 활동으로 홍보팀장 임명', people: ['dam-gildong'] },
    ],
  },
  {
    id: 'early-dec',
    date: '12월 초',
    label: 'DEC',
    entries: [
      { side: 'chilssang', kind: 'role', text: '이중 스파이 계획 — 담길동의 허락, 칠쌍파 일시 탈퇴', people: ['dam-gildong'] },
      { side: 'police', kind: 'join', text: '경찰 3기 공채 합격 · 이른바 "장난감 전형"' },
    ],
  },
  {
    id: 'dec05',
    date: '12.05',
    label: 'DEC 05',
    edu: true,
    entries: [
      { side: 'police', kind: 'duty', text: '경찰 첫 출근' },
      { side: 'police', kind: 'war', text: '첫 출근 직후 불춘원샷 갱단 점거 사건', incident: 'curse' },
    ],
  },
  {
    id: 'dec08',
    date: '12.08',
    label: 'DEC 08',
    entries: [
      { side: 'police', kind: 'duty', text: '동료들과 서부식 야차룰 — 10승 6패', incident: 'shooting-test', people: ['jjanu', 'kim-pyeonjip', 'yuunyang'] },
    ],
  },
  {
    id: 'dec09',
    date: '12.09',
    label: 'DEC 09',
    entries: [
      { side: 'police', kind: 'war', text: '오승철 군사독재 사건 — 헬기 사격수에서 후방침투조로', incident: 'oh-seungcheol', people: ['kang-duman', 'seo-bogeon', 'kim-pyeonjip'] },
    ],
  },
  {
    id: 'dec13',
    date: '12.13',
    label: 'DEC 13',
    edu: true,
    entries: [
      { side: 'police', kind: 'fun', text: '일일 경찰 김띠용의 마편으로 다시 교육생 강등', incident: 'curse', people: ['kim-ttiyong'] },
      { side: 'police', kind: 'loss', text: '봉창섭 청장 사망', people: ['bong-changseop'] },
      { side: 'police', kind: 'war', text: '임시청장 회의 중 청룡그룹·우성테크닉의 습격 — 정문 홀로 방어, 5킬', incident: 'hq-attack' },
    ],
  },
  {
    id: 'dec14',
    date: '12.14',
    label: 'DEC 14',
    edu: true,
    entries: [
      { side: 'chilssang', kind: 'farewell', text: '담길동의 연락 — 칠쌍파에서 내보내짐', incident: 'dec14-choice', people: ['dam-gildong'] },
      { side: 'police', kind: 'farewell', text: '노다비·가레나·황린준 북부행, 황린준과 마지막 통화', people: ['no-dabi', 'garena', 'hwang-rinjun'] },
      { side: 'cheongryong', kind: 'farewell', text: '북부에 남는 김동균과 서로 몸조심하라며 작별', people: ['kim-donggyun'] },
      { side: 'chilssang', kind: 'relation', text: '저녁, 칠쌍파 남부 합류 — 엄태봉이 전한 소식', incident: 'civil-war', people: ['eom-taebong'] },
      { side: 'both', kind: 'war', text: '남북전쟁', incident: 'civil-war' },
      { side: 'cheongryong', kind: 'relation', text: '전쟁 뒤, 순직하려던 정유자를 김동균이 EMS로', incident: 'civil-war', people: ['kim-donggyun', 'ems'] },
    ],
  },
  {
    id: 'dec15',
    date: '12.15',
    label: 'DEC 15',
    entries: [
      { side: 'police', kind: 'fun', text: '경찰 야유회' },
      { side: 'police', kind: 'fun', text: '우주 비행선 탑승 — 관광이 아니라 노동이라 탈출', people: ['jjanu', 'ssak-yunmo', 'kim-pyeonjip', 'temin-tv'] },
    ],
  },
  {
    id: 'dec16',
    date: '12.16',
    label: 'DEC 16',
    entries: [
      { side: 'both', kind: 'farewell', text: '함께했던 사람들과 하나씩 마지막 인사', people: ['kim-mangnae', 'kang-duman', 'kim-seungyun'] },
      { side: 'both', kind: 'fun', text: '보석상 털이(혼자, 즉시 제압) → 은행털이 성공', people: ['kim-mangnae', 'kim-eunhwi', 'eom-taebong', 'kim-seungyun'] },
      { side: 'police', kind: 'fun', text: '김편집 결혼식 사회 · 축가, 이후 콘서트', people: ['kim-pyeonjip'] },
      { side: 'police', kind: 'farewell', text: '경찰 동료들과 단체사진, 작별' },
      { side: 'chilssang', kind: 'relation', text: '칠쌍파 아지트로 — 다시 가족들과', people: ['dam-gildong', 'ssangchil-ajae', 'kim-tteoksun', 'eom-taebong'] },
    ],
  },
  {
    id: 'end',
    date: '12.17 00:07',
    label: 'END',
    entries: [{ side: 'both', kind: 'end', text: '서버 종료' }],
  },
];
