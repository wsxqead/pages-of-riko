# 봉누도 2 · 신이비 PRESS ARCHIVE — 데이터 가이드

`/bongnudo-2` 전시는 화면 코드(JSX/CSS)를 고치지 않고 **데이터만 넣으면** 자동으로 채워집니다.
기사 858건, 사진·영상, 사건, 롤링페이퍼 모두 아래 파일에만 추가하세요.

```
data/bongnudo2/
  meta.js                 아카이브 정보 (원본 규모 858, 서버 기간, 신이비 기자 정보)
  articles/articles.json  ★ BBS 기사 배열 — import 스크립트가 만든다
  articles/index.js       정규화 + 파생 helper (getArticleImages / getArticleThumbnail …)
  archive/raw/{id}.html   원본 기사 HTML 보관 (import 시 자동, 화면에는 쓰지 않음)
  people.js               사람 — 보도국 기자단(명부 순서) · 관계 · 프로필 (경찰 · 갱단 · 시민 · 그 외도 같은 형식)
  newsroomStories.js      NEWSROOM STORIES — 기자들이 함께 일하고 취재하고 다툰 장면 (사건·입장과 분리)
  politics.js             NEWSROOM POLITICS — 날짜별 보도국 안의 입장 (보도국 안의 기록 하나일 뿐)
  events.js               사건 — 도시에서 일어난 일 (기사와 분리)
  rollingPapers.js        TO SHIN IBI — 롤링페이퍼 원문
  index.js                화면이 쓰는 helper (getArticle, getArticlesByReporter, reporterStats …)
  dev/sampleArticles.js   개발 전용 가짜 데이터 (production 에서는 절대 안 나옴)
scripts/
  import-bbs-articles.mjs 원본 백업 JSON(HTML 포함) → articles.json
  lib/html-to-blocks.mjs  기사 HTML → content 블록 (DOM 순서 그대로)
  validate-bbs.mjs        데이터 검사
  backup-bbs.mjs          BBS 원본 백업 (원본 HTML · 미디어 보존) — 12장
  lib/bbs-*.mjs           백업기 설정 · 요청 · 해석 · 미디어 · manifest
  fixtures/               백업기 시험 서버 (실제 사이트에 요청하지 않음)
public/media/bongnudo-2/articles/{articleId}/  기사 사진·영상
```

화면 반영 흐름: 기사 추가 → ARCHIVE · 기자별 아카이브 · 기사 상세 · FRONT PAGE · REPORTER · TIMELINE · PEOPLE · FINAL EDITION.
개수(기사 수, 기자별 기사 수, 사진 기사 수 …)는 전부 helper가 계산하므로 어디에도 숫자를 따로 적지 않습니다.

---

## 1. 기사 추가 (import)

```bash
# 1) 백업한 원본을 아무 곳에 저장 (배열 또는 { articles: [...] })
# 2) 미리 보기
npm run import:bbs -- path/to/bbs-backup.json --dry
# 3) 실제 반영 (+ 원격 사진/영상을 로컬로 내려받기)
npm run import:bbs -- path/to/bbs-backup.json --download
# 4) 검사
npm run validate:bbs
```

본문은 아래 우선순위로 읽습니다.

1. `content: [...]` — 이미 블록으로 정리된 기사
2. `html` / `contentHtml` / `content_html` / `bodyHtml` (또는 태그가 들어 있는 `wr_content` 등) — **원본 HTML을 DOM 순서대로 블록으로 변환**
3. `body` + `images[]` + `videos[]` — 예전 형식 (본문의 `[[image:1]]` 표식 위치 보존, 표식 없는 미디어는 끝에)

- 원본 필드 이름이 달라도 `scripts/import-bbs-articles.mjs` 상단 `FIELD` 매핑이 흔한 이름(`no`, `subject`, `writer`, `wr_datetime`, `ca_name` …)을 찾습니다. 형식이 다르면 **그 매핑만** 고치세요.
- 원본 HTML은 `data/bongnudo2/archive/raw/{id}.html` 로 보관하고 기사에 `rawSource` 경로를 남깁니다 (`--no-raw` 로 끔). 화면은 raw HTML을 **절대 그대로 렌더링하지 않습니다**(`dangerouslySetInnerHTML` 없음) — 변환 결과 블록만 씁니다.
- 블록으로 옮기지 못한 요소(iframe 등)는 import 로그에 표시됩니다. 원본은 rawSource 에 남아 있으니 필요하면 블록을 손으로 추가하세요.
- 작성자 이름이 `people.js` 의 이름과 같으면 `authorId` 가 자동으로 붙습니다(`신이비` → `shin-ibi`, `isShinIbiArticle: true`). 명단에 없는 이름은 `authorName` 으로만 저장되고 경고가 나옵니다.
- 같은 id 가 이미 있으면 원문 필드는 갱신하고, 전시용 필드(`thumbnail`, `featured`, `isShinIbiArticle`, `featuresShinIbi`, `relatedPeople`, `relatedEvents`, `archiveNote`)는 **보존**합니다. 여러 번 import 해도 안전합니다.

