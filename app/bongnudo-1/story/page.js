'use client';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {chapters} from '@/data/bongnudo1/story';
import {getPerson} from '@/data/bongnudo1/people';
import {groups} from '@/data/bongnudo1/meta';
import {Photo} from '../_components/Media';
import useReveal from '../_components/useReveal';

// 관계 변화 다이어그램: 정유자를 가운데 두고 좌우 선의 상태가 바뀐다.
const SHIFT = {
  join: {l: 'pink solid', r: null, ll: '가족이 되다'},
  spy: {l: 'pink solid', r: 'blue dashed arrow', ll: '집', rl: '잠입'},
  family: {l: 'pink solid', r: 'blue solid', ll: '가족', rl: '가족'},
  split: {l: 'grey cut', r: 'blue solid', ll: '갈라짐', rl: '남음'},
  return: {l: 'pink solid redraw', r: null, ll: '다시 이어지다'},
};

function Shift({beat}) {
  const m = SHIFT[beat.mode];
  return (
    <figure className={'b1-shift mode-' + beat.mode}>
      <div className="b1-shift-row">
        <span className={'b1-shift-node side ' + (beat.mode === 'split' ? 'north' : 'chilssang')}>{beat.left}</span>
        <span className={'b1-shift-line ' + m.l}><i /><em>{m.ll}</em></span>
        <span className="b1-shift-node center">정유자</span>
        {m.r && (
          <>
            <span className={'b1-shift-line ' + m.r}><i /><em>{m.rl}</em></span>
            <span className={'b1-shift-node side ' + (beat.mode === 'split' ? 'south' : 'police')}>{beat.right}</span>
          </>
        )}
      </div>
      <figcaption>{beat.note}</figcaption>
    </figure>
  );
}

function Beat({beat}) {
  switch (beat.type) {
    case 'text':
      return <p className={'b1-beat-text' + (beat.emphasis ? ' em' : '')}>{beat.text}</p>;
    case 'titles':
      return (
        <div className="b1-beat-titles">
          <small>{beat.label}</small>
          <ul>{beat.items.map((t, i) => <li key={t} style={{'--i': i}}>{t}</li>)}</ul>
        </div>
      );
    case 'photo':
      return <Photo photo={beat.src ? {src: beat.src} : null} variant={beat.variant} cam={beat.cam} caption={beat.caption} className="b1-beat-photo" />;
    case 'event':
      return (
        <div className="b1-beat-event">
          <time>{beat.date}</time>
          <div>
            <b>{beat.title}</b>
            <p>{beat.text}</p>
            {beat.incident && <Link href={`/bongnudo-1/incidents#${beat.incident}`}>사건 파일 →</Link>}
          </div>
        </div>
      );
    case 'quote':
      return (
        <blockquote className={'b1-beat-quote ' + (beat.speaker === '정유자' ? 'yuja' : 'other')}>
          <p>{beat.text}</p>
          <cite>— {beat.speaker}{beat.paraphrase && <small> (말의 요지)</small>}</cite>
        </blockquote>
      );
    case 'shift':
      return <Shift beat={beat} />;
    case 'warning':
      return (
        <div className="b1-beat-warning">
          <span>⚠ EDUCATION STATUS · 교육생의 저주 #{beat.count}</span>
          <p>{beat.text}</p>
        </div>
      );
    case 'people':
      return (
        <ul className="b1-beat-people">
          {beat.ids.map(getPerson).filter(Boolean).map((p) => (
            <li key={p.id} data-group={p.group}>
              <Link href={`/bongnudo-1/people/${p.id}`}>
                <b>{p.name}</b>
                <small>{groups[p.group].short} · {p.role}</small>
              </Link>
            </li>
          ))}
        </ul>
      );
    case 'next':
      return <Link className="b1-beat-next" href={beat.href}>{beat.label} →</Link>;
    default:
      return null;
  }
}

export default function Story() {
  const root = useRef(null);
  const [active, setActive] = useState(chapters[0].id);
  useReveal(root);

  useEffect(() => {
    const els = root.current.querySelectorAll('.b1-chapter');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      {rootMargin: '-45% 0px -50% 0px'},
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main className="b1-main b1-story" ref={root}>
      <header className="b1-page-head">
        <small>STORY · 8 CHAPTERS</small>
        <h1>정유자의 3주</h1>
        <p>칠쌍파의 막내딸은 어떻게 경찰의 가족이 되었고, 왜 어느 쪽도 버릴 수 없었을까.</p>
      </header>

      <div className="b1-story-body">
        <nav className="b1-rail" aria-label="챕터">
          {chapters.map((c) => (
            <a key={c.id} href={`#${c.id}`} className={active === c.id ? 'on' : ''} data-side={c.side}>
              <b>{c.no}</b>
              <span>{c.title}</span>
            </a>
          ))}
        </nav>

        <div className="b1-chapters">
          {chapters.map((c) => (
            <section key={c.id} id={c.id} className="b1-chapter" data-side={c.side}>
              <header data-reveal>
                <span className="no">CHAPTER {c.no}</span>
                <h2>{c.title}</h2>
                <p><span>{c.en}</span><time>{c.period}</time></p>
              </header>
              {c.beats.map((b, i) => (
                <div key={i} className={'b1-beat t-' + b.type} data-reveal>
                  <Beat beat={b} />
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
