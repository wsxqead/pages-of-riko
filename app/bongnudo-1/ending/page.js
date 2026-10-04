'use client';
import Link from 'next/link';
import {useEffect, useMemo, useRef, useState} from 'react';
import {scenes, moods} from '@/data/bongnudo1/ending';
import {getPerson} from '@/data/bongnudo1/people';
import {server, yuja} from '@/data/bongnudo1/meta';
import {Photo} from '../_components/Media';
import useReveal from '../_components/useReveal';

// 스크롤을 내릴수록 장면 속 사람들이 정유자의 기억 안으로 하나씩 모인다.
function Memory({ids, final}) {
  const list = ids.map(getPerson).filter(Boolean);
  return (
    <div className={'b1-memory' + (final ? ' final' : '')} aria-label={`정유자의 기억 속 ${list.length}명`}>
      <div className="b1-memory-ring">
        {list.map((p, i) => {
          const a = -90 + (360 / list.length) * i;
          const r = 40;
          const rad = (a * Math.PI) / 180;
          return (
            <span key={p.id}>
              <i className="b1-memory-line" data-group={p.group} style={{width: r + '%', transform: `rotate(${a}deg)`}} />
              <span className="b1-memory-node" data-group={p.group} style={{left: 50 + r * Math.cos(rad) + '%', top: 50 + r * Math.sin(rad) + '%'}}>
                <b>{p.name[0]}</b>
                <small>{p.name}</small>
              </span>
            </span>
          );
        })}
        <span className="b1-memory-center">{yuja.name}</span>
      </div>
      <p className="b1-memory-count">
        <b>{list.length}</b> 명의 기억
      </p>
    </div>
  );
}

export default function EndingPage() {
  const root = useRef(null);
  const [idx, setIdx] = useState(-1);
  useReveal(root);

  useEffect(() => {
    const els = root.current.querySelectorAll('.b1-scene');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setIdx(Number(e.target.dataset.idx))),
      {rootMargin: '-40% 0px -50% 0px'},
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const collected = useMemo(() => {
    const ids = [];
    scenes.slice(0, idx + 1).forEach((s) => s.people.forEach((id) => !ids.includes(id) && ids.push(id)));
    return ids;
  }, [idx]);
  const final = idx === scenes.length - 1;
  const warm = Math.max(0, idx) / (scenes.length - 1);

  return (
    <main className={'b1-main b1-ending' + (final ? ' is-final' : '')} ref={root} style={{'--warm': warm}}>
      <header className="b1-page-head">
        <small>LAST NIGHT · 12.15 — 12.17</small>
        <h1>마지막 밤</h1>
        <p>웃음, 장난, 눈물, 작별, 그리고 재회. 정유자는 함께했던 사람들을 하나씩 만나러 갔다.</p>
      </header>

      <div className="b1-ending-body">
        <aside className="b1-ending-side">
          <Memory ids={collected} final={final} />
        </aside>

        <ol className="b1-scenes">
          {scenes.map((s, i) => (
            <li key={s.id} className={'b1-scene' + (s.finale ? ' finale' : '') + (i === idx ? ' cur' : '')} data-idx={i} data-side={s.side}>
              {s.finale ? (
                <div className="b1-finale" data-reveal>
                  <p className="clock">SERVER CLOSED · {server.endLabel}</p>
                  <p className="line">경찰에게 작별하고, 칠쌍파 아지트로.</p>
                  <h2>두 곳 모두,<br />가족이었다.</h2>
                  <Memory ids={collected.length ? collected : []} final />
                  <div className="b1-finale-links">
                    <Link href="/bongnudo-1/people">관계도 다시 보기</Link>
                    <Link href="/">PAGES OF RIKO로 돌아가기 →</Link>
                  </div>
                </div>
              ) : (
                <article data-reveal>
                  <header>
                    <span className="no">{s.no}</span>
                    <div>
                      <h2>{s.title}</h2>
                      <p>
                        <time>{s.date}</time>
                        {s.mood.map((m) => <span key={m} className={'mood ' + m}>{moods[m]}</span>)}
                      </p>
                    </div>
                  </header>
                  <p className="text">{s.text}</p>
                  {s.identities && (
                    <ul className="b1-identities">
                      {s.identities.map((t, k) => <li key={t} style={{'--i': k}}>{t}</li>)}
                    </ul>
                  )}
                  <Photo photo={s.photo} variant={s.side === 'police' ? 'cctv' : 'polaroid'} cam={`LAST NIGHT · ${s.no}`} date={s.date} className="b1-scene-photo" />
                  {s.people.length > 0 && (
                    <p className="with">
                      {s.people.map(getPerson).filter(Boolean).map((p) => (
                        <Link key={p.id} href={`/bongnudo-1/people/${p.id}`} data-group={p.group}>{p.name}</Link>
                      ))}
                    </p>
                  )}
                </article>
              )}
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