### HTML → 블록 변환 규칙

| 원본 | 블록 |
|---|---|
| `<p>`, `<div>` 등 안의 텍스트 (`<br>` 은 줄바꿈) | `paragraph` |
| `<img>` (`src` 또는 `data-src`, `width`/`height`/`alt`) | `image` |
| `<video>` / `<source>` | `video` |
| `<h1>`~`<h6>` | `heading` |
| `<blockquote>` | `quote` |
| `<hr>` | `divider` |
| class 에 `gallery`/`slide`/`swiper`/`album`/`carousel` 이 있는 묶음 안의 사진 2장 이상 | `gallery` |
| `<script>`, `<style>` | 버림 |
| `<iframe>`, `<embed>`, `<object>` | 보고만 함 (rawSource 에 보존) |

## 2. 기사 JSON schema

```jsonc
{
  "id": "858",                 // 필수. 원본 BBS 글 번호가 있으면 그대로 (route: /bongnudo-2/archive/858)
  "originalId": 858,           // 원본 ID — 절대 버리지 않는다
  "title": "제목",             // 필수
  "category": null,            // 원본 BBS 분류 그대로. 없으면 null (임의 분류 금지)
  "authorId": "shin-ibi",      // people.js id. 명단에 없는 기자면 null + authorName
  "authorName": null,          // authorId 가 없을 때만 원본 작성자 이름
  "publishedAt": "2026-01-02T12:30",   // ISO. 모르면 null
  "day": null,                 // DAY 번호를 직접 지정할 때만. 보통은 meta.serverPeriod.start 로 자동 계산
  "content": [ /* 블록 — 아래 3번. 원본 기사에 나온 순서 그대로 */ ],
  "thumbnail": null,           // 목록 대표 사진을 따로 지정할 때만. 없으면 첫 번째 image 블록
  "relatedPeople": ["lee-yoonjin"],   // people.js id
  "relatedEvents": [],                // events.js id
  "tags": [],
  "likes": null, "dislikes": null,    // 원본 값이 있을 때만
  "originalUrl": "https://...",       // 원본 링크 보존
  "archivedAt": "2026-10-04",         // 백업한 날
  "rawSource": "data/bongnudo2/archive/raw/858.html",  // import 가 채움
  "isShinIbiArticle": true,    // 신이비가 쓴 기사 → SHIN IBI REPORT 표식
  "featuresShinIbi": false,    // 신이비가 등장하는 기사 → MENTIONS 필터
  "featured": false,           // FRONT PAGE 1면에 올릴 기사
  "archiveNote": null          // PAGES OF RIKO 해설 (원문과 분리해서 ARCHIVE NOTE 로 표시)
}
```

- **원문 보존**: 문단을 요약하거나 합치지 않습니다. 모르는 값은 `null` — 추측해서 채우지 않습니다.
- `images` / `videos` 목록은 **저장하지 않습니다.** 사진 수·영상 수·대표 사진은 `content` 에서 계산합니다:
  `getArticleImages(a)` (gallery 안 사진 포함) · `getArticleVideos(a)` · `getArticleThumbnail(a)` = `a.thumbnail || 첫 번째 사진 || null`.
- 예전 형식(`body`/`images`/`videos`, `author: {id, name}`)도 읽을 수 있지만 새 데이터는 위 형식으로 넣으세요.

## 3. content 블록

