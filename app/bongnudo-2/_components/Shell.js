'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useRef} from 'react';
import {sections, archive} from '@/data/bongnudo2/meta';

// 신문 상단 masthead 형식의 섹션 내비게이션
export default function Shell({children}) {
  const path = usePathname();
  const active = (href) => (href === '/bongnudo-2' ? path === href : path.startsWith(href));
  const nav = useRef(null);
  useEffect(() => {
    const n = nav.current;
    const el = n?.querySelector('.on');
    if (n && el && n.scrollWidth > n.clientWidth) n.scrollLeft = el.offsetLeft - (n.clientWidth - el.clientWidth) / 2;
  }, [path]);
  return (
    <div className="b2">
      <header className="b2-top">
        <div className="b2-top-row">
          <Link href="/" className="b2-return">← PAGES OF RIKO</Link>
          <span className="b2-top-source">{archive.sourceName} · DIGITAL ARCHIVE</span>
        </div>
        <nav ref={nav} className="b2-sections" aria-label="봉누도 2 전시 메뉴">
          {sections.map((s) => (
            <Link key={s.href} href={s.href} className={active(s.href) ? 'on' : ''} aria-current={active(s.href) ? 'page' : undefined}>
              <b>{s.label}</b>
              <small>{s.ko}</small>
            </Link>
          ))}
        </nav>
      </header>
      {children}
      <footer className="b2-foot">
        <span>PAGE 06 · {archive.sourceName} · {archive.archiveName}</span>
        <Link href="/">RETURN TO THE ALBUM · PAGES OF RIKO →</Link>
      </footer>
    </div>
  );
}
