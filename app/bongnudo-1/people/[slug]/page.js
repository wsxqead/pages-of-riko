import Link from 'next/link';
import {notFound} from 'next/navigation';
import {people, getPerson} from '@/data/bongnudo1/people';
import {linkHistory} from '@/data/bongnudo1/relationships';
import {groups, relationTypes, linkStates, priorities} from '@/data/bongnudo1/meta';
import {incidentsById} from '@/data/bongnudo1/incidents';
import {mediaForPerson} from '@/data/bongnudo1/media';
import {Photo, Clips} from '../../_components/Media';

export function generateStaticParams() {
  return people.map((p) => ({slug: p.id}));
}

export async function generateMetadata({params}) {
  const {slug} = await params;
  const p = getPerson(slug);
  return {title: p ? `${p.name} · 봉누도 1 — PAGES OF RIKO` : '봉누도 1'};
}

// 소속에 따라 문서의 형식이 다르다: 경찰 = 인사기록 / 칠쌍파 = 가족 앨범 / 그 외 = 연락처 메모
const DOC = {
  police: {kind: 'PERSONNEL FILE', ko: '경찰 인사기록'},
  chilssang: {kind: 'FAMILY ALBUM', ko: '칠쌍파 가족 메모'},
  cheongryong: {kind: 'CONTACT NOTE', ko: '청룡그룹 연락처'},
  ems: {kind: 'CONTACT NOTE', ko: '연락처'},
  other: {kind: 'CONTACT NOTE', ko: '연락처'},
};

export default async function PersonPage({params}) {
  const {slug} = await params;
  const p = getPerson(slug);
  if (!p) notFound();
  const history = linkHistory(p.id);
  const clips = mediaForPerson(p.id);
  const doc = DOC[p.group];

  return (
    <main className="b1-main b1-person" data-group={p.group}>
      <Link className="b1-crumb" href="/bongnudo-1/people">← PEOPLE · 관계도로</Link>

      <article className="b1-dossier">
        <header>
          <small>{doc.kind} · {doc.ko}</small>
          <span className="b1-dossier-pri">{priorities[p.priority]}</span>
        </header>

        <div className="b1-dossier-top">
          <Photo photo={p.photo} variant={p.group === 'police' ? 'cctv' : 'polaroid'} cam={groups[p.group].short} className="b1-dossier-photo" />
          <div>
            <p className="grp">{groups[p.group].name}</p>
            <h1>{p.name}</h1>
            {p.aliases?.length > 0 && <p className="alias">다른 표기 · {p.aliases.join(', ')}</p>}
            <p className="role">{p.role}</p>
            {p.tags.length > 0 && <ul className="b1-tags">{p.tags.map((t) => <li key={t}>{relationTypes[t] || t}</li>)}</ul>}
          </div>
        </div>

        <dl className="b1-dossier-facts">
          <div><dt>첫 인연</dt><dd>{p.firstMeet}</dd></div>
          <div><dt>정유자와</dt><dd>{p.summary}</dd></div>
          <div><dt>마지막 관계</dt><dd>{p.lastRelation}</dd></div>
        </dl>

        {history.length > 0 && (
          <section>
            <h2>관계의 흐름</h2>
            <ol className="b1-history wide">
              {history.map((h) => (
                <li key={h.phase.id} data-state={h.state}>
                  <time>{h.phase.label}<small>{h.phase.date}</small></time>
                  <b>{linkStates[h.state]}</b>
                  {h.raw.note && <span>{h.raw.note}</span>}
                </li>
              ))}
            </ol>
          </section>
        )}

        {p.moments.length > 0 && (
          <section>
            <h2>함께한 장면</h2>
            <ul className="b1-moments">
              {p.moments.map((m, i) => (
                <li key={i}>
                  <time>{m.date}</time>
                  <span>{m.text}</span>
                  {m.incident && incidentsById[m.incident] && (
                    <Link href={`/bongnudo-1/incidents#${m.incident}`}>CASE {incidentsById[m.incident].no} →</Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <Clips items={clips} title="관련 클립" />
      </article>
    </main>
  );
}
