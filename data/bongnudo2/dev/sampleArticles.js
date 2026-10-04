// DEV SAMPLE — 개발/부하 테스트 전용 가짜 데이터. 실제 기사처럼 보이지 않게 [DEV SAMPLE] 로 표시한다.
// articles/index.js 에서 NODE_ENV !== 'production' 이고 NEXT_PUBLIC_BBS_DEV_SAMPLE 가 설정됐을 때만 불러온다.
// 사진은 프로젝트에 이미 있는 이미지(대표 썸네일/로고)를 빌려 쓴다. 영상 파일은 /media/dev-sample.mp4 (없으면 재생만 안 됨).

const CATS = ['DEV-CATEGORY-A', 'DEV-CATEGORY-B', 'DEV-CATEGORY-C'];
const AUTHORS = ['shin-ibi', 'lee-yoonjin', 'myung-chonghee', 'na-iksu', 'go-mukhee', null];
const IMGS = [
  {src: '/images/bongnudo-2.jpg', width: 720, height: 404},
  {src: '/images/goaon.jpg', width: 720, height: 404},
  {src: '/images/pixel-town-2.jpg', width: 720, height: 404},
  {src: '/images/pages/goaon/logo.webp', width: 365, height: 264}, // 4:3 에 가까운 비율
  {src: '/images/pages/bongnudo-1/logo.webp', width: 348, height: 226},
  {src: '/images/bongnudo-2/group-chilssang.webp', width: 500, height: 281},
];
const TALL = {src: '/images/pages/bongketmon/logo.webp', width: 121, height: 200}; // 세로형 비율 시험용 (실제 파일은 가로라 contain 으로 보임)
const p = (text) => ({type: 'paragraph', text: `[DEV SAMPLE] ${text}`});
const img = (n, caption = null) => ({type: 'image', ...IMGS[n % IMGS.length], alt: null, caption});

// 블록 구성 패턴: 텍스트만 / 사진과 문장이 번갈아 / 중간에 영상 / 사진 30장 / 갤러리 / 제목·인용·구분선
function contentFor(i) {
  switch (i % 6) {
    case 0:
      return [p(`텍스트만 있는 기사 #${i}. 사진이 없는 기사는 텍스트 기사로 보인다.`), p('둘째 문단. 검색 테스트용 단어: 경찰.'), p('셋째 문단.')];
    case 1:
      return [p(`문장과 사진이 번갈아 나오는 기사 #${i}.`), img(i), img(i + 1), p('사진 두 장 뒤의 설명 문장.'), img(i + 2, '[DEV SAMPLE] 캡션'), p('다음 설명.'), img(i + 3), p('마지막 문장.')];
    case 2:
      return [p(`중간에 영상이 있는 기사 #${i}.`), img(i), p('사진 뒤 문장.'), {type: 'video', src: '/media/dev-sample.mp4', poster: IMGS[1].src, width: 720, height: 404}, p('영상 뒤 문장.')];
    case 3:
      return i % 4 === 3
        ? [p(`사진이 아주 많은 기사 #${i} (30장).`), ...Array.from({length: 30}, (_, k) => (k % 7 === 6 ? p(`중간 설명 ${k}.`) : k === 10 ? {type: 'image', ...TALL, caption: '[DEV SAMPLE] 세로형'} : img(k)))]
        : [p(`짧은 기사 #${i}.`)];
    case 4:
      return [p(`갤러리 블록이 있는 기사 #${i}.`), {type: 'gallery', images: [0, 1, 2, 3].map((k) => ({...IMGS[k]})), caption: '[DEV SAMPLE] 묶음 사진'}, p('갤러리 뒤 문장.')];
    default:
      return [{type: 'heading', text: '[DEV SAMPLE] 소제목'}, p(`제목·인용·구분선이 있는 기사 #${i}.`), {type: 'quote', text: '[DEV SAMPLE] 인용문', cite: 'DEV'}, {type: 'divider'}, p('구분선 뒤 문장. 경찰')];
  }
}

export function makeSampleArticles(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    const authorId = AUTHORS[i % AUTHORS.length];
    out.push({
      id: `dev-${i}`,
      originalId: null,
      title: `[DEV SAMPLE] 개발용 기사 #${i}`,
      category: CATS[i % CATS.length],
      authorId,
      authorName: authorId ? null : 'DEV 외부 기자',
      publishedAt: `2026-09-${String((i % 21) + 1).padStart(2, '0')}T${String(10 + (i % 12)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
      day: (i % 21) + 1,
      content: contentFor(i),
      relatedPeople: i % 5 === 0 ? ['shin-ibi'] : [],
      relatedEvents: [],
      tags: ['dev'],
      isShinIbiArticle: authorId === 'shin-ibi',
      featuresShinIbi: i % 5 === 0,
      featured: i <= 3,
      devSample: true,
    });
  }
  return out;
}

// DEV SAMPLE 롤링페이퍼 — 긴 편지/짧은 편지 화면 확인용. 실제 원문이 아니다.
export function makeSampleLetters() {
  const long = Array.from({length: 14}, (_, i) => `[DEV SAMPLE] 긴 편지 확인용 문단 ${i + 1}. 실제 롤링페이퍼가 아닙니다.`).join('\n\n');
  return [
    {id: 'dev-letter-1', fromPersonId: 'lee-yoonjin', toPersonId: 'shin-ibi', title: null, body: long, writtenAt: null, order: 1, image: null, relatedArticleIds: [], relatedEventIds: [], devSample: true},
    {id: 'dev-letter-2', fromPersonId: 'king-gija', toPersonId: 'shin-ibi', title: null, body: '[DEV SAMPLE] 짧은 편지.', writtenAt: null, order: 2, image: null, relatedArticleIds: [], relatedEventIds: [], devSample: true},
  ];
}
