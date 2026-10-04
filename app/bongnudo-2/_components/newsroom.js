// 봉누도 2 · 보도국 사람과 장면 (서버 컴포넌트 — 데이터에서 계산한 값만 그린다)
import Link from 'next/link';
import {getPerson, personStats, STORY_TYPES, getArticle} from '@/data/bongnudo2';
import {personPath} from './ui';

const SHIN = 'shin-ibi';
const pad = (n) => String(n).padStart(2, '0');

export const REL_TYPES = {
  colleague: '동료',
  'joint-reporting': '공동 취재',
  'chief-reporter': '국장 · 기자',
  'close-colleague': '가까운 동료',
  'news-desk': '함께 뉴스 진행',
  'information-sharing': '정보 공유',
  conflict: '갈등',
  reconciliation: '화해',
  'war-correspondents': '함께 종군취재',
  other: '기록',
};

// 출처 표시: 원자료(BBS 기사·클립)가 연결되기 전의 정리 기록임을 작게 밝힌다
export function SourceTag({item}) {
  if (!item || item.verification === 'confirmed') return null;
  const linked = (item.articleIds?.length || 0) + (item.clipUrls?.length || 0) > 0;
  const base = item.sourceType === 'community-summary' ? '커뮤니티 요약' : '정리 기록';
  return <small className="b2-source-tag">{linked ? base : `${base} · 원자료 연결 전`}</small>;
}

// 인물 사진 — 실제 이미지가 없으면 이름 첫 글자로 만든 인화지 판
export function Portrait({p, size = 'md'}) {
  if (p.image?.src)
    return <img className={'b2-portrait ' + size} src={p.image.src} alt={p.image.alt || p.name} width={p.image.width || undefined} height={p.image.height || undefined} loading="lazy" />;
  return (
    <span className={'b2-portrait mono ' + size + (p.id === SHIN ? ' is-shin' : '')} aria-hidden="true">
      {p.name.slice(0, 1)}
    </span>
  );
}

export function PersonChip({id}) {
  const p = getPerson(id);
  if (!p) return null;
  return (
    <Link href={personPath(id)} className={'b2-chip-person' + (id === SHIN ? ' is-shin' : '')}>
      {id === SHIN && <i className="b2-press">PRESS</i>}
      {p.name}
    </Link>
  );
}

