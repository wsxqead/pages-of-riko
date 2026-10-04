import './goaon.css';
import Shell from './_components/Shell';

export const metadata = {
  title: '고아온 · 멋사 공책 RPG — PAGES OF RIKO',
  description: '짧은 겨울의 RPG 세계에서 만난 여섯 명의 파티, 길드 고아온의 세이브 데이터.',
};

export default function GoaonLayout({children}) {
  return <Shell>{children}</Shell>;
}
