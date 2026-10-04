import Link from 'next/link';
import Network from '../_components/Network';
import {people} from '@/data/bongnudo1/people';
import {groups, priorities} from '@/data/bongnudo1/meta';

export const metadata = {title: 'PEOPLE · 봉누도 1 — PAGES OF RIKO'};

const ORDER = ['chilssang', 'police', 'cheongryong', 'ems', 'other'];

export default function PeoplePage() {
  return (
    <main className="b1-main b1-people">
      <header className="b1-page-head">
        <small>PEOPLE · RELATIONSHIP NETWORK</small>
        <h1>정유자가 만난 사람들</h1>
        <p>시점을 넘기면 사람들이 나타나고, 자리를 옮기고, 선이 끊어졌다가 다시 이어집니다. 사람을 누르면 그 관계의 기록이 열립니다.</p>
      </header>

      <Network />

      <section className="b1-roster">
        <header className="b1-sec-head">
          <small>PERSONNEL INDEX</small>
          <h2>인물 파일</h2>
        </header>
        <div className="b1-roster-groups">
          {ORDER.map((g) => {
            const list = people.filter((p) => p.group === g);
            if (!list.length) return null;
            return (
              <div key={g} className="b1-roster-group" data-group={g}>
                <h3>{groups[g].name}<small>{groups[g].en}</small></h3>
                <ul>
                  {list.map((p) => (
                    <li key={p.id} data-priority={p.priority}>
                      <Link href={`/bongnudo-1/people/${p.id}`}>
                        <b>{p.name}</b>
                        <span>{p.role}</span>
                        <small>{priorities[p.priority]}</small>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
