'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';

// 예전 주소(/bongnudo-2/people#lee-yoonjin)로 들어오면 그 사람의 기록 페이지로 보낸다
export default function PeopleHashRedirect({ids}) {
  const router = useRouter();
  useEffect(() => {
    const go = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      if (ids.includes(h)) router.replace(`/bongnudo-2/people/${encodeURIComponent(h)}`);
    };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
  }, [ids, router]);
  return null;
}
