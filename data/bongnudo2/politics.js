// 봉누도 2 · NEWSROOM POLITICS — 보도국 내부 입장/파벌 기록 (봉누도 RP 안의 기록, 현실 정치 아님)
// 기자단을 정의하는 데이터가 아니라, 같은 보도국 안에서 기사 방향이 갈렸던 날들의 기록이다.
// 같은 책상 = 친함, 다른 책상 = 적대로 해석하지 않는다.
//
// 하루(또는 기간)마다 기자들이 어느 "책상(그룹)"에 앉았는지.
// 그날 기록에 없는 사람은 그룹에 넣지 않는다 → 화면에서 "그날 기록 없음" 줄에 흐리게 놓인다.
// scope: 'faction'(파벌로 나뉨) | 'whole'(보도국 전체가 하나로 기록된 날)

import {newsroomIds} from './people';

// inferred: 원자료에 개별 인물이 적혀 있지 않아 화면 구현을 위해 보간한 구성 → 실제 자료가 확인되면 교체
const g = (id, name, members, tone = null, opts = {}) => ({ id, name, members, tone, inferred: false, ...opts });

// 출처: 커뮤니티 요약(보도국 파벌 표). BBS 기사·클립으로 확인되면 verification 을 올린다.
export const politicsSource = { sourceType: "community-summary", verification: "partial", sourceUrl: null };

export const politicsDays = [
  {
    id: 'day03', label: 'DAY 03', days: [3], scope: 'faction',
    groups: [
      g('jungjeong', '중정파', ['na-iksu', 'peter-jangparker'], 'a'),
      g('gukjang', '국장파', ['lee-yoonjin', 'myung-chonghee', 'shin-ibi'], 'b'),
    ],
  },
  {
    id: 'day04', label: 'DAY 04', days: [4], scope: 'faction',
    groups: [
      g('jungjeong', '중정파', ['na-iksu', 'peter-jangparker', 'lee-julman', 'go-mukhee'], 'a'),
    ],
  },
  {
    id: 'day05', label: 'DAY 05', days: [5], scope: 'faction',
    groups: [
      g('jungjeong', '중정파', ['na-iksu', 'peter-jangparker', 'lee-julman', 'go-mukhee', 'myung-chonghee'], 'a'),
      g('gukjang', '국장파', ['lee-yoonjin', 'shin-ibi'], 'b'),
    ],
  },
  {
    // 통합 책상 구성은 DAY 05 두 파벌의 구성원 기준
    id: 'day06', label: 'DAY 06', days: [6], scope: 'whole',
    caption: '중정파와 국장파가 통합됐다.',
    groups: [
      g('merged', '중정파 · 국장파 통합', ['na-iksu', 'peter-jangparker', 'lee-julman', 'go-mukhee', 'myung-chonghee', 'lee-yoonjin', 'shin-ibi'], 'c', { inferred: true }),
    ],
  },
  {
    id: 'day07', label: 'DAY 07', days: [7], scope: 'faction',
    groups: [
      g('hardline', '강경파', ['na-iksu', 'peter-jangparker', 'lee-julman', 'go-mukhee', 'myung-chonghee', 'king-gija'], 'a'),
      g('moderate', '온건파', ['lee-yoonjin', 'shin-ibi', 'sung-haechun'], 'b'),
    ],
  },
  {
    id: 'day08-11', label: 'DAY 08–11', days: [8, 9, 10, 11], scope: 'faction',
    groups: [
      g('police-tf', '경찰비리 TF', ['myung-chonghee', 'na-iksu', 'peter-jangparker'], 'a'),
      g('conviction', '소신파', ['shin-ibi', 'go-mukhee', 'king-gija', 'sung-haechun'], 'b'),
    ],
  },
  {
    id: 'day12', label: 'DAY 12', days: [12], scope: 'faction',
    groups: [
      g('pro-gang', '친갱단파', ['myung-chonghee', 'na-iksu', 'peter-jangparker', 'lee-julman'], 'a'),
      g('neutral', '중립 · 미정', ['oh-chie', 'bab-dwaegil', 'king-gija', 'go-mukhee', 'lee-yoonjin'], 'c'),
      g('pro-police', '친경파', ['shin-ibi', 'sung-haechun'], 'b'),
    ],
  },
  {
    // 개별 입장이 아니라 보도국 전체의 상태로 기록된 날 — 보도국 구성원 전원을 한 책상에 둔다
    id: 'day13', label: 'DAY 13', days: [13], scope: 'whole',
    caption: '보도국이 완전한 중립을 확보했다.',
    groups: [g('newsroom-neutral', '보도국 · 완전 중립', newsroomIds, 'c', { inferred: true })],
  },
  {
    id: 'day14', label: 'DAY 14', days: [14], scope: 'faction',
    caption: '보도국 사람들이 전쟁의 현장으로 들어갔다.',
    groups: [
      g('gang-union', '갱단연합으로 참전', ['myung-chonghee'], 'a'),
      g('war-correspondent', '종군기자로 참전', ['lee-yoonjin', 'shin-ibi', 'go-mukhee', 'king-gija', 'na-iksu', 'peter-jangparker', 'lee-julman', 'sung-haechun'], 'b'),
    ],
  },
  {
    id: 'day15', label: 'DAY 15 – END', days: [15], untilEnd: true, scope: 'whole',
    caption: '봉누도 메인 서사가 끝나고 파벌이 해산됐다.',
    groups: [g('dissolved', '파벌 해산', newsroomIds, 'c', { inferred: true })],
  },
];

// 특정 인물이 그날 앉은 책상
export function seatOf(personId, dayEntry) {
  return dayEntry.groups.find((gr) => gr.members.includes(personId)) || null;
}

// 인물의 입장 흐름 [{ day, group|null }]
export function stanceTrack(personId) {
  return politicsDays.map((d) => ({ day: d, group: seatOf(personId, d) }));
}

export const politicsDayFor = (dayNumber) =>
  politicsDays.find((d) => d.days.includes(dayNumber) || (d.untilEnd && dayNumber >= d.days[0])) || null;
