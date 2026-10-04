'use client';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {guild} from '@/data/goaon/meta';
import {party} from '@/data/goaon/party';
import {memories} from '@/data/goaon/memories';
import {quests} from '@/data/goaon/quests';
import {Portrait, Campfire} from '../_components/ui';

// 화면이 꺼지는 대신, 세이브 슬롯마다 COMPLETE가 붙고 기록이 그대로 남는다.
export default function LastSave() {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), {threshold: 0.3});
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <main className="ga-main ga-ending">
      <header className="ga-page-head center">
        <small>LAST SAVE</small>
        <h1>마지막 저장</h1>
      </header>

      <section ref={ref} className={'ga-win ga-lastsave' + (on ? ' play' : '')}>
        <p className="ga-win-label">SAVE SLOT {guild.slot}</p>
        <h2>{guild.en}<small>{guild.name}</small></h2>
        <dl>
          <div><dt>MEMBERS</dt><dd>{party.length}</dd></div>
          <div><dt>ADVENTURE</dt><dd>COMPLETE</dd></div>
          <div><dt>QUESTS</dt><dd>{quests.length} LOGGED</dd></div>
          <div><dt>MEMORIES</dt><dd>{memories.length} SAVED</dd></div>
        </dl>
        <ol className="ga-final-slots">
          {party.map((m, i) => (
            <li key={m.id} style={{'--i': i}} className={m.player ? 'player' : ''}>
              <Portrait member={m} />
              <b>{m.name}</b>
              <small>{m.role}</small>
              <span className="ga-complete">COMPLETE</span>
            </li>
          ))}
        </ol>
        <p className="ga-saved">✓ SAVE COMPLETE<small>기록이 저장되었습니다</small></p>
      </section>

      <Campfire label="대단한 사건 때문이 아니라, 같이 놀았기 때문에 기억나는 모험." />

      <nav className="ga-end-actions">
        <Link href="/goaon" className="ga-btn">세이브 화면으로<small>LOAD AGAIN</small></Link>
        <Link href="/goaon/memories" className="ga-btn">기억 다시 보기<small>MEMORIES</small></Link>
        <Link href="/" className="ga-btn primary">← PAGES OF RIKO<small>기록관으로</small></Link>
      </nav>
    </main>
  );
}