```jsonc
{ "type": "paragraph", "text": "문단. 줄바꿈은\n그대로 표시" }
{ "type": "image", "src": "/media/bongnudo-2/articles/858/image-01.jpg", "originalUrl": "https://...",
  "width": 1280, "height": 720, "alt": null, "caption": null }
{ "type": "video", "src": "/media/bongnudo-2/articles/858/video-01.mp4", "poster": null, "originalUrl": "https://...",
  "width": null, "height": null, "duration": null }
{ "type": "heading", "text": "소제목", "level": 2 }          // level 2 또는 3
{ "type": "quote", "text": "인용문", "cite": null }
{ "type": "divider" }
{ "type": "gallery", "images": [ /* image 블록과 같은 모양 */ ], "caption": null }
```

- 화면(`ArticleContent`)은 블록을 **배열 순서 그대로** 그립니다. 기자별 테마는 없고 모든 기사가 같은 지면 규칙을 씁니다.
- 모르는 `type` 은 화면에 그리지 않고 validate 에서 오류로 알려 줍니다.
- 사진: 본문 폭 안에서 **원본 비율 그대로**(자르지 않음), `loading="lazy"`, 클릭하면 lightbox(←/→ 키, n / N, Esc). 세로로 긴 사진은 폭을 줄여 가운데 정렬. 사진 10~30장 이상인 기사도 그대로 됩니다.
- 영상: 본문 중간 그 자리에 표시, 자동재생 없음, `preload="none"` + controls — 재생을 누르기 전에는 파일을 받지 않습니다. 기사 목록에서는 영상 요소를 만들지 않고 VIDEO 개수만 표시합니다.
- `width`/`height` 를 넣으면 이미지가 로드되기 전에도 자리가 잡혀 스크롤이 흔들리지 않습니다.

## 4. 사진·영상 파일 위치

```
public/media/bongnudo-2/articles/{articleId}/image-01.jpg
public/media/bongnudo-2/articles/{articleId}/image-02.png
public/media/bongnudo-2/articles/{articleId}/video-01.mp4
```

- `--download` 로 import 하면 기사 안에 **나온 순서대로** `image-01`, `image-02` … 로 저장되고 `src` 가 로컬 경로로 바뀝니다. 원본 주소는 `originalUrl` 에 남습니다.
- 원본 확장자 그대로 둬도 됩니다 (억지로 webp 변환 X).
- 원격 주소(`https://…`)를 그대로 두면 BBS 서버가 닫힐 때 사라질 수 있습니다 — validate `--verbose` 가 알려 줍니다.

## 5. 기자별 아카이브 (REPORTER ARCHIVE)

- 주소: `/bongnudo-2/archive/reporter/{authorId}` (예: `/bongnudo-2/archive/reporter/shin-ibi`).
  `authorId` 없이 `authorName` 만 있는 기자는 `name-{이름}` 키로 자동 생성됩니다.
- 상단 숫자는 전부 데이터에서 계산: 기사 수 · 사진 기사 수 · 영상 기사 수 · 첫 기사 · 마지막 기사 · 자주 쓴 분류 · 공감 합계(원본 `likes` 가 있을 때만). 값이 없으면 항목 자체가 숨겨집니다.
- 기자 페이지 안에서도 검색·분류·날짜·정렬을 함께 쓸 수 있습니다.
- ARCHIVE 첫 화면의 **REPORTERS** 명단(기사 수 포함)과 기사 바이라인 `BY 기자`, PEOPLE 서랍의 `VIEW ARTICLES` 가 모두 이 페이지로 연결됩니다. 기사가 0건인 기자는 명단에 나오지 않습니다.
- 전체 ARCHIVE 에서는 URL 로 조합할 수 있습니다: `/bongnudo-2/archive?reporter=shin-ibi&q=경찰&day=4`.
- FRONT PAGE 의 **SHIN IBI COLLECTION** 상자는 신이비 기사가 1건 이상일 때만 나타나고 신이비 아카이브로 연결됩니다.

## 6. 기사 상세 페이지 구성

CATEGORY · DAY → (SHIN IBI REPORT) → 제목 → 날짜·시각 · BY 기자 → 본문 블록 → 공감 → 태그 → ARCHIVE NOTE →
이전/다음 기사(시간순) → MORE FROM 이 기자 → SAME DAY → RELATED EVENT → RELATED PEOPLE → 원본 출처.
긴 기사에서는 오른쪽 아래 `↑ TOP` 버튼이 나타납니다.

## 7. 사람 · 관계 · NEWSROOM STORIES

