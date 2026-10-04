'use client';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {incidents, incidentsById} from '@/data/bongnudo1/incidents';
import {getPerson} from '@/data/bongnudo1/people';
import {groups} from '@/data/bongnudo1/meta';
import {mediaForEvent} from '@/data/bongnudo1/media';
import {Photo, Clips} from '../_components/Media';

export default function IncidentsPage() {
  const [id, setId] = useState(incidents[0].id);

  // /incidents#hq-attack 처럼 다른 페이지에서 특정 사건으로 바로 들어올 수 있다.
  useEffect(() => {
    const read = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      if (incidentsById[h]) setId(h);
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  const open = (cid) => {
    setId(cid);
    history.replaceState(null, '', '#' + cid);
    if (window.innerWidth < 860) document.getElementById('b1-casefile')?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  const c = incidentsById[id];
  const clips = mediaForEvent(c.id);

  return (
    <main className="b1-main b1-incidents">
      <header className="b1-page-head">
        <small>INCIDENTS · CASE FILES</small>
        <h1>사건 파일</h1>
        <p>하나의 사건 안에서 정유자가 맡은 역할, 곁에 있던 사람들, 그리고 그 사건이 관계에 남긴 것.</p>
      </header>

      <div className="b1-cases">
        <ol className="b1-case-list" role="tablist" aria-label="사건 목록">
          {incidents.map((x) => (
            <li key={x.id}>
              <button role="tab" aria-selected={x.id === id} className={x.id === id ? 'on' : ''} data-side={x.side} onClick={() => open(x.id)}>
                <small>CASE {x.no}</small>
                <b>{x.title}</b>
                <time>{x.date}</time>
              </button>
            </li>
          ))}
        </ol>

        <article className="b1-casefile" id="b1-casefile" key={c.id} data-side={c.side} role="tabpanel">
          <header>
            <small>BONGNUDO · CASE {c.no}</small>
            <h2>{c.title}</h2>
            <time>{c.date}</time>
            <span className="b1-case-stamp">{c.stamp}</span>
          </header>

          <div className="b1-casefile-grid">
            <Photo photo={c.photo} variant="cctv" cam={`CASE ${c.no}`} date={c.date} className="b1-case-photo" />

            <dl className="b1-case-fields">
              <div><dt>상황</dt><dd>{c.situation}</dd></div>
              <div><dt>정유자의 역할</dt><dd>{c.role}</dd></div>
              {c.stats && (
                <div>
                  <dt>기록</dt>
                  <dd className="b1-case-stats">
                    {c.stats.map((s) => <span key={s.label}><b>{s.value}</b>{s.label}</span>)}
                  </dd>
                </div>
              )}
              {c.records && (
                <div>
                  <dt>확인된 사례</dt>
                  <dd>
                    <ol className="b1-case-records">
                      {c.records.map((r) => <li key={r.date}><time>{r.date}</time>{r.text}</li>)}
                    </ol>
                  </dd>
                </div>
              )}
              <div><dt>결과</dt><dd>{c.result}</dd></div>
            </dl>
          </div>

          {c.people.length > 0 && (
            <section className="b1-case-people">
              <h3>함께한 인물</h3>
              <ul>
                {c.people.map(getPerson).filter(Boolean).map((p) => (
                  <li key={p.id} data-group={p.group}>
                    <Link href={`/bongnudo-1/people/${p.id}`}>
                      <b>{p.name}</b>
                      <small>{groups[p.group].short}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="b1-case-impact">
            <h3>관계에 남긴 것</h3>
            <p>{c.impact}</p>
          </section>

          <Clips items={clips} title="관련 클립" />
        </article>
      </div>
    </main>
  );
}
