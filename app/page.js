'use client';
import Link from 'next/link';
import {useState, useSyncExternalStore} from 'react';
import {pages} from '@/data/pages';
import {readOpened, markOpened} from '@/lib/openingSession';

const noSubscribe = () => () => {};

// 6개 PAGE는 모두 동등하게 취급한다. 썸네일·로고·날짜는 data/pages.js 에서 관리한다.

function Entry({p, i}) {
  return (
    <li className="al-entry" data-world={p.world} style={{'--i': i}}>
      <Link href={p.href} className="al-link" aria-label={`PAGE ${p.no} ${p.title} 펼치기`}>
        <div className="al-pageno"><span>PAGE</span><b>{p.no}</b></div>
        <figure className="al-photo">
          <div className="al-frame">
            {p.image
              ? <img src={p.image} alt={`${p.title} 대표 이미지`} width={720} height={404} loading="lazy" decoding="async" />
              : <div className="al-placeholder"><span>REPRESENTATIVE IMAGE</span><small>PAGE {p.no} · 대표 이미지 자리</small></div>}
            <i className="al-hint" aria-hidden="true" />
          </div>
          <span className="al-corner tl" /><span className="al-corner tr" /><span className="al-corner bl" /><span className="al-corner br" />
        </figure>
        <div className={'al-caption' + (p.logo ? ' has-logo' : '')}>
          {p.logo && (
            <div className={'al-logo ' + p.logo.type} style={{'--s': p.logo.scale ?? 1}}>
              <img src={p.logo.src} alt={p.logo.alt} width={p.logo.width} height={p.logo.height} loading="lazy" decoding="async" />
            </div>
          )}
          <h2>{p.title}</h2>
          <p className="al-sub">{p.sub || ' '}</p>
          <p className="al-desc">{p.desc}</p>
          <dl className="al-meta">
            <div><dt>DATE</dt><dd>{p.date || '—— . —— . ——'}</dd></div>
            <div><dt>REC.</dt><dd>No. {p.no.padStart(3, '0')}</dd></div>
          </dl>
          <span className="al-enter">이 페이지 펼치기 <em>→</em></span>
        </div>
      </Link>
    </li>
  );
}

export default function Home() {
  // 세션 입장 여부: 서버/하이드레이션 중에는 null(모름), 클라이언트 이동 시에는 즉시 값을 읽는다.
  const opened = useSyncExternalStore(noSubscribe, readOpened, () => null);
  // 사용자가 직접 고른 화면 ('cover' | 'album'). 고르기 전에는 세션 값을 따른다.
  const [view, setView] = useState(null);
  const [animate, setAnimate] = useState(false);
  const mode = view ?? (opened === null ? 'auto' : opened ? 'album' : 'cover');

  const openBook = () => { markOpened(); setAnimate(true); setView('album'); window.scrollTo(0, 0); };
  const closeBook = () => { setView('cover'); window.scrollTo(0, 0); };

  // auto: 첫 페인트 전 인라인 스크립트(app/layout.js)가 주입한 CSS가 표지/앨범을 고른다.
  // instant: 세션 복귀로 바로 앨범에 들어온 경우 — 펼치기 애니메이션 없이 표시.
  const cls = ['home', mode === 'album' && 'opened', mode === 'auto' && 'auto', mode === 'album' && !animate && 'instant'].filter(Boolean).join(' ');
  return (
    <main className={cls}>
      {mode !== 'album' && <section className="cover"><p className="eyebrow">A MEMORY COLLECTION</p><h1>PAGES <i>OF</i> RIKO</h1><p>함께였기에 이야기가 된,<br/>리코의 소중한 페이지들.</p><button onClick={openBook}>기록 펼치기 <span>→</span></button></section>}
      {mode !== 'cover' && (
        <section className="album">
          <header className="al-head">
            <div className="al-runner"><span>PAGES OF RIKO</span><span>MEMORY ALBUM · 01—06</span></div>
            <p className="al-kicker">THE PAGES</p>
            <h1>함께했던 세계들을<br/>다시 펼쳐봅니다.</h1>
            <p className="al-lead">리코가 누군가와 함께 만들어 간 여섯 개의 이야기.<br/>한 장씩 넘기며, 그 세계로 들어가 보세요.</p>
          </header>
          <ol className="al-grid">
            {pages.map((p, i) => <Entry key={p.href} p={p} i={i} />)}
          </ol>
          <footer className="al-foot">
            <span>각 페이지는 서로 다른 세계의 방식으로 기억됩니다.</span>
            <button onClick={closeBook}>↑ 표지로 돌아가기</button>
          </footer>
        </section>
      )}
    </main>
  );
}