화면의 원칙: **이름 > 사람의 이야기 > 기자 활동 > 관계 > (작게) 최종 직급**. 직급·파벌로 사람을 정의하지 않습니다.
각 사람은 `/bongnudo-2/people/{id}` 에 작은 Archive 를 가집니다 (PROFILE → REPORTING → NEWSROOM STORIES → WITH SHIN IBI → RELATIONSHIPS → ARTICLES → PHOTOS/VIDEOS → LETTER → 맨 아래 작게 INSIDE THE NEWSROOM). 자료가 없는 영역은 나오지 않습니다.

### 사람 (`people.js`)

```js
person('kim-xx', '김XX', {
  streamer: null,
  group: 'newsroom',        // newsroom | police | gangs | citizens | others
  core: true,               // false = 보도국 기록에 등장하지만 초기 기자단으로 단정하지 않음 (예: 오치에)
  role: null,               // 서버 기간 중 확인된 직책
  finalPosition: null,      // 최종 상태로만 표시 ("FINAL POSITION · …", 서버 전체 직급처럼 쓰지 않음)
  profile: { tagline, summary, personality, reportingStyle, newsroomRole, notableTraits: [], source },
  career: { joinedDay: null, promotions: [{ day, position }] },
  relationships: [ /* 아래 */ ],
  image: null, notes: [],
})
```

- 확인되지 않은 `personality` · `reportingStyle` · 관계는 **쓰지 않습니다**. 자료가 적은 기자도 카드는 그대로 두고, 실제 기사·장면이 들어오면 자동으로 채워집니다.
- 기사 수 · 사진/영상 기사 · 첫/마지막 기사 · 자주 쓴 분류 · 기사에 자주 함께 등장한 사람 · 기사를 쓴 날은 **기사 데이터에서 계산**합니다(`personStats`). 사람 쪽에 숫자를 적지 않습니다.
- 기자단 순서는 배열 순서 그대로입니다(직급순 정렬 없음).
- `name` 은 import 시 기자 이름 → `authorId` 매칭에도 쓰입니다.

### 관계 (`relationships`)

```js
{ personId: 'shin-ibi', type: 'information-sharing', summary: '확인된 짧은 설명',
  eventIds: [], articleIds: [], storyIds: [], verified: false, sourceType: 'curator' }
```

- `type`: colleague · joint-reporting · chief-reporter · close-colleague · news-desk · information-sharing · conflict · reconciliation · war-correspondents · other
- 한쪽에만 적어도 양쪽 화면에 나옵니다(`relationshipsOf` 가 역방향을 계산).
- **같은 파벌 = 친함, 반대 파벌 = 적대로 추론하지 않습니다.** 파벌 기록에서 관계를 만들지 마세요.
- 롤링페이퍼 원문을 `summary` 에 복사하지 않습니다 (편지 위 "3 WEEKS TOGETHER" 는 이 짧은 설명을 씁니다).

### NEWSROOM STORIES (`newsroomStories.js`)

```js
{ id: 'day04-…', day: 4, when: null,       // day 를 모르면 null + when('초기' 등) — 날짜 없는 장면은 타임라인에 놓이지 않음
  title: '…', summary: '확인된 내용만',
  type: 'reporting',                       // daily-life | reporting | news | conflict | relationship | incident | farewell
  people: ['shin-ibi'],
  steps: [{ label: '사건 정리', summary: null, articleIds: [] }],          // 있으면 REPORTING CASE 로 표시
  contrast: { label: '갱단연합으로 참전', people: ['myung-chonghee'] },   // 같은 장면에서 다른 선택
  articleIds: [], eventIds: [], clipUrls: [],
  verification: 'partial', sourceType: 'curator', sourceUrl: null, notes: null }
```

- EVENT(도시의 일) · POLITICS(그날의 입장) · STORY(기자들의 장면)는 서로 다른 기록입니다.
- 두 명 이상이 함께한 `reporting` 장면은 NEWSROOM 의 REPORTING TOGETHER 에, 나머지는 NEWSROOM STORIES 에 놓입니다. 6명 이상이 함께한 장면은 개인 사이의 관계 목록에는 넣지 않고 장면으로만 보여 줍니다.
- 실제 BBS 기사 ID · 클립 URL 을 `articleIds` / `clipUrls` 에 연결하면 "원자료 연결 전" 표시가 사라지고 링크가 붙습니다.

### 출처와 신뢰도

