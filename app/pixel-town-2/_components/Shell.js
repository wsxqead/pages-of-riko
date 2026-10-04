'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useRef} from 'react';
import {sections, server} from '@/data/pixelTown2/meta';

// 마을 표지판 메뉴: 현재 위치는 화살표 모양 표지판으로
export default function Shell({children}) {
  const path = usePathname();
  const active = (href) => (href === '/pixel-town-2' ? path === href : path.startsWith(href));
  const nav = useRef(null);
  useEffect(() => {
    const n = nav.current;
    const el = n?.querySelector('.on');
    if (n && el && n.scrollWidth > n.clientWidth) n.scrollLeft = el.offsetLeft - (n.clientWidth - el.clientWidth) / 2;
  }, [path]);
  return (
    <div className="pt">
      <header className="pt-bar">
        <Link href="/" className="pt-return">← PAGES OF RIKO</Link>
        <nav ref={nav} className="pt-signs" aria-label="픽크타2 전시 메뉴">
          {sections.map((s) => (
            <Link key={s.href} href={s.href} className={active(s.href) ? 'on' : ''} aria-current={active(s.href) ? 'page' : undefined}>
              <b>{s.label}</b>
              <small>{s.ko}</small>
            </Link>
          ))}
        </nav>
        <span className="pt-bar-date">2026.02.21 — 03.09</span>
      </header>
      {children}
      <footer className="pt-foot">
        <span>PAGE 03 · PIXEL CREATOR TOWN 2 · MEMORY MAP (NOT TO SCALE)</span>
        <Link href="/">마을을 나서기 · PAGES OF RIKO로 →</Link>
      </footer>
    </div>
  );
}
