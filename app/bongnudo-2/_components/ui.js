// 봉누도 2 · 공용 조각 (서버/클라이언트 공용, 훅 없음, 데이터 import 없음 — 클라이언트 번들에 기사 데이터가 실리지 않게)
import Link from 'next/link';

export const fmtDate = (iso) => (iso ? iso.slice(0, 10).replace(/-/g, '.') : null);
export const fmtDateTime = (iso) => (iso ? `${fmtDate(iso)}${iso.length >= 16 ? ' ' + iso.slice(11, 16) : ''}` : null);
export const reporterPath = (key) => (key ? `/bongnudo-2/archive/reporter/${encodeURIComponent(key)}` : null);
// 봉누도방송국 BBS NEWS 로고 — 원본 394×329 (투명 여백 1px). 높이만 지정하고 가로는 원본 비율대로.
// 봉누도 Season 2 로고(전시 자체의 로고)와 다른, 방송국/보도 시스템의 기관 마크다.
export const BBS_LOGO = {src: '/images/bongnudo-2/bbs-logo.webp', width: 394, height: 329};
export function BbsLogo({className = '', label = 'BBS NEWS — 봉누도방송국'}) {
  return <img className={'b2-bbs-logo ' + className} src={BBS_LOGO.src} width={BBS_LOGO.width} height={BBS_LOGO.height} alt={label} decoding="async" />;
}

export const personPath = (id) => (id ? `/bongnudo-2/people/${encodeURIComponent(id)}` : null);
const pad = (n) => String(n).padStart(2, '0');

// 기사 목록 한 줄 (clipping) — 제목은 기사로, 기자명은 그 기자의 Archive 로
export function Clipping({a, compact = false, hideReporter = false}) {
  const href = `/bongnudo-2/archive/${encodeURIComponent(a.id)}`;
  const meta = [a.day ? `DAY ${pad(a.day)}` : null, fmtDate(a.publishedAt), a.category].filter(Boolean);
  const rHref = reporterPath(a.reporterKey);
  const thumb = a.thumb && !compact;
  return (
    <article className={'b2-clip' + (compact ? ' compact' : '') + (thumb ? ' has-thumb' : '')}>
      <div className="b2-clip-text">
        <Link href={href} className="b2-clip-link">
          {meta.length > 0 && <small className="b2-clip-meta">{meta.join(' · ')}</small>}
          <b className="b2-clip-title">
            {a.isShinIbiArticle && <i className="b2-shin-mark">SHIN IBI REPORT</i>}
            {a.title}
          </b>
          {!compact && a.excerpt && <span className="b2-clip-excerpt">{a.excerpt}</span>}
        </Link>
        <span className="b2-clip-foot">
          {a.author?.name && !hideReporter && (rHref ? <Link href={rHref} className="b2-byline-link">BY {a.author.name}</Link> : <span>BY {a.author.name}</span>)}
          {a.photoCount > 0 && <span>PHOTO {pad(a.photoCount)}</span>}
          {a.videoCount > 0 && <span>VIDEO {pad(a.videoCount)}</span>}
          {!compact && <Link href={href} className="b2-read">READ ARTICLE →</Link>}
        </span>
      </div>
      {thumb && (
        <Link href={href} className="b2-clip-thumb" tabIndex={-1} aria-hidden="true">
          <img src={a.thumb.src} alt="" loading="lazy" decoding="async" />
        </Link>
      )}
    </article>
  );
}

// 보도국 안의 입장 기록 (NEWSROOM POLITICS) — 사람을 정의하는 정보가 아니라 그날의 기록 하나
// inferred: 원자료에 개별 인물이 없어 보간한 구성은 표시를 붙인다
export function StanceTrack({track, compact = false}) {
  return (
    <ol className={'b2-stance' + (compact ? ' compact' : '')}>
      {track.map(({day, group}) => (
        <li key={day.id} className={group ? 'has tone-' + (group.tone || 'c') : 'none'}>
          <small>{day.label}</small>
          <b>{group ? group.name : '—'}{group?.inferred && <i className="b2-inferred" title="원자료에 개별 인물이 적혀 있지 않아 보간한 구성">*</i>}</b>
        </li>
      ))}
    </ol>
  );
}