- `verification`: confirmed | partial | unverified · `sourceType`: bbs-article | clip | vod | participant | community-summary | curator
- 커뮤니티 요약은 사건을 찾는 단서로만 쓰고, BBS 기사 · 클립 · VOD · 당사자 대화가 확보되면 그쪽으로 교체합니다.
- `politics.js` 에서 원자료에 개별 이름이 없어 화면용으로 채운 구성(DAY 06 통합, DAY 13 전원, DAY 15 전원)은 `inferred: true` 이고 화면에 `*` 로 표시됩니다. 실제 명단이 확인되면 바꾸세요.

## 8. 사건(Event) 연결

`data/bongnudo2/events.js`:

```js
{ id: 'day04-xxx', day: 4, date: null, title: '...', type: 'field',
  summary: '확인된 내용만', people: ['shin-ibi'], articleIds: ['858'], mediaIds: [], verified: true }
```

- `type`: `field`(현장 취재) · `interview` · `newsroom` · `war` · `farewell` · `other`
  → `field`/`interview` 는 REPORTER 페이지의 FIELD REPORTING / INTERVIEWS 슬롯에 자동으로 들어갑니다.
- 기사 연결은 `events.articleIds` 또는 기사의 `relatedEvents` 어느 쪽이든 됩니다. 기사 상세의 RELATED EVENT 에도 나옵니다.
- 사건은 TIMELINE 의 해당 DAY 판에 자동 표시됩니다.

## 9. 롤링페이퍼 추가

`data/bongnudo2/rollingPapers.js`:

```js
{ id: 'from-lee-yoonjin', fromPersonId: 'lee-yoonjin', toPersonId: 'shin-ibi',
  title: null,
  body: `원문 전체 — 줄바꿈, 말투, 맞춤법 그대로`,
  writtenAt: null, order: 1, image: null,
  relatedArticleIds: [], relatedEventIds: [] }
```

- 원문은 **축약·수정하지 않습니다**.
- 편지 위의 관계 설명은 `people.js` 의 `relationships`(작성자 ↔ 신이비) 짧은 설명에서 가져옵니다 (원문과 섞지 않기 위해).
- 편지가 생기면 LETTERS · PEOPLE(LETTER 표시) · FINAL EDITION · FRONT PAGE 에 자동 반영됩니다.

## 10. featured 기사 · 신이비 표시

- `"featured": true` → 최신순으로 첫 번째가 MAIN HEADLINE, 두 번째가 SECONDARY STORY. 사진이 있는 기사 중 하나가 PHOTO STORY 로 자동 선택됩니다(대표 사진 = `getArticleThumbnail`).
- `isShinIbiArticle: true` → `SHIN IBI REPORT` 표식, SHIN IBI 필터·기자 아카이브, REPORTER 의 FIRST ARTICLE, TIMELINE, FINAL EDITION 의 LAST REPORT.
- `featuresShinIbi: true` 또는 `relatedPeople` 에 `shin-ibi` → MENTIONS 필터.

## 11. Validation

```bash
npm run validate:bbs              # 경고 출력
npm run validate:bbs -- --strict  # 오류가 있으면 실패(exit 1)
npm run validate:bbs -- --verbose # 원격 미디어 등 참고 정보까지
```

검사 항목: 사람 관계 대상 · story/event id 연결 · story type · DAY 14 종군 장면과 입장 기록의 구성원 일치 · 입장 기록의 인물 id · 원자료 연결 전 장면(참고) ·
중복 id · 제목 없음 · 잘못된 날짜 · 알 수 없는 기자(`authorId`)/관련 인물/관련 사건 ·
모르는 블록 type · src 없는 사진(오류)/영상(경고) · 빈 gallery · 빈 본문 · 없는 로컬 미디어 파일 ·
여러 기사에 같은 미디어 · 원격 미디어(참고) · rawSource 파일 없음 · 사건↔기사 연결 깨짐 · 롤링페이퍼 작성자/원문 누락.

---

## 12. BBS ORIGINAL BACKUP (backup:bbs)

`scripts/backup-bbs.mjs` 는 스크래퍼가 아니라 **보존 도구(ARCHIVER)** 입니다. 가장 중요한 결과물은 `articles.json` 이 아니라
**원본 HTML · 원본 URL · 원본 미디어 URL · 내려받은 미디어** 입니다. 해석이 틀려도 원본만 있으면 언제든 다시 해석할 수 있습니다.

