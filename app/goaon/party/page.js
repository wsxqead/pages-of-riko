'use client';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {party, partyById} from '@/data/goaon/party';
import {guild} from '@/data/goaon/meta';
import {relatedTo} from '@/data/goaon';
import {mediaForMember} from '@/data/goaon/media';
import {Portrait, Status, Clips} from '../_components/ui';

function MemberWindow({m}) {
  const r = relatedTo(m.id);
  const clips = mediaForMember(m.id);
  const empty = !r.scenes.length && !r.quests.length && !r.memories.length && !r.raids.length;
  return (
    <article className="ga-win ga-member" key={m.id} aria-live="polite">
      <header className="ga-member-head">
        <Portrait member={m} size="lg" />
        <div>
          <p className={'ga-role' + (m.role === 'GUILD MASTER' ? ' master' : '')}>{m.role}<small>{m.roleKo}</small></p>
          <h2>{m.name}{m.player && <span className="ga-you">▶ PLAYER</span>}</h2>
          <dl className="ga-member-meta">
            <div><dt>GUILD</dt><dd>{guild.name}</dd></div>
            <div><dt>ROLE</dt><dd>{m.style}</dd></div>
            <div><dt>MEMORIES</dt><dd>{r.memories.length}</dd></div>
            <div><dt>QUESTS</dt><dd>{r.quests.length}</dd></div>
          </dl>
        </div>
      </header>

      {m.notes.length > 0 && (
        <ul className="ga-notes">{m.notes.map((n) => <li key={n}>{n}</li>)}</ul>
      )}

      {r.scenes.length > 0 && (
        <section>
          <h3>{m.player ? '리코의 기록' : '리코와 함께 확인된 장면'}</h3>
          <ol className="ga-scenes">
            {r.scenes.map((s, i) => (
              <li key={i}><time>{s.day.date}</time><span>{s.text}</span></li>
            ))}
          </ol>
        </section>
      )}

      {r.quests.length > 0 && (
        <section>
          <h3>QUESTS</h3>
          <ul className="ga-mini-quests">
            {r.quests.map((q) => (
              <li key={q.id}>
                <Link href={`/goaon/quests#${q.id}`}>
                  <span>{q.type === 'raid' ? 'RAID · ' : ''}{q.title}</span>
                  <Status status={q.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {r.memories.length > 0 && (
        <section>
          <h3>MEMORIES</h3>
          <ul className="ga-mini-items">
            {r.memories.map((x) => (
              <li key={x.id}>
                <Link href={`/goaon/memories#${x.id}`} title={x.title}>
                  <i aria-hidden="true">{x.icon}</i>
                  <span>{x.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {r.raids.length > 0 && (
        <section>
          <h3>RAID CLEAR</h3>
          <ul className="ga-raid-tags">
            {r.raids.map((x) => <li key={x.id}>⚔ {x.clearNo}번째 클리어{x.raidName ? ` · ${x.raidName}` : ''}</li>)}
          </ul>
        </section>
      )}

      {empty && <p className="ga-empty">아직 정리된 기록이 없습니다. 자료가 추가되면 이곳에 쌓입니다.</p>}

      <Clips items={clips} />
    </article>
  );
}

export default function PartyPage() {
  const [sel, setSel] = useState('riko');
  const panel = useRef(null);

  // /goaon/party#gosudal 처럼 특정 멤버로 바로 들어올 수 있다
  useEffect(() => {
    const read = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      if (partyById[h]) setSel(h);
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  const choose = (id) => {
    setSel(id);
    history.replaceState(null, '', '#' + id);
    if (window.innerWidth < 860) panel.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  return (
    <main className="ga-main ga-party">
      <header className="ga-page-head">
        <small>PARTY · 6 MEMBERS</small>
        <h1>파티 편성</h1>
        <p>오픈 첫날 모인 여섯 명. 모두 레이드도, 생활도 함께한 길드원입니다. 한 명을 고르면 그 사람과 남은 기록이 펼쳐집니다.</p>
      </header>

      <div className="ga-formation">
        <div className="ga-win ga-slots-win">
          <p className="ga-win-label">GUILD · {guild.name}</p>
          <ol className="ga-slots" role="listbox" aria-label="길드원 선택">
            {party.map((m) => (
              <li key={m.id}>
                <button
                  role="option"
                  aria-selected={sel === m.id}
                  className={'ga-slot-btn' + (sel === m.id ? ' on' : '') + (m.player ? ' player' : '')}
                  onClick={() => choose(m.id)}
                >
                  <i className="ga-cursor" aria-hidden="true">▶</i>
                  <Portrait member={m} />
                  <b>{m.name}</b>
                  <small>{m.role}</small>
                  <em>{m.style}</em>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div ref={panel} className="ga-member-wrap">
          <MemberWindow m={partyById[sel]} key={sel} />
        </div>
      </div>
    </main>
  );
}
