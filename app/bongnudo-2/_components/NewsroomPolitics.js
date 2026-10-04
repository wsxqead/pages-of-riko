'use client';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {politicsDays} from '@/data/bongnudo2/politics';
import {people, peopleById, newsroomIds} from '@/data/bongnudo2/people';
import {personPath} from './ui';

const SHIN = 'shin-ibi';
const ROW = 58;
const DESK_TOP = 92;

// 날짜마다 기자들의 자리(책상)를 계산한다 — 관계선 대신 "자리와 입장이 움직인다"
function seating(day) {
  const k = day.groups.length;
  const cols = k === 1 ? 4 : 2;
  const pos = {};
  let maxRows = 1;
  day.groups.forEach((g, gi) => {
    g.members.forEach((id, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      maxRows = Math.max(maxRows, r + 1);
      pos[id] = {x: (gi + (c + 0.5) / cols) * (100 / k), y: DESK_TOP + r * ROW, seated: true, tone: g.tone};
    });
  });
  const seated = new Set(day.groups.flatMap((g) => g.members));
  const benchTop = DESK_TOP + maxRows * ROW + 64;
  const bench = newsroomIds.filter((id) => !seated.has(id));
  bench.forEach((id, i) => {
    pos[id] = {x: ((i % 6) + 0.5) * (100 / 6), y: benchTop + Math.floor(i / 6) * 48, seated: false};
  });
  const height = bench.length ? benchTop + Math.ceil(bench.length / 6) * 48 + 16 : DESK_TOP + maxRows * ROW + 20;
  return {pos, benchTop, bench, height, deskBottom: DESK_TOP + maxRows * ROW};
}

export default function NewsroomPolitics() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const h = location.hash.slice(1);
    const at = politicsDays.findIndex((d) => d.id === h);
    if (at >= 0) {
      setI(at);
      document.getElementById('politics')?.scrollIntoView();
    }
  }, []);
  const pick = (n) => {
    const j = Math.max(0, Math.min(politicsDays.length - 1, n));
    setI(j);
    history.replaceState(null, '', '#' + politicsDays[j].id);
  };
  const day = politicsDays[i];
  const {pos, benchTop, bench, height, deskBottom} = seating(day);
  const inferred = day.groups.some((g) => g.inferred);
  const k = day.groups.length;

  return (
    <section className="b2-politics" aria-label="보도국 파벌 기록">
      <div className="b2-daybar" role="tablist" aria-label="날짜">
        <button className="arrow" onClick={() => pick(i - 1)} disabled={i === 0} aria-label="이전 날">←</button>
        <ol>
          {politicsDays.map((d, n) => (
            <li key={d.id}>
              <button role="tab" aria-selected={n === i} className={n === i ? 'on' : ''} onClick={() => pick(n)}>{d.label}</button>
            </li>
          ))}
        </ol>
        <button className="arrow" onClick={() => pick(i + 1)} disabled={i === politicsDays.length - 1} aria-label="다음 날">→</button>
      </div>

      <div className="b2-politics-head" key={day.id}>
        <h2>{day.label}</h2>
        {day.caption && <p className="cap">{day.caption}</p>}
        {inferred && <p className="b2-note">* 원자료에 개별 이름이 적혀 있지 않아, 앞뒤 기록을 바탕으로 자리를 채운 날입니다.</p>}
      </div>

      {/* Desktop: 보도국 바닥 — 책상과 사람의 자리 (이름을 누르면 그 기자의 기록으로) */}
      <div className="b2-floor" style={{height}}>
        {day.groups.map((g, gi) => (
          <div key={g.id + day.id} className={'b2-desk tone-' + (g.tone || 'c')} style={{left: `calc(${(gi * 100) / k}% + 8px)`, width: `calc(${100 / k}% - 16px)`, height: deskBottom - 30}}>
            <span className="b2-desk-plate">{g.name}{g.inferred && <i className="b2-inferred">*</i>}<small>{g.members.length}</small></span>
          </div>
        ))}
        {bench.length > 0 && <span className="b2-bench-label" style={{top: benchTop - 34}}>이날 파벌 기록에 없는 기자</span>}
        {people.filter((p) => p.group === 'newsroom').map((p) => {
          const q = pos[p.id];
          return (
            <Link
              key={p.id}
              href={personPath(p.id)}
              className={'b2-reporter' + (p.id === SHIN ? ' is-shin' : '') + (q.seated ? '' : ' benched')}
              style={{left: `${q.x}%`, top: q.y}}
            >
              {p.id === SHIN && <i className="b2-press">PRESS</i>}
              {p.name}
            </Link>
          );
        })}
      </div>

      {/* Mobile + 스크린리더: 책상별 목록 */}
      <div className="b2-floor-list">
        {day.groups.map((g) => (
          <section key={g.id} className={'b2-desk-list tone-' + (g.tone || 'c')}>
            <h3>{g.name}{g.inferred && <i className="b2-inferred">*</i>}<small>{g.members.length}</small></h3>
            <ul>
              {g.members.map((id) => (
                <li key={id} className={id === SHIN ? 'is-shin' : ''}>
                  <Link href={personPath(id)}>
                    {id === SHIN && <i className="b2-press">PRESS</i>}
                    {peopleById[id]?.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {bench.length > 0 && (
          <section className="b2-desk-list bench">
            <h3>이날 파벌 기록에 없는 기자</h3>
            <ul>{bench.map((id) => <li key={id}><Link href={personPath(id)}>{peopleById[id]?.name}</Link></li>)}</ul>
          </section>
        )}
      </div>

      <p className="b2-note">봉누도 RP 안의 보도국 내부 입장 기록입니다. 현실의 정치 성향과는 관계가 없습니다.</p>
    </section>
  );
}
