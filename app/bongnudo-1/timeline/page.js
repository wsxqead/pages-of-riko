import Link from 'next/link';
import {days} from '@/data/bongnudo1/timeline';
import {getPerson} from '@/data/bongnudo1/people';
import {incidentsById} from '@/data/bongnudo1/incidents';

export const metadata = {title: 'TIMELINE · 봉누도 1 — PAGES OF RIKO'};

const SIDE_LABEL = {police: 'POLICE', chilssang: '칠쌍파', cheongryong: '청룡', both: 'BOTH'};
const KIND_LABEL = {
  relation: '관계', join: '합류', role: '임명', duty: '근무', war: '교전',
  loss: '부고', farewell: '작별', fun: '일상', end: '종료',
};

export default function TimelinePage() {
  return (
    <main className="b1-main b1-timeline">
      <header className="b1-page-head">
        <small>TIMELINE · DISPATCH LOG</small>
        <h1>정유자의 날짜들</h1>
        <p>
          왼쪽은 경찰 무전 기록, 오른쪽은 칠쌍파와 청룡의 메모.
          <br />
          모든 날짜가 아니라, 정유자에게 중요했던 날만 남겼습니다.
        </p>
      </header>

      <div className="b1-tl-lanes" aria-hidden="true">
        <span>POLICE LOG</span>
        <span>CHILSSANG · CHEONGRYONG NOTES</span>
      </div>

      <ol className="b1-tl">
        {days.map((d) => (
          <li key={d.id} className={'b1-tl-day' + (d.id === 'dec14' ? ' pivot' : '') + (d.id === 'end' ? ' end' : '')}>
            <div className="b1-tl-date">
              <b>{d.date}</b>
              {d.edu && <span className="edu" title="교육생 신분으로 맞은 대형 사건">EDU ⚠</span>}
            </div>
            <ul>
              {d.entries.map((e, i) => (
                <li key={i} className="b1-tl-entry" data-side={e.side} data-kind={e.kind}>
                  <span className="tag">{SIDE_LABEL[e.side]} · {KIND_LABEL[e.kind]}</span>
                  <p>{e.text}</p>
                  {(e.people?.length > 0 || e.incident) && (
                    <div className="refs">
                      {e.people?.map(getPerson).filter(Boolean).map((p) => (
                        <Link key={p.id} href={`/bongnudo-1/people/${p.id}`} data-group={p.group}>{p.name}</Link>
                      ))}
                      {e.incident && incidentsById[e.incident] && (
                        <Link className="case" href={`/bongnudo-1/incidents#${e.incident}`}>CASE {incidentsById[e.incident].no}</Link>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </main>
  );
}
