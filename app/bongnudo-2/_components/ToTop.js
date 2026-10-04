'use client';
import {useEffect, useState} from 'react';

// 긴 기사에서만 나타나는 "맨 위로"
export default function ToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 1400);
    on();
    window.addEventListener('scroll', on, {passive: true});
    return () => window.removeEventListener('scroll', on);
  }, []);
  if (!show) return null;
  return (
    <button className="b2-totop" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} aria-label="기사 맨 위로">
      ↑ TOP
    </button>
  );
}
