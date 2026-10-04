import Link from 'next/link';
import {reporterPath} from './ui';

// BY REPORTER — 보도국 기자 명부(byline index). 기사를 쓴 기자만, 실제 기사 수와 함께 (0 은 표시하지 않는다)
export default function ReporterIndex({reporters, current = null}) {
  if (!reporters.length) return null;
  return (
    <nav className="b2-staffbox" aria-label="기자별 기사">
      <header>
        <p className="b2-kicker">BY REPORTER</p>
        <h2>기자별로 읽기</h2>
      </header>
      <ol>
        {reporters.map((r) => (
          <li key={r.key} className={(r.key === 'shin-ibi' ? 'is-shin ' : '') + (r.key === current ? 'on' : '')}>
            <Link href={reporterPath(r.key)} aria-current={r.key === current ? 'page' : undefined}>
              <b>
                {r.name}
                {r.key === 'shin-ibi' && <i className="b2-press">PRESS</i>}
              </b>
              <span className="b2-staff-counts">
                <small>ARTICLES {r.articles}</small>
                {r.photoArticles > 0 && <small>PHOTO {r.photoArticles}</small>}
                {r.videoArticles > 0 && <small>VIDEO {r.videoArticles}</small>}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
