// 봉누도 2 · 사람들
//
// 직급·파벌이 아니라 "사람"이 먼저다. 각 기자는 기사·사건·사진·영상·동료·롤링페이퍼를 가진 작은 기록 묶음.
// 기사 수, 활동한 날, 함께 등장한 사람 같은 숫자는 여기에 적지 않는다 — 실제 기사 데이터에서 계산한다(index.js).
//
// 확인되지 않은 personality / reportingStyle / relationship 은 만들지 않는다. 모르면 null 또는 [].
// 같은 파벌이었다고 "친했다", 반대 파벌이었다고 "사이가 나빴다"고 추론하지 않는다.
//
// {
//   id, name, streamer,
//   organization: '봉누도방송국', department: '보도국',
//   group: 'newsroom' | 'police' | 'gangs' | 'citizens' | 'others',
//   core: true,                       // 초기부터 확인되는 핵심 기자단 (false = 보도국 관련 기록에 등장하지만 합류 경위 미확인)
//   role: null,                       // 서버 기간 중 확인된 직책 (모르면 null)
//   finalPosition: null,              // 최종 상태 정보로만 쓴다 — 서버 전체 기간의 직급처럼 표현하지 않는다
//   profile: {
//     tagline, summary,               // 실제 활동이 확인된 경우에만
//     personality, reportingStyle, newsroomRole,   // 자료가 생기면 (858건 기사 import 후 실제 기록으로)
//     notableTraits: [],
//     source: { sourceType, verification, sourceUrl, notes },
//   },
//   career: { joinedDay, promotions: [{ day, position, source }], finalPosition },
//   relationships: [{ personId, type, summary, eventIds, articleIds, storyIds, verified, sourceType }],
//   image: { src, width, height, alt } | null,
//   notes: [],                        // 확인된 짧은 사실
// }
//
// relationship.type: colleague | joint-reporting | chief-reporter | close-colleague | news-desk |
//                    information-sharing | conflict | reconciliation | war-correspondents | other
// sourceType: bbs-article | clip | vod | participant | community-summary | curator
// verification: confirmed | partial | unverified

const CURATOR = {sourceType: 'curator', verification: 'partial', sourceUrl: null, notes: '전시 정리 기록 — 실제 BBS 기사·클립이 확보되면 그 자료로 교체'};

const person = (id, name, extra = {}) => {
  const {profile = {}, career = {}, ...rest} = extra;
  const p = {
    id,
    name,
    streamer: null,
    organization: '봉누도방송국',
    department: '보도국',
    group: 'newsroom',
    core: true,
    role: null,
    finalPosition: null,
    profile: {tagline: null, summary: null, personality: null, reportingStyle: null, newsroomRole: null, notableTraits: [], source: null, ...profile},
    career: {joinedDay: null, promotions: [], finalPosition: null, ...career},
    relationships: [],
    image: null,
    notes: [],
    ...rest,
  };
  p.career.finalPosition = p.career.finalPosition ?? p.finalPosition;
  return p;
};

