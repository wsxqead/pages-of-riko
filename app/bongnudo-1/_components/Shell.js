'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {createContext, useContext, useState} from 'react';
import {sections} from '@/data/bongnudo1/meta';

// DUAL SIDE 렌즈: 전시 전체(모든 하위 페이지)에 걸쳐 유지된다.
const SideContext = createContext({side: 'all', setSide: () => {}});
export const useSide = () => useContext(SideContext);

const LENSES = [
  {id: 'police', label: 'POLICE', ko: '경찰'},
  {id: 'all', label: 'ALL', ko: '전체'},
  {id: 'chilssang', label: 'CHILSSANG', ko: '칠쌍파'},
];

export function LensSwitch({compact}) {
  const {side, setSide} = useSide();
  return (
    <div className={'b1-lens' + (compact ? ' compact' : '')} role="radiogroup" aria-label="보기 기준 선택">
      {LENSES.map((l) => (
        <button key={l.id} role="radio" aria-checked={side === l.id} className={side === l.id ? 'on' : ''} data-lens={l.id} onClick={() => setSide(l.id)}>
          <b>{l.label}</b>
          {!compact && <small>{l.ko}</small>}
        </button>
      ))}
      <i className="b1-lens-thumb" aria-hidden="true" />
    </div>
  );
}

export default function Shell({children}) {
  const [side, setSide] = useState('all');
  const path = usePathname();
  const active = (href) => (href === '/bongnudo-1' ? path === href : path.startsWith(href));
  return (
    <SideContext.Provider value={{side, setSide}}>
      <div className="b1" data-side={side}>
        <header className="b1-bar">
          <Link href="/" className="b1-return">← PAGES OF RIKO</Link>
          <nav className="b1-nav" aria-label="봉누도 1 전시 메뉴">
            {sections.map((s) => (
              <Link key={s.href} href={s.href} className={active(s.href) ? 'on' : ''} aria-current={active(s.href) ? 'page' : undefined}>
                <b>{s.label}</b>
                <small>{s.ko}</small>
              </Link>
            ))}
          </nav>
          <LensSwitch compact />
        </header>
        {children}
        <footer className="b1-foot">
          <span>PAGE 01 · BONGNUDO 1 · 2024.11.26 — 2024.12.17</span>
          <Link href="/">CLOSE CASE · 기록관으로 돌아가기 →</Link>
        </footer>
      </div>
    </SideContext.Provider>
  );
}
