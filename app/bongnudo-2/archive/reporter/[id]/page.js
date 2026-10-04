import {Suspense} from 'react';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {archive, reporter as shin, ARCHIVE_PAGE_SIZE} from '@/data/bongnudo2/meta';
import {archiveIndex, archiveFacets, getReporters, reporterStats, getArticlesByReporter, getStoriesByPerson, personHref} from '@/data/bongnudo2';
import ArchiveBrowser from '../../../_components/ArchiveBrowser';
import ReporterIndex from '../../../_components/ReporterIndex';
import {fmtDate} from '../../../_components/ui';

// 기자별 Archive — 그 기자가 3주 동안 남긴 기사를 이어서 읽는다. 기사 데이터는 일반 Archive 와 같은 것(복사본 없음).
export const dynamicParams = false;
export function generateStaticParams() {
  return getReporters().map((r) => ({id: r.key}));
}

export async function generateMetadata({params}) {
  const {id} = await params;
  const s = reporterStats(decodeURIComponent(id));
  return {title: s ? `${s.name} 기자 — BBS NEWS ARCHIVE` : 'BBS NEWS ARCHIVE'};
}

export default async function ReporterArchivePage({params}) {
  const {id} = await params;
  const key = decodeURIComponent(id);
  const s = reporterStats(key);
  if (!s) notFound();
  const isShin = key === shin.id;
  const index = archiveIndex().filter((a) => a.reporterKey === key); // 이 기자의 기사만 내려보낸다
  const profile = personHref(s.person?.id);
  const stories = s.person ? getStoriesByPerson(s.person.id) : [];

  return (
    <main className="b2-main b2-archive b2-reporter-archive">
      <Link className="b2-crumb" href="/bongnudo-2/archive">← BBS NEWS ARCHIVE</Link>

      <header className="b2-reporter-head">
        <div>
          <p className="b2-kicker">{isShin ? 'SHIN IBI COLLECTION · ' : ''}REPORTER</p>
          <h1>{s.name}{isShin && <small>{shin.en}</small>}</h1>
          <p className="b2-reporter-role">
            <span>{archive.station} 보도국</span>
            {s.person?.streamer && <span>{s.person.streamer}</span>}
            {s.person?.finalPosition && <small>FINAL POSITION · {s.person.finalPosition}</small>}
          </p>
          <p className="b2-reporter-lead">{s.name} 기자가 봉누도방송국 BBS에 남긴 기사.</p>
          {profile && (
            <p className="b2-reporter-links">
              <Link className="b2-textlink" href={profile}>PEOPLE · {s.name}의 기록 →</Link>
              {stories.length > 0 && <Link className="b2-textlink" href={`${profile}#${stories.some((x) => x.type !== 'reporting') ? 'stories' : 'reporting'}`}>NEWSROOM STORIES {stories.length} →</Link>}
            </p>
          )}
        </div>
        <dl className="b2-reporter-figures">
          <div><dt>ARTICLES</dt><dd>{s.articles}</dd></div>
          {s.photoArticles > 0 && <div><dt>WITH PHOTOS</dt><dd>{s.photoArticles}</dd></div>}
          {s.videoArticles > 0 && <div><dt>WITH VIDEO</dt><dd>{s.videoArticles}</dd></div>}
          {s.firstReport && <div><dt>FIRST REPORT</dt><dd className="date">{fmtDate(s.firstReport)}</dd></div>}
          {s.lastReport && <div><dt>LAST REPORT</dt><dd className="date">{fmtDate(s.lastReport)}</dd></div>}
          {s.likes != null && <div><dt>추천 합계</dt><dd>{s.likes}</dd></div>}
        </dl>
        {s.topCategories.length > 0 && (
          <p className="b2-reporter-cats">
            <small>자주 쓴 분류</small>
            {s.topCategories.map((c) => <span key={c.category}>{c.category} {c.count}</span>)}
          </p>
        )}
      </header>

      <Suspense fallback={null}>
        <ArchiveBrowser
          index={index}
          facets={archiveFacets(getArticlesByReporter(key))}
          pageSize={ARCHIVE_PAGE_SIZE}
          lockedReporter={key}
        />
      </Suspense>

      <ReporterIndex reporters={getReporters()} current={key} />
    </main>
  );
}
