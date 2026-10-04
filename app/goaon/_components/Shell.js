'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useRef} from 'react';
import {sections, guild} from '@/data/goaon/meta';

// RPG 메뉴 바: 현재 메뉴 앞에 ▶ 커서.
export default function Shell({children}) {
  const path = usePathname();
  const active = (href) => (href === '/goaon' ? path === href : path.startsWith(href));
  const menu = useRef(null);
  // 모바일: 가로로 넘치는 메뉴에서 현재 항목이 보이도록 (페이지 스크롤은 건드리지 않음)
  useEffect(() => {
    const nav = menu.current;
    const el = nav?.querySelector('.on');
    if (nav && el && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = el.offsetLeft - (nav.clientWidth - el.clientWidth) / 2;
  }, [path]);
  return (
    <div className="ga">
      <header className="ga-bar">
        <Link href="/" className="ga-return">← PAGES OF RIKO</Link>
        <nav ref={menu} className="ga-menu" aria-label="고아온 전시 메뉴">
          {sections.map((s) => (
            <Link key={s.href} href={s.href} className={active(s.href) ? 'on' : ''} aria-current={active(s.href) ? 'page' : undefined}>
              <b>{s.label}</b>
              <small>{s.ko}</small>
            </Link>
          ))}
        </nav>
        <span className="ga-bar-slot">SLOT {guild.slot} · {guild.en}</span>
      </header>
      {children}
      <footer className="ga-foot">
        <span>PAGE 02 · {guild.gameEn} · SAVE SLOT {guild.slot}</span>
        <Link href="/">게임 종료 · PAGES OF RIKO로 돌아가기 →</Link>
      </footer>
    </div>
  );
}
