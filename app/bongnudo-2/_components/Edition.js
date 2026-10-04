'use client';
import {useEffect, useSyncExternalStore} from 'react';
import {readBb2Seen, markBb2Seen} from '@/lib/bongnudo2Session';

const noSub = () => () => {};

// FRONT PAGE 를 감싼다: 세션 첫 방문에만 신문이 책상 위에 놓이는 짧은 연출 (콘텐츠는 처음부터 보인다)
export default function Edition({children, className = ''}) {
  const seen = useSyncExternalStore(noSub, readBb2Seen, () => false);
  useEffect(() => {
    const t = setTimeout(markBb2Seen, 1400);
    return () => clearTimeout(t);
  }, []);
  return <div className={`b2-edition ${seen ? 'ready' : 'first'} ${className}`}>{children}</div>;
}
