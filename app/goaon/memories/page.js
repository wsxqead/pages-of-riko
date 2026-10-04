'use client';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {memories, memoriesById} from '@/data/goaon/memories';
import {questsById} from '@/data/goaon/quests';
import {guild} from '@/data/goaon/meta';
import {getMember, party} from '@/data/goaon/party';
import {mediaForMemory} from '@/data/goaon/media';
import {PartyChips, Campfire, Clips} from '../_components/ui';

const FILTERS = [
  {id: 'all', label: '전체'},
  {id: 'big', label: '굵직한 기억'},
  {id: 'small', label: '작은 기억'},
];

// 화면에 들어오면 한 번 콜백
function useSeen(ref, cb, opts = {threshold: 0.35}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        cb();
        io.disconnect();
      }
    }, opts);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// 길드명의 탄생 — CREATE GUILD 화면으로 재해석
function GuildCreated() {
  const m = memoriesById['guild-name'];
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useSeen(ref, () => setOn(true));
  const master = getMember(guild.master);
  return (
    <section ref={ref} id="guild-name" className={'ga-win ga-create' + (on ? ' play' : '')}>
      <header>
        <small>MEMORY · {m.date}</small>
        <h2>{m.title}</h2>
      </header>
      <div className="ga-create-grid">
        <div className="ga-create-talk">
          <p className="lead">{m.text}</p>
          <ol>
            {m.steps.map((s, i) => (
              <li key={s} style={{'--i': i}} className={i === m.steps.length - 1 ? 'last' : ''}>{s}</li>
            ))}
          </ol>
          <PartyChips people={m.people} />
        </div>
        <div className="ga-create-form" aria-label="길드 생성 화면">
          <p className="ga-win-label">NEW GUILD</p>
          <dl>
            <div><dt>Guild Master</dt><dd>{master.name}</dd></div>
            <div><dt>Guild Name</dt><dd className="name"><span>[ {guild.name} ]</span></dd></div>
            <div><dt>Origin</dt><dd>{guild.origin}</dd></div>
            <div><dt>Members</dt><dd>{party.length}</dd></div>
          </dl>
          <p className="ga-created">GUILD CREATED</p>
        </div>
      </div>
    </section>
  );
}

function Item({m, selected, onPick, onUnlock}) {
  const ref = useRef(null);
  const [unlocked, setUnlocked] = useState(false);
  useSeen(ref, () => {
    if (m.unlock) {
      setUnlocked(true);
      onUnlock(m);
    }
  }, {threshold: 0.6});
  return (
    <li ref={ref} id={'m-' + m.id}>
      <button className={'ga-item ' + m.size + (selected ? ' on' : '') + (unlocked ? ' unlocked' : '')} onClick={() => onPick(m.id)} aria-pressed={selected}>
        {m.unlock && <span className="ga-new">NEW</span>}
        <i className="ga-item-icon" aria-hidden="true">{m.icon}</i>
        <b>{m.title}</b>
        <small>{m.date || '날짜 미확인'} · {m.size === 'big' ? '굵직한 기억' : '작은 기억'}</small>
      </button>
    </li>
  );
}

function ItemInfo({m}) {
  const q = m.quest && questsById[m.quest];
  const clips = mediaForMemory(m.id);
  return (
    <article className="ga-win ga-iteminfo" key={m.id}>
      <p className="ga-win-label">MEMORY INFO</p>
      <header>
        <i className="ga-item-icon lg" aria-hidden="true">{m.icon}</i>
        <div>
          <h3>{m.title}</h3>
          <small>{m.date || '날짜 미확인'} · {m.size === 'big' ? '굵직한 기억' : '작은 기억'}</small>
        </div>
      </header>
      <p className="txt">{m.text}</p>
      <PartyChips people={m.people} />
      {q && <Link className="ga-ref quest" href={`/goaon/quests#${q.id}`}>QUEST · {q.title} →</Link>}
      <Clips items={clips} />
    </article>
  );
}

export default function MemoriesPage() {
  const [filter, setFilter] = useState('all');
  const [sel, setSel] = useState('first-talk');
  const [toast, setToast] = useState(null);
  const info = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h === 'guild-name') document.getElementById('guild-name')?.scrollIntoView();
    else if (memoriesById[h]) {
      setSel(h);
      document.getElementById('m-' + h)?.scrollIntoView({block: 'center'});
    }
  }, []);

  const unlock = (m) => {
    setToast(m.title);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2200);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  const pick = (id) => {
    setSel(id);
    history.replaceState(null, '', '#' + id);
    if (window.innerWidth < 860) info.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  const list = memories.filter((m) => m.id !== 'guild-name' && (filter === 'all' || m.size === filter));

  return (
    <main className="ga-main ga-memories">
      <header className="ga-page-head">
        <small>MEMORIES · {memories.length} COLLECTED</small>
        <h1>수집한 기억</h1>
        <p>레이드와 보스만이 아니라, 만담과 파밍과 노래 이야기까지. 고아온의 기억은 대부분 평범한 시간에서 나왔습니다.</p>
      </header>

      <GuildCreated />

      <Campfire label="큰 사건보다 작은 기억이 더 많은 길드">
        <span className="ga-camp-sub">모닥불 앞에 앉아, 주운 기억들을 하나씩 꺼내 봅니다.</span>
      </Campfire>

      <div className="ga-qtabs" role="tablist" aria-label="기억 종류">
        {FILTERS.map((f) => (
          <button key={f.id} role="tab" aria-selected={filter === f.id} className={filter === f.id ? 'on' : ''} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>

      <div className="ga-inventory">
        <ul className="ga-win ga-items">
          {list.map((m) => (
            <Item key={m.id} m={m} selected={sel === m.id} onPick={pick} onUnlock={unlock} />
          ))}
        </ul>
        <div ref={info} className="ga-iteminfo-wrap">
          <ItemInfo m={memoriesById[sel]} key={sel} />
        </div>
      </div>

      <div className={'ga-toast' + (toast ? ' show' : '')} role="status" aria-live="polite">
        {toast && (<><small>MEMORY UNLOCKED</small><b>{toast}</b></>)}
      </div>
    </main>
  );
}
