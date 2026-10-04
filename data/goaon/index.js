// 고아온 · 데이터 연결 도우미 (ID 기반으로 모은다. 내용을 복사하지 않는다)
import {days} from './adventure';
import {quests} from './quests';
import {memories} from './memories';
import {raids} from './raids';

// 'guild'(개별 명단 미확인)는 리코(플레이어 시점)에게만 귀속하고, 다른 멤버에게 임의로 붙이지 않는다.
const involves = (people, id) => people.includes(id) || (id === 'riko' && people.includes('guild'));

export function relatedTo(id) {
  return {
    scenes: days.flatMap((d) => d.entries.filter((e) => involves(e.people, id)).map((e) => ({...e, day: d}))),
    quests: quests.filter((q) => involves(q.people, id)),
    memories: memories.filter((m) => involves(m.people, id)),
    raids: raids.filter((r) => r.people.includes(id)),
  };
}
