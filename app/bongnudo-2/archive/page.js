import {Suspense} from 'react';
import {archive, ARCHIVE_PAGE_SIZE} from '@/data/bongnudo2/meta';
import {articles, archiveIndex, archiveFacets, getReporters} from '@/data/bongnudo2';
import ReporterIndex from '../_components/ReporterIndex';
import {BbsLogo} from '../_components/ui';
import ArchiveBrowser from '../_components/ArchiveBrowser';

export const metadata = {title: 'BBS NEWS ARCHIVE — 봉누도 2'};

export default function ArchivePage() {
  const count = articles.length;
  return (
    <main className="b2-main b2-archive">
      <header className="b2-archive-head">
        <div className="b2-archive-brand">
          <BbsLogo className="is-archive" />
          <div>
            <p className="b2-kicker">{archive.sourceName}</p>
            <h1>BBS NEWS ARCHIVE</h1>
          </div>
        </div>
        <div className="b2-archive-figures">
          {count > 0 && (
            <p><b>{count}</b><span>ARTICLES PRESERVED</span></p>
          )}
          <p className="source"><b>{archive.totalExpectedArticles}</b><span>SOURCE RECORD</span></p>
        </div>
        <p className="b2-archive-lead">
          봉누도방송국 BBS에 실렸던 기사들. 원본 사이트가 사라져도 읽을 수 있도록 제목, 본문, 기자, 날짜, 사진과 영상을 원문 그대로 보관합니다.
        </p>
      </header>

      <ReporterIndex reporters={getReporters()} />

      {count > 0 ? (
        <Suspense fallback={null}>
          <ArchiveBrowser index={archiveIndex()} facets={archiveFacets()} pageSize={ARCHIVE_PAGE_SIZE} />
        </Suspense>
      ) : (
        <section className="b2-stacks" aria-label="서고">
          <div className="b2-boxes" aria-hidden="true">
            {Array.from({length: 7}).map((_, i) => (
              <span key={i} className="b2-box-shelf"><i>BBS</i></span>
            ))}
          </div>
          <p>서버가 닫힌 뒤에도 남겨 두기 위해, 원본 기사를 한 건씩 옮겨 담고 있는 서고입니다.</p>
        </section>
      )}
    </main>
  );
}
