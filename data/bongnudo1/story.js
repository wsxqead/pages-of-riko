// 봉누도 1 · STORY 챕터
//
// beats[].type
//   text    : 짧은 서술 { text }
//   titles  : 불리던 이름들 { label, items[] }
//   photo   : 사진 자리 { src|null, caption, variant: 'cctv' | 'polaroid', cam? }
//   event   : 사건 카드 { date, title, text, incident? }
//   quote   : 대사/말의 요지 { speaker, text, paraphrase: true }  ← 원문이 확인되지 않은 말은 paraphrase로 표시
//   shift   : 관계 변화 다이어그램 { mode: 'join'|'spy'|'family'|'split'|'return', left, right, note }
//   warning : 교육생의 저주 { count, text }
//   people  : 이 챕터의 사람들 { ids[] }
//   next    : 다른 페이지로 이어짐 { href, label }
// side: police | chilssang | cheongryong | both  (렌즈 강조에 사용)

export const chapters = [
  {
    id: 'princess',
    no: '01',
    title: '칠쌍파의 공주',
    en: 'THE PRINCESS OF CHILSSANG',
    period: '11월 말',
    side: 'chilssang',
    beats: [
      { type: 'text', text: '시작은 경찰서가 아니라 수영장이었다. 김떡순, 엄태봉과 아르바이트를 하며 가까워졌고, 김떡순과는 금세 찐친이 되었다.' },
      { type: 'people', ids: ['kim-tteoksun', 'eom-taebong'] },
      { type: 'text', text: '먼저 연락해 온 건 담길동이었다. 칠쌍파에 들어오라는 권유. 창단 무렵, 정유자는 김떡순도 함께 데려와 달라고 부탁했다.' },
      { type: 'shift', mode: 'join', left: '칠쌍파', right: '정유자', note: '가족이 생기다' },
      { type: 'photo', src: null, variant: 'polaroid', caption: '칠쌍파 시절의 정유자' },
      { type: 'text', text: '마이너스 통장으로 가입했고, 툭하면 추락사했고, 늘 말괄량이였다. 보스 쌍칠아재를 "아부지"라 불렀다. 봉봉그램 활동이 활발하다며 담길동은 그녀를 홍보팀장에 앉혔다.' },
      { type: 'titles', label: '칠쌍파에서 불린 이름', items: ['공주', '철부지 막내딸', '아픈 손가락', '홍보팀장'] },
      { type: 'people', ids: ['dam-gildong', 'ssangchil-ajae'] },
    ],
  },
  {
    id: 'double-agent',
    no: '02',
    title: '이중 스파이',
    en: 'DOUBLE AGENT',
    period: '12월 초',
    side: 'both',
    beats: [
      { type: 'text', text: '경찰에 이중 스파이로 들어가고 싶다 — 먼저 말을 꺼낸 건 정유자였다. 담길동은 허락했다.' },
      { type: 'event', date: '12월 초', title: '칠쌍파 일시 탈퇴 → 경찰 3기 공채 지원', text: '겉으로는 칠쌍파를 떠난 사람이 되었다.' },
      { type: 'text', text: '면접장에서 보여 준 찰진 테이저건 리액션. 이른바 "장난감 전형"으로, 정유자는 경찰 3기에 합격했다.' },
      { type: 'shift', mode: 'spy', left: '칠쌍파', right: '경찰', note: '소속과 잠입처' },
      { type: 'text', text: '이때까지의 구도는 단순했다. 칠쌍파가 집이고, 경찰은 잠입할 곳.' },
    ],
  },
  {
    id: 'class03',
    no: '03',
    title: '경찰 3기',
    en: 'POLICE CLASS 03',
    period: '12.05 – 12.09',
    side: 'police',
    beats: [
      { type: 'warning', count: 1, text: '12.05 첫 출근 직후 — 불춘원샷 갱단 점거 사건 발생. 정유자: 교육생.' },
      { type: 'text', text: '3기 동기는 김은휘, 싹윤모. 처음엔 어색했지만 김편집, 노다비, 황린준의 도움으로 빠르게 가까워졌다. 사람들은 이들을 "3기 폐급즈", "초록머리 3인방"이라 불렀다.' },
      { type: 'people', ids: ['kim-eunhwi', 'ssak-yunmo'] },
      { type: 'text', text: '자칭 3기 에이스. 싹윤모를 폐급이라 놀리고 — 그리고 번번이 싹윤모에게 졌다.' },
      { type: 'photo', src: null, variant: 'cctv', cam: 'CAM 03 · LSPD', caption: '경찰 3기 시절' },
      { type: 'text', text: '평소에는 경찰서의 장난감. 하지만 막상 중요한 순간에는 싸우는 경찰이었다.' },
      { type: 'event', date: '12.08', title: '서부식 야차룰 — 10승 6패', text: '짜누, 김편집, 유우냥 같은 총기 숙련자들에게도 밀리지 않았다.', incident: 'shooting-test' },
      { type: 'event', date: '12.09', title: '오승철 군사독재 사건', text: '강두만이 헬기 사격수로 임명. 헬기가 제 역할을 못 하자 서보건, 김편집과 후방침투조로.', incident: 'oh-seungcheol' },
    ],
  },
  {
    id: 'two-families',
    no: '04',
    title: '두 개의 가족',
    en: 'TWO FAMILIES',
    period: '12월 둘째 주',
    side: 'both',
    beats: [
      { type: 'text', text: '김망내, 노다비처럼 원래 알던 얼굴도 있었다. 계급에 상관없이 티격태격하다 보니, 경찰서에도 정유자의 사람들이 생겼다.' },
      { type: 'text', text: '칠쌍파의 동맹 청룡그룹에도 인연이 뻗어 있었다. 할머니처럼 따르던 정복자, 만나면 주먹부터 나가는 삼촌 김승윤. 그리고 택시기사 시절 자신의 첫 손님을 기억하던 김동균 — 정유자는 그 이야기를 듣기 전까지 기억하지 못했다.' },
      { type: 'people', ids: ['jeong-bokja', 'kim-seungyun', 'kim-donggyun'] },
      { type: 'shift', mode: 'family', left: '칠쌍파', right: '경찰', note: '둘 다 가족' },
      { type: 'text', text: '"스파이"라는 단어는 점점 정유자를 설명하지 못하게 되었다.' },
      { type: 'warning', count: 2, text: '12.13 일일 경찰 김띠용의 마편으로 다시 교육생 강등. 같은 날 경찰청 습격.' },
      { type: 'event', date: '12.13', title: '경찰청 습격 — 정문 홀로 방어, 5킬', text: '봉창섭 청장이 사망한 뒤 열린 임시청장 회의 도중, 청룡그룹과 우성테크닉의 습격.', incident: 'hq-attack' },
    ],
  },
  {
    id: 'dec14',
    no: '05',
    title: '12월 14일',
    en: 'DECEMBER 14',
    period: '12.14',
    side: 'both',
    beats: [
      { type: 'text', text: '남북전쟁을 앞두고 갱단들이 북부로 모이기 시작했다. 담길동과 김동균의 연락으로, 정유자는 이 소식을 비교적 일찍 알게 된다.' },
      { type: 'text', text: '질문은 "어느 쪽이 옳은가"가 아니었다. 두 가족 중 한쪽에게 총을 겨눠야 하는가.', emphasis: true },
      { type: 'quote', speaker: '담길동', paraphrase: true, text: '앞으로 칠쌍파 사람들에게 연락하지 마라. 적으로 만나면 미련 없이 쏴라. 경찰에서 떳떳하게 살아라.' },
      { type: 'quote', speaker: '정유자', paraphrase: true, text: '어디에서 무엇을 하든, 담길동도 칠쌍파도 가족이다.' },
      { type: 'text', text: '추방이 아니라 보호였다. 그리고 담길동은 정말로, 그 뒤 정유자를 만나도 모르는 사람처럼 대했다. 그게 가장 힘들었다.' },
      { type: 'text', text: '경찰도 갈라졌다. 노다비, 가레나, 황린준이 북부로 향했다. 황린준과의 마지막 통화에서 정유자는 흔들렸다. 청룡의 김동균도 북부에 남았다. 서로 몸조심하라는 말이 작별이었다.' },
      { type: 'shift', mode: 'split', left: '북부', right: '남부', note: '알던 사람들이 갈라지다' },
      { type: 'next', href: '/bongnudo-1/people', label: 'DEC 14의 관계도 보기' },
    ],
  },
  {
    id: 'war',
    no: '06',
    title: '남북전쟁',
    en: 'THE CIVIL WAR',
    period: '12.14 밤',
    side: 'both',
    beats: [
      { type: 'text', text: '그날 저녁, 칠쌍파는 북부와 함께할 이유가 없다고 판단하고 남부로 돌아왔다. 소식을 전해 준 건 엄태봉이었다.' },
      { type: 'shift', mode: 'return', left: '칠쌍파', right: '정유자', note: '다시 이어지다' },
      { type: 'text', text: '다시 연락하고, 다시 만나고, 전쟁을 앞두고 함께 시간을 보냈다.' },
      { type: 'text', text: '그리고 알게 된다. 김편집을 비롯한 사람들은 그녀가 스파이라는 걸 이미 알고 있었다. 알고도 눈감아 주고 있었다.', emphasis: true },
      { type: 'warning', count: 3, text: '12.14 남북전쟁. 정유자: 여전히 교육생.' },
      { type: 'event', date: '12.14', title: '남북전쟁', text: '칠쌍파는 같은 편으로. 김동균은 반대편으로.', incident: 'civil-war' },
    ],
  },
  {
    id: 'reunion',
    no: '07',
    title: '다시 만난 사람들',
    en: 'REUNION',
    period: '전쟁 이후',
    side: 'both',
    beats: [
      { type: 'text', text: '전쟁이 끝나고, 정유자는 경찰로서 순직하려 했다. 남부로 돌아온 김동균이 그녀를 EMS로 데려가 살렸다.' },
      { type: 'text', text: '마음대로 살렸다고 주먹을 휘둘렀고 — 그다음엔 함께 사진을 찍었다.' },
      { type: 'photo', src: null, variant: 'polaroid', caption: '전쟁 뒤의 사진' },
      { type: 'text', text: '엔딩 영상에는 예전에 실수로 찍힌 두 사람의 하트 사진이 실렸다. 본의 아니게 서버 전체에 박제. 후일담에서는 그냥 친구로 지내는 게 편하다는 이야기를 남겼다.' },
      { type: 'titles', label: '김동균과의 관계', items: ['미묘한 사이', '전쟁으로 갈라짐', '생사를 거친 재회', '좋은 인연'] },
    ],
  },
  {
    id: 'last-night',
    no: '08',
    title: '마지막 밤',
    en: 'THE LAST NIGHT',
    period: '12.15 – 12.17',
    side: 'both',
    beats: [
      { type: 'text', text: '야유회, 우주 비행선 탈출, 하나씩 건넨 마지막 인사, 보석상과 은행, 결혼식 사회와 축가. 경찰 동료들과 단체사진을 찍고 — 정유자는 칠쌍파 아지트로 향했다.' },
      { type: 'next', href: '/bongnudo-1/ending', label: '마지막 밤 펼치기' },
    ],
  },
];