// 기자단은 직급순이 아니라 확인된 명부 순서대로
export const people = [
  person('lee-yoonjin', '이윤진', {
    streamer: '이춘향',
    finalPosition: '보도국장',
    profile: {
      summary: '기자들을 이끌고, 보도국이 어떤 기사를 낼지 정해야 했던 사람. 기자들의 생각이 갈릴 때는 그 사이에 서 있었다.',
      newsroomRole: '보도국장',
      source: CURATOR,
    },
    relationships: [
      {
        personId: 'shin-ibi',
        type: 'information-sharing',
        summary: '보도국 안의 수상한 움직임을 감지했을 때 신이비에게 의심을 공유하고 협력을 요청했다.',
        eventIds: [], articleIds: [], storyIds: ['chief-asks-shin'],
        verified: false, sourceType: 'curator',
      },
    ],
  }),
  person('myung-chonghee', '명총희', {
    streamer: '시라유키 히나',
    profile: {
      summary: '경찰을 따라 사건 현장으로 가서 직접 취재한 기록이 많이 남은 기자.',
      source: CURATOR,
    },
    relationships: [
      {
        personId: 'lee-yoonjin',
        type: 'information-sharing',
        summary: '나익수의 수상한 움직임을 추적하고, 그 내용을 이윤진에게 알렸다.',
        eventIds: [], articleIds: [], storyIds: ['chonghee-tracks'],
        verified: false, sourceType: 'curator',
      },
      {
        personId: 'bab-dwaegil',
        type: 'close-colleague',
        summary: '보도국 초기부터 함께 시간을 보내며 가까운 동료가 됐다.',
        eventIds: [], articleIds: [], storyIds: ['early-days-trio'],
        verified: false, sourceType: 'curator',
      },
      {
        personId: 'na-iksu',
        type: 'close-colleague',
        summary: '보도국 초기부터 함께 어울린 동료.',
        eventIds: [], articleIds: [], storyIds: ['early-days-trio'],
        verified: false, sourceType: 'curator',
      },
    ],
  }),
  person('shin-ibi', '신이비', {
    streamer: '유즈하 리코',
    role: '기자',
    finalPosition: '선임기자',
    profile: {
      tagline: '봉누도방송국에서 3주를 보낸 기자',
      summary: '봉누도방송국 보도국에 들어와 기자가 됐다. 사건 현장에 가서 사람들을 만나 취재했고, 전쟁이 벌어졌을 때는 종군기자로 현장에 들어갔다.',
      source: CURATOR,
    },
    isReporter: true,
  }),
  person('na-iksu', '나익수', {
    streamer: '위구리',
    finalPosition: '선임기자',
    profile: {
      summary: '여러 사람을 직접 만나 인터뷰하고 정보를 모으며, 여러 세력과 관계를 만든 기자. 보도국 안에서도 끊임없이 사건을 만들어 냈다.',
      source: CURATOR,
    },
  }),
  person('peter-jangparker', '피터장파커', {
    streamer: '장마군',
    finalPosition: '수석기자',
    profile: {
      summary: '함께 움직이기 전에 계획의 목적부터 직접 물었던 기자.',
      source: CURATOR,
    },
    relationships: [
      {
        personId: 'na-iksu',
        type: 'colleague',
        summary: '나익수에게 계획의 목적과 이윤진 국장의 향후 위치를 직접 물은 뒤 함께 움직였다.',
        eventIds: [], articleIds: [], storyIds: ['peter-asks'],
        verified: false, sourceType: 'curator',
      },
    ],
  }),
  person('lee-julman', '이줄만', {streamer: '로마러', finalPosition: '수석기자'}),
  person('go-mukhee', '고묵희', {streamer: '코무키', finalPosition: '수석기자'}),
  person('king-gija', '킹기자', {streamer: '킹설아', finalPosition: '수석기자'}),
  person('sung-haechun', '숭해춘', {
    streamer: '마레 플로스',
    finalPosition: '수석기자',
    profile: {
      summary: '초기부터 경찰과 관련된 문제를 기사로 다룬 기자. 경찰 측과 직접 대화한 기록도 남아 있다.',
      source: CURATOR,
    },
    relationships: [
      {
        personId: 'shin-ibi',
        type: 'colleague',
        summary: '여러 시점에서 신이비와 보도국 안의 같은 입장에 섰다. 함께 현장을 취재한 기록도 있다.',
        eventIds: [], articleIds: [], storyIds: ['joint-live-report'],
        verified: false, sourceType: 'curator',
      },
    ],
  }),
  person('bab-dwaegil', '밥돼길', {
    streamer: '티뭉',
    finalPosition: '수석기자',
    profile: {
      summary: '9시 뉴스를 진행했고, 보도국 사람들과 빠르게 가까워진 기자.',
      source: CURATOR,
    },
    relationships: [
      {
        personId: 'na-iksu',
        type: 'close-colleague',
        summary: '보도국 초기부터 함께 어울렸다.',
        eventIds: [], articleIds: [], storyIds: ['early-days-trio'],
        verified: false, sourceType: 'curator',
      },
    ],
  }),
  // 보도국 관련 기록에 등장하지만, 초기 기자단과 같은 멤버로 단정하지 않는다 (합류 경위·직책 변화 미확인)
  person('oh-chie', '오치에', {
    core: false,
    notes: ['DAY 12 기록에 보도국 내부 인물로 등장한다.', '후기 기록에서 "부장"으로 불린다. (합류 시점·직책 변화는 확인 중)'],
  }),
];

export const peopleGroups = [
  {id: 'newsroom', label: 'THE BBS NEWSROOM', ko: '보도국'},
  {id: 'police', label: 'POLICE', ko: '경찰'},
  {id: 'gangs', label: 'GANGS', ko: '갱단'},
  {id: 'citizens', label: 'CITIZENS', ko: '시민'},
  {id: 'others', label: 'OTHERS', ko: '그 외'},
];

export const peopleById = Object.fromEntries(people.map((p) => [p.id, p]));
export const getPerson = (id) => peopleById[id] || null;
export const newsroomIds = people.filter((p) => p.group === 'newsroom').map((p) => p.id);
export const coreNewsroomIds = people.filter((p) => p.group === 'newsroom' && p.core).map((p) => p.id);