// 기자 카드: 이름 > 사람의 이야기 > 기자 활동 > 관계 > (작게) 최종 직급
export function PersonCard({p}) {
  const s = personStats(p.id);
  const facts = [
    s.written > 0 && `REPORTS ${s.written}`,
    s.stories > 0 && `NEWSROOM STORIES ${s.stories}`,
    s.relationships > 0 && `RELATIONSHIPS ${s.relationships}`,
    s.letter && 'LETTER',
  ].filter(Boolean);
  return (
    <article className={'b2-pcard' + (p.id === SHIN ? ' is-shin' : '')}>
      <Link href={personPath(p.id)} className="b2-pcard-link">
        <Portrait p={p} />
        <div className="b2-pcard-body">
          <h3>
            {p.name}
            {p.id === SHIN && <i className="b2-press">PRESS</i>}
          </h3>
          {p.streamer && <p className="b2-pcard-streamer">{p.streamer}</p>}
          {p.profile.tagline && <p className="b2-pcard-tagline">“{p.profile.tagline}”</p>}
          {p.profile.summary && <p className="b2-pcard-summary">{p.profile.summary}</p>}
          {facts.length > 0 && (
            <ul className="b2-pcard-facts">
              {facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
          {p.finalPosition && <p className="b2-pcard-pos">FINAL POSITION · {p.finalPosition}</p>}
        </div>
      </Link>
    </article>
  );
}

// 보도국 기자 명부 — 한 판에 나란히 놓인 기자들 (직급순 줄 세우기 없음)
export function RosterPlate({members, others = []}) {
  return (
    <figure className="b2-plate">
      <div className="b2-plate-frame">
        <ol className="b2-plate-row">
          {members.map((p, i) => (
            <li key={p.id} style={{'--i': i}} className={p.id === SHIN ? 'is-shin' : ''}>
              <Link href={personPath(p.id)}>
                <Portrait p={p} size="sm" />
                <b>{p.name}</b>
                {p.streamer && <small>{p.streamer}</small>}
              </Link>
            </li>
          ))}
        </ol>
      </div>
      <figcaption>
        <b>봉누도방송국 보도국 기자들.</b> 왼쪽 위부터 {members.map((p) => p.name).join(', ')}.
        {others.length > 0 && <> 보도국 기록에는 {others.map((p) => p.name).join(', ')}도 함께 등장한다.</>}
      </figcaption>
    </figure>
  );
}

// NEWSROOM STORY 한 장면 (취재 사례면 단계가 이어진다)
export function StoryCard({s, compact = false, hidePeople = false}) {
  const type = STORY_TYPES[s.type];
  const when = s.day ? `DAY ${pad(s.day)}` : s.when;
  const articles = s.articleIds.map(getArticle).filter(Boolean);
  return (
    <article className={'b2-story' + (s.steps.length ? ' is-case' : '') + (compact ? ' compact' : '')} id={compact ? undefined : `story-${s.id}`}>
      <p className="b2-story-meta">
        {s.steps.length ? 'REPORTING CASE' : type?.label}
        {when && <span>{when}</span>}
      </p>
      <h3>{s.title}</h3>
      {s.summary && <p className="b2-story-text">{s.summary}</p>}
      {s.steps.length > 0 && (
        <ol className="b2-case-steps">
          {s.steps.map((st, i) => (
            <li key={st.label}>
              <small>{pad(i + 1)}</small>
              <b>{st.label}</b>
              {st.summary && <span>{st.summary}</span>}
              {st.articleIds?.map(getArticle).filter(Boolean).map((a) => (
                <Link key={a.id} href={`/bongnudo-2/archive/${encodeURIComponent(a.id)}`} className="b2-textlink">{a.title} →</Link>
              ))}
            </li>
          ))}
        </ol>
      )}
      {!hidePeople && s.people.length > 0 && (
        <p className="b2-story-people">
          {s.people.map((id) => (
            <PersonChip key={id} id={id} />
          ))}
        </p>
      )}
      {s.contrast && (
        <p className="b2-story-contrast">
          <small>{s.contrast.label}</small>
          {s.contrast.people.map((id) => (
            <PersonChip key={id} id={id} />
          ))}
        </p>
      )}
      {articles.length > 0 && (
        <ul className="b2-story-links">
          {articles.map((a) => (
            <li key={a.id}>
              <Link href={`/bongnudo-2/archive/${encodeURIComponent(a.id)}`}>{a.title} →</Link>
            </li>
          ))}
        </ul>
      )}
      {s.clipUrls?.length > 0 && (
        <ul className="b2-story-links">
          {s.clipUrls.map((u, i) => (
            <li key={u}>
              <a href={u} target="_blank" rel="noopener noreferrer">CLIP {pad(i + 1)} ↗</a>
            </li>
          ))}
        </ul>
      )}
      <SourceTag item={s} />
    </article>
  );
}

// 두 사람 사이의 기록 한 줄 (관계 요약 + 함께 등장한 장면)
export function Between({x}) {
  const p = x.person;
  return (
    <li className="b2-between">
      <Link href={personPath(p.id)} className="b2-between-name">
        <Portrait p={p} size="xs" />
        <b>{p.name}</b>
        {p.streamer && <small>{p.streamer}</small>}
      </Link>
      <div>
        {x.relationships.map((r, i) => (
          <p key={i}>
            <em>{REL_TYPES[r.type] || REL_TYPES.other}</em>
            {r.summary}
          </p>
        ))}
        {x.stories.length > 0 && (
          <p className="b2-between-stories">
            <small>함께 등장한 장면</small>
            {x.stories.map((s) => (
              <Link key={s.id} href={`/bongnudo-2/newsroom#story-${s.id}`}>{s.title}</Link>
            ))}
          </p>
        )}
      </div>
    </li>
  );
}
