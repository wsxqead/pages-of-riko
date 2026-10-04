'use client';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {quests, questsById} from '@/data/goaon/quests';
import {memoriesById} from '@/data/goaon/memories';
import {raidsById} from '@/data/goaon/raids';
import {mediaForQuest} from '@/data/goaon/media';
import {PartyChips, Status, Clips} from '../_components/ui';

const TABS = [
  {id: 'all', label: 'ALL', ko: '전체'},
  {id: 'quest', label: 'QUEST', ko: '퀘스트'},
  {id: 'raid', label: 'RAID', ko: '레이드'},
];

function QuestWindow({q}) {
  const raid = q.raid && raidsById[q.raid];
  const clips = mediaForQuest(q.id);
  return (
    <article className={'ga-win ga-quest s-' + q.status + (q.type === 'raid' ? ' raid' : '')} key={q.id}>
      <header>
        <small>{q.type === 'raid' ? 'RAID' : 'QUEST'}</small>
        <h2>{q.title}</h2>
        <Status status={q.status} />
      </header>

      {q.levelUp && (
        <div className="ga-levelup" aria-label={`레벨 ${q.levelUp} 달성`}>
          <span>LEVEL UP!</span>
          <b>LV {q.levelUp}</b>
        </div>
      )}

      {raid && (
        <div className="ga-raid-card">
          <span className="no">#{raid.clearNo}</span>
          <dl>
            <div><dt>CLEAR</dt><dd>고아온 이름의 {raid.clearNo}번째 클리어</dd></div>
            <div><dt>RAID</dt><dd className={raid.raidName ? '' : 'na'}>{raid.raidName || '레이드 이름 자료 추가 예정'}</dd></div>
            <div><dt>DATE</dt><dd className={raid.date ? '' : 'na'}>{raid.date || '날짜 미확인'}</dd></div>
          </dl>
        </div>
      )}

      <dl className="ga-quest-fields">
        <div><dt>GOAL</dt><dd>{q.goal}</dd></div>
        {!raid && <div><dt>DATE</dt><dd>{q.date}</dd></div>}
        <div><dt>PARTY</dt><dd><PartyChips people={q.people} /></dd></div>
        {q.helpers?.length > 0 && <div><dt>HELP</dt><dd>{q.helpers.join(', ')}의 도움</dd></div>}
        <div>
          <dt>RESULT</dt>
          <dd>
            {q.result}
            {q.resultNote && <em className="ga-result-note">{q.resultNote}</em>}
          </dd>
        </div>
      </dl>

      {q.memories.length > 0 && (
        <section className="ga-quest-mem">
          <h3>MEMORY</h3>
          <ul>
            {q.memories.map((id) => memoriesById[id]).filter(Boolean).map((m) => (
              <li key={m.id}>
                <Link href={`/goaon/memories#${m.id}`}><i aria-hidden="true">{m.icon}</i>{m.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <Clips items={clips} />
    </article>
  );
}

export default function QuestsPage() {
  const [tab, setTab] = useState('all');
  const [sel, setSel] = useState(quests[0].id);
  const win = useRef(null);

  useEffect(() => {
    const read = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      if (questsById[h]) setSel(h);
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  const open = (id) => {
    setSel(id);
    history.replaceState(null, '', '#' + id);
    if (window.innerWidth < 860) win.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  const list = quests.filter((q) => tab === 'all' || q.type === tab);

  return (
    <main className="ga-main ga-quests">
      <header className="ga-page-head">
        <small>QUEST LOG</small>
        <h1>퀘스트</h1>
        <p>날짜가 아니라 목표로 묶은 기록. 이룬 것도, 찾지 못한 것도 그대로 남겨 두었습니다.</p>
      </header>

      <div className="ga-qtabs" role="tablist" aria-label="퀘스트 종류">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            {t.label}<small>{t.ko}</small>
          </button>
        ))}
      </div>

      <div className="ga-questbook">
        <ol className="ga-win ga-qlist">
          {list.map((q) => (
            <li key={q.id}>
              <button className={(sel === q.id ? 'on ' : '') + 's-' + q.status} onClick={() => open(q.id)} aria-pressed={sel === q.id}>
                <i className="ga-cursor" aria-hidden="true">▶</i>
                <span className="t">{q.type === 'raid' ? `RAID #${raidsById[q.raid]?.clearNo}` : q.title}</span>
                <span className="d">{q.type === 'raid' ? q.title : q.date}</span>
                <Status status={q.status} />
              </button>
            </li>
          ))}
        </ol>
        <div ref={win} className="ga-quest-wrap">
          <QuestWindow q={questsById[sel]} key={sel} />
        </div>
      </div>
    </main>
  );
}