```
PUBLIC BBS ──backup:bbs──▶ RAW HTML + ORIGINAL MEDIA + SOURCE JSON ──import:bbs --from-backup──▶ content[] ──validate:bbs──▶ PAGES OF RIKO
```

### ⚠ 실행 전 — 접근 정책

`bnd2-fanwiki.app` 은 모든 페이지에 `<meta name="robots" content="noindex, nofollow, noarchive">` 를 표시합니다(robots.txt 는 없음).
자동 수집·보관을 원하지 않는다는 신호이므로 백업기는 이 표시를 보면 **아무 파일도 만들지 않고 멈춥니다**.
사이트 운영자에게 허락을 받은 뒤에만 `--permission-granted` 를 붙여 실행하세요. robots.txt 가 `/bbs` 를 막는 경우에는 이 옵션으로도 진행하지 않습니다.
쿠키·인증 정보는 보내지도 기록하지도 않습니다. 로그인 없이 볼 수 있는 공개 페이지만 대상입니다.

### 폴더 구조

```
archive/bongnudo2/
  manifest.json                 기사별 상태 · 해시 · 미디어 수 (중단 후 이어하기의 기준)
  raw/index/bbs-page-001.html   링크를 발견한 목록 페이지 원본
  raw/articles/{uuid}.html      기사 페이지 원본 — 서버가 보낸 바이트 그대로, 이후 아무도 고치지 않는다
  raw/articles/_previous/       --force 로 다시 받을 때 이전 원본 보관
  media/articles/{uuid}/        image-001.jpg · image-002.webp · video-001.mp4 … (기사 안 등장 순서)
  source/article-links.json     발견한 기사 링크 (id · url · discoveredFrom)
  source/articles.json          해석 결과 — import:bbs 입력 (원본보다 우선하지 않는다)
  logs/backup.log · failed-articles.json · failed-media.json · skipped.json
```

- **raw** = 서버 응답 원본 (진실) · **source** = 백업기가 읽어 낸 중간 데이터(metadata, sourceBlocks, media) · **normalized** = import 후 `data/bongnudo2/articles/articles.json` 의 `content[]`.
- `source/articles.json` 기사 1건: `id, sourceUrl, title, author, authorStreamerName, category, approvedAtRaw("승인 2026. 10. 4. 02:35"), approvedAt(+09:00), rawHtmlPath, rawSha256, parseSuccess, blocksSource, sourceBlocks[], media[]`
- `sourceBlocks` 는 원본 DOM 순서 그대로 (paragraph · heading · quote · divider · image · video · embed). 같은 사진이 두 번 나오면 블록은 두 번, 파일은 한 번.
- `media[]` 한 항목: `assetId, type, roles(cover/body), sourceUrl, resolvedUrl, finalUrl(리다이렉트), host, localPath, contentType, bytes, sha256, width, height, duration, downloadStatus, attempts, error`
  - `downloadStatus`: success · failed · unresolved(blob: 등 실제 주소 없음) · skipped-too-large · skipped-scheme · embed-not-downloaded
  - Content-Type 과 파일 서명을 둘 다 확인 — HTML 오류 페이지를 `image-001.jpg` 로 저장하지 않습니다. 크기 제한: 사진 50MB · 영상 500MB (`scripts/lib/bbs-config.mjs`).

### 시험 방법 (3건)

```bash
npm run backup:bbs -- --limit 3 --dry                 # 목록 탐색·선택만, 파일 없음
npm run backup:bbs -- --limit 3 --permission-granted  # 실제 3건 (기본값도 3건 — 실수로 전체를 받지 않는다)
npm run backup:bbs -- --article <UUID> --article <UUID> --permission-granted
npm run backup:bbs -- --limit 3 --no-media --permission-granted   # HTML 만
```

- 요청 간격: 기사 1건씩, 사이 0.5~1초 · 미디어 동시 2개 이하 · 408/429/5xx 는 2·5·10초 대기 후 최대 3회 (Retry-After 우선, 429 를 받으면 이후 간격을 늘림) · 404 등은 다시 요청하지 않음.

### 이어하기 · 재시도

