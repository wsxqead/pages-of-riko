'use client';
import Link from 'next/link';
import {useEffect, useSyncExternalStore} from 'react';
import {guild} from '@/data/goaon/meta';
import {party} from '@/data/goaon/party';
import {memories} from '@/data/goaon/memories';
import {getPage} from '@/data/pages';
import {readGoaonLoaded, markGoaonLoaded} from '@/lib/goaonSession';
import {Portrait} from './_components/ui';

const logo = getPage('goaon')?.logo;
const noSubscribe = () => () => {};

export default function SaveData() {
  // 세션에서 이미 불러왔으면 로딩 연출 없이 바로. (서버에서는 첫 방문으로 가정, 새로고침 깜빡임은 head 스크립트가 막는다)
  const loaded = useSyncExternalStore(noSubscribe, readGoaonLoaded, () => false);
  // 연출이 끝난 뒤에 기록 — 도중에 다시 렌더되어도 연출이 끊기지 않게
  useEffect(() => {
    const t = setTimeout(markGoaonLoaded, 2100);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className={'ga-main ga-save ' + (loaded ? 'ready' : 'boot')}>
      <header className="ga-title">
        {logo && <img className="ga-logo" src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} />}
        <p>SAVE DATA</p>
      </header>

      <div className="ga-load" aria-hidden="true">
        <span>LOADING SAVE DATA</span>
        <i><b /></i>
      </div>

      <section className="ga-win ga-slot ga-anim" aria-label="세이브 슬롯">
        <header className="ga-slot-head">
          <span>SAVE SLOT {guild.slot}</span>
          <span>{guild.gameEn}</span>
        </header>
        <div className="ga-slot-body">
          <div className="ga-slot-name">
            <h1>{guild.name}</h1>
            <p>{guild.en}</p>
            <small>SINCE {guild.since}</small>
          </div>
          <dl className="ga-slot-stats">
            <div><dt>PLAYERS</dt><dd>{party.length}</dd></div>
            <div><dt>STYLE</dt><dd>{guild.styleEn}</dd></div>
            <div><dt>STATUS</dt><dd className="done">{guild.status}</dd></div>
            <div><dt>MEMORIES</dt><dd>{memories.length} SAVED</dd></div>
          </dl>
        </div>

        <ol className="ga-party-row" aria-label="파티">
          {party.map((m, i) => (
            <li key={m.id} className={'ga-pslot ga-anim' + (m.player ? ' player' : '')} style={{'--i': i}}>
              <Link href={`/goaon/party#${m.id}`}>
                {m.player && <span className="ga-you">▶ PLAYER</span>}
                <Portrait member={m} />
                <b>{m.name}</b>
                <small>{m.role}</small>
              </Link>
            </li>
          ))}
        </ol>

        <div className="ga-slot-actions">
          <Link href="/goaon/adventure" className="ga-btn primary">▶ CONTINUE<small>모험 일지 이어 보기</small></Link>
          <Link href="/goaon/party" className="ga-btn">PARTY<small>길드원 보기</small></Link>
        </div>
      </section>

      <p className="ga-save-note">
        멋사 공책 RPG 길드 <b>고아온</b>. 오픈 첫날 우연히 모인 여섯 명의 세이브 데이터입니다.
      </p>
    </main>
  );
}
