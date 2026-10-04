import Link from 'next/link';
import {days, pending} from '@/data/goaon/adventure';
import {questsById} from '@/data/goaon/quests';
import {memoriesById} from '@/data/goaon/memories';
import {PartyChips, Status, Campfire} from '../_components/ui';

export const metadata = {title: 'ADVENTURE LOG · 고아온 — PAGES OF RIKO'};

const KIND = {
  start: '◇', party: '✦', quest: '?', grow: '▲', rest: '☾', talk: '…', battle: '⚔',
};

export default function AdventurePage() {
  return (
    <main className="ga-main ga-adventure">
      <header className="ga-page-head">
        <small>ADVENTURE LOG</small>
        <h1>모험 일지</h1>
        <p>그날 리코가 무엇을 했는지, 하루씩 적어 둔 기록.</p>
      </header>

      <ol className="ga-log">
        {days.map((d) => (
          <li key={d.id} className="ga-day" id={d.id}>
            <header className="ga-day-head">
              <time>{d.date}</time>
              <div>
                <b>{d.title}</b>
                <span>{d.dateKo} · {d.titleKo}</span>
              </div>
            </header>
            <ul className="ga-day-entries">
              {d.entries.map((e, i) => {
                const q = e.quest && questsById[e.quest];
                const m = e.memory && memoriesById[e.memory];
                return (
                  <li key={i} data-kind={e.kind}>
                    <i className="ga-kind" aria-hidden="true">{KIND[e.kind]}</i>
                    <div>
                      <p>{e.text}</p>
                      <div className="ga-entry-refs">
                        <PartyChips people={e.people} />
                        {q && (
                          <Link className="ga-ref quest" href={`/goaon/quests#${q.id}`}>
                            QUEST · {q.title} <Status status={q.status} />
                          </Link>
                        )}
                        {m && (
                          <Link className="ga-ref memory" href={`/goaon/memories#${m.id}`}>
                            <span aria-hidden="true">{m.icon}</span> MEMORY · {m.title}
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {d.camp && <Campfire label={d.camp} />}
          </li>
        ))}
        <li className="ga-day pending">
          <header className="ga-day-head">
            <time>· · ·</time>
            <div>
              <b>TO BE CONTINUED</b>
              <span>{pending.from}</span>
            </div>
          </header>
          <p className="ga-pending">{pending.text}</p>
        </li>
      </ol>

      <aside className="ga-mapnote">
        <b>ADVENTURE MAP</b>
        <span>MAP DATA NOT ARCHIVED · 지도 자료가 확보되면 추가됩니다</span>
      </aside>
    </main>
  );
}
