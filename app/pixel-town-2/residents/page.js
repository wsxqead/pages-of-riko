'use client';
import Link from 'next/link';
import {useCallback, useEffect, useState} from 'react';
import {residents, residentsById} from '@/data/pixelTown2/residents';
import {regions, enLabel} from '@/data/pixelTown2/regions';
import {encountersWith} from '@/data/pixelTown2/encounters';
import {readVisits, addVisit} from '@/lib/pct2Session';
import ResidentCard from '../_components/ResidentCard';

// 주민 안내판: 사는 곳(거주 구역)별로 묶는다. 같은 그룹이었다는 뜻이 아니다.
// 카드가 있는 주민(리코와 관련성이 높은 사람)이 사는 구역만 안내판으로 세우고, 나머지 주민은 이름 목록으로 접어 둔다.
const boards = regions
  .map((r) => {
    const list = residents.filter((x) => x.homeRegion === r.id);
    const named = new Set(list.map((x) => x.name));
    return {id: r.id, kind: r.kind, title: r.name, sub: enLabel(r), note: r.tagline, list, others: (r.roster || []).filter((n) => !named.has(n)), total: r.roster?.length};
  })
  .filter((b) => b.list.length)
  .sort((a, b) => (a.kind === 'home' ? -1 : b.kind === 'home' ? 1 : 0));

// 거주 구역이 이 전시 자료에 없지만 리코의 이야기·영상으로 이어진 사람들
const connections = residents.filter((x) => !x.homeRegion);
if (connections.length) boards.push({id: 'connections', kind: 'connections', title: 'CONNECTIONS', sub: '이야기로 이어진 사람들', note: '다른 전시에서 이어진 인연, 영상에 함께 등장한 사람', list: connections, others: [], total: null, noMap: true});

export default function ResidentsPage() {
  const [open, setOpen] = useState(null);
  const [met, setMet] = useState([]);

  useEffect(() => {
    setMet(readVisits().residents);
    const read = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      if (residentsById[h]) {
        setOpen(h);
        setMet(addVisit('residents', h).residents);
      }
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  const pick = (id) => {
    setOpen(id);
    setMet(addVisit('residents', id).residents);
    history.replaceState(null, '', '#' + id);
  };
  const close = useCallback(() => {
    setOpen(null);
    history.replaceState(null, '', location.pathname);
  }, []);

  return (
    <main className="pt-main pt-residents">
      <header className="pt-page-head">
        <small>RESIDENTS</small>
        <h1>마을 주민 안내판</h1>
        <p>서버 전체 참가자 도감이 아니라, 리코의 기억을 따라가며 만나게 되는 사람들. 사는 곳에 따라 안내판이 나뉩니다 — 함께 다닌 그룹이라는 뜻은 아닙니다.</p>
      </header>

      <div className="pt-boards">
        {boards.map((b) => (
          <section key={b.id} className={'pt-board' + (b.kind === 'home' ? ' is-home' : '')}>
            <header>
              <span className="post" aria-hidden="true" />
              <div>
                <h2>{b.title}<small>{b.sub}</small></h2>
                <p>{b.note}{b.total ? ` · RESIDENTS ${b.total}` : ''}</p>
              </div>
              {!b.noMap && <Link href={`/pixel-town-2#${b.id}`} className="pt-board-map">지도에서 보기 →</Link>}
            </header>
            <ul>
              {b.list.map((r) => {
                const n = encountersWith(r.id).length;
                return (
                  <li key={r.id} className={r.tier + (met.includes(r.id) ? ' met' : '')}>
                    <button onClick={() => pick(r.id)} aria-haspopup="dialog">
                      <span className="face" aria-hidden="true">{r.name[0]}</span>
                      <b>{r.name}</b>
                      <small>{r.player ? '이 전시의 주인공' : r.connection}</small>
                      <span className="meta">
                        {r.tier === 'featured' && <em>FEATURED</em>}
                        {n > 0 && <i>STORIES {n}</i>}
                      </span>
                      {met.includes(r.id) && <span className="stamp" aria-label="이번 방문에서 만남">MET</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
            {b.others.length > 0 && (
              <details className="pt-others">
                <summary>그 외 {b.title} 주민 <b>{b.others.length}</b></summary>
                <ul>{b.others.map((n) => <li key={n}>{n}</li>)}</ul>
              </details>
            )}
          </section>
        ))}
      </div>

      {open && <ResidentCard id={open} onClose={close} />}
    </main>
  );
}