- 같은 명령을 다시 실행하면 이어서 합니다: `complete` + 파일 존재 → `[SKIP]` · 원본 HTML 이 있으면 HTML 은 다시 받지 않고 남은 미디어만 `[RESUME]` · 나머지 → 시작.
- `Ctrl+C` → 진행 상황을 저장하고 종료합니다 ("Run the same command to resume").
- `--retry-failed` → `logs/failed-articles.json` · `logs/failed-media.json` 항목만 다시.
- `--force` → 원본 HTML 을 다시 받습니다. 기존 파일은 `raw/articles/_previous/` 로 옮겨 두고, 해시가 다르면 manifest 에 `sourceChanged` 를 남깁니다.
- manifest · source JSON · 로그는 `.tmp` 에 쓴 뒤 이름을 바꿔 저장하므로 중간에 꺼져도 깨지지 않습니다.

### import 로 넘기기

```bash
npm run import:bbs -- archive/bongnudo2/source/articles.json --from-backup --out <시험용 articles.json>
npm run validate:bbs
```

- `--from-backup`: 이미 받은 미디어를 다시 내려받지 않고 `public/media/bongnudo-2/articles/{uuid}/` 로 복사, `rawSource` 는 백업의 `raw/articles/{uuid}.html` 을 가리킵니다.
- 받지 못한 미디어는 원격 주소로 남기고 import 로그에 표시합니다. 본문에 없는 대표 이미지는 `thumbnail` 이 됩니다.
- 승인 시각(UTC)은 KST 로 바꿔 `publishedAt` 에 넣습니다.

### 시험 서버 (실제 사이트 요청 없이 전체 검증)

```bash
node scripts/fixtures/bbs-fixture-server.mjs 3199 <stateDir>
npm run backup:bbs -- --source http://localhost:3199 --archive-dir <시험 폴더> --selectors scripts/fixtures/bbs-fixture-selectors.json --permission-granted
```

429 · 일시 오류 · 404 · 리다이렉트 · 잘못된 Content-Type · HTML 오류 페이지 · 큰 파일 · blob: 영상 · data: URI · Next/Image · srcset · picture · 느린 영상(중단 시험) · `stateDir/fail-toggle` 로 켜고 끄는 실패(재시도 시험)를 흉내 냅니다.
`BBS_BACKOFF_SCALE=0.05` 는 시험에서 대기 시간을 줄이는 값이고, `BBS_TEST_INTERRUPT_AFTER_MEDIA=n` 은 미디어 n개 뒤 Ctrl+C 와 같은 처리를 일으킵니다 — 실제 사이트에는 쓰지 않습니다.

### 전체 백업(`--all`) 전 확인 사항

`--all` 은 지금 일부러 막혀 있습니다. 아래가 모두 끝나야 엽니다.

- [ ] 사이트 운영자 허락 (noarchive/nofollow 표시)
- [ ] 실제 기사 페이지 DOM 확인 → `SELECTORS` 채우고 `confirmed: true` (지금은 페이지 속 RSC 데이터만으로 읽도록 비어 있음)
- [ ] 전체 목록 수집 방식: 목록 2페이지부터는 href 가 없고 무한 스크롤이 Next.js Server Action 으로 불러옴 (12건 × 72페이지)
- [ ] 실제 3건: 원본 HTML · metadata · 한글/이모지 · 순서 · 대표/본문 사진 · 20장 이상 기사 · 영상 원본 URL 과 다운로드 · 중단/재개 · 실패 로그 · retry
- [ ] `import:bbs --from-backup` 시험 변환 · `validate:bbs`
- [ ] 저장 용량 확인 후 `archive/` 를 git 에 넣을지 결정 (미디어는 커서 보통 git 밖에 둔다)

## 서버 기간이 확정되면

`meta.js` → `archive.serverPeriod.start` 에 `'YYYY-MM-DD'` 를 넣으면 기사 `publishedAt` 으로 DAY 가 자동 계산되고,
TIMELINE 각 판에 날짜가 표시됩니다.

## 대량 데이터 확인 (개발 전용)

```bash
NEXT_PUBLIC_BBS_DEV_SAMPLE=858 npm run dev
```

`[DEV SAMPLE]` 표시된 가짜 기사 858건(텍스트만 · 사진/문단 교차 · 중간 영상 · 사진 26장 · gallery · 소제목/인용/구분선)으로
검색·필터·기자 아카이브·lightbox 를 확인할 수 있습니다. 영상 확인용 파일은 `public/media/dev-sample.mp4` 를 직접 두면 됩니다(없으면 재생만 안 됨).
`NODE_ENV=production`(빌드)에서는 이 데이터가 포함되지 않습니다.
