import Link from 'next/link';
import {notFound} from 'next/navigation';
import {archive} from '@/data/bongnudo2/meta';
import {
  articles,
  archiveIndex,
  getArticle,
  getPerson,
  relatedArticles,
  adjacentArticles,
  events,
  reporterKey,
  reporterHref,
} from '@/data/bongnudo2';
import ArticleContent from '../../_components/ArticleContent';
import ToTop from '../../_components/ToTop';
import {Clipping, fmtDateTime, BbsLogo} from '../../_components/ui';

// 원본 BBS ID 가 있으면 그 ID 를 그대로 route 로 쓴다 (/bongnudo-2/archive/858)
export const dynamicParams = false;
export function generateStaticParams() {
  return articles.map((a) => ({id: a.id}));
}

export async function generateMetadata({params}) {
  const {id} = await params;
  const a = getArticle(decodeURIComponent(id));
  return {title: a ? `${a.title} — BBS ARCHIVE` : 'BBS ARCHIVE'};
}

function ClipList({title, list, entry}) {
  if (!list.length) return null;
  return (
    <section>
      <h2>{title}</h2>
      <ol className="b2-clips compact">{list.map((x) => <li key={x.id}><Clipping a={entry(x)} compact /></li>)}</ol>
    </section>
  );
}

export default async function ArticlePage({params}) {
  const {id} = await params;
  const a = getArticle(decodeURIComponent(id));
  if (!a) notFound();
  const index = archiveIndex();
  const entry = (x) => index.find((i) => i.id === x.id);
  const rel = relatedArticles(a);
  const {prev, next} = adjacentArticles(a);
  const people = a.relatedPeople.map(getPerson).filter(Boolean);
  const evs = events.filter((e) => a.relatedEvents.includes(e.id) || e.articleIds?.map(String).includes(a.id));
  const rHref = reporterHref(reporterKey(a));

  return (
    <main className="b2-main b2-article">
      <Link className="b2-crumb" href="/bongnudo-2/archive">← BBS NEWS ARCHIVE</Link>

      <article className="b2-article-paper">
        <header>
          <p className="b2-article-source">
            <BbsLogo className="is-source" />
            {archive.station}
            {a.originalId != null && <span>No. {a.originalId}</span>}
          </p>
          {(a.category || a.day) && (
            <p className="b2-article-meta">{[a.category, a.day ? `DAY ${String(a.day).padStart(2, '0')}` : null].filter(Boolean).join(' · ')}</p>
          )}
          {a.isShinIbiArticle && <p className="b2-shin-mark big">SHIN IBI REPORT</p>}
          <h1>{a.title}</h1>
          <p className="b2-article-dateline">
            {a.publishedAt && <time dateTime={a.publishedAt}>{fmtDateTime(a.publishedAt)}</time>}
            {a.author.name && (rHref ? <Link href={rHref}>BY {a.author.name}</Link> : <span>BY {a.author.name}</span>)}
          </p>
        </header>

        <ArticleContent blocks={a.content} />

        {(a.likes != null || a.dislikes != null) && (
          <p className="b2-reactions">{a.likes != null && <span>추천 {a.likes}</span>}{a.dislikes != null && <span>비추천 {a.dislikes}</span>}</p>
        )}
        {a.tags.length > 0 && <ul className="b2-tags">{a.tags.map((t) => <li key={t}>#{t}</li>)}</ul>}
      </article>

      {/* 원문과 분리된 전시 해설 */}
      {(a.archiveNote || evs.length > 0) && (
        <aside className="b2-archive-note">
          <p className="b2-kicker">ARCHIVE NOTE</p>
          {a.archiveNote && <p>{a.archiveNote}</p>}
          {evs.length > 0 && (
            <ul>{evs.map((e) => <li key={e.id}><Link href={`/bongnudo-2/timeline#day-${e.day}`}>DAY {e.day} · {e.title}</Link></li>)}</ul>
          )}
        </aside>
      )}

      {(prev || next) && (
        <nav className="b2-adjacent" aria-label="이전 기사와 다음 기사">
          {prev ? (
            <Link href={`/bongnudo-2/archive/${encodeURIComponent(prev.id)}`} className="prev"><small>← PREVIOUS</small><b>{prev.title}</b></Link>
          ) : <span />}
          {next ? (
            <Link href={`/bongnudo-2/archive/${encodeURIComponent(next.id)}`} className="next"><small>NEXT →</small><b>{next.title}</b></Link>
          ) : <span />}
        </nav>
      )}

      <div className="b2-article-related">
        {rel.moreFromReporter.length > 0 && (
          <section className="b2-more-from">
            <h2>MORE FROM {a.author.name}</h2>
            <ol className="b2-clips compact">{rel.moreFromReporter.map((x) => <li key={x.id}><Clipping a={entry(x)} compact /></li>)}</ol>
            {rHref && <Link className="b2-textlink" href={rHref}>{a.author.name} 기자의 기사 모두 보기 →</Link>}
          </section>
        )}
        <ClipList title="SAME DAY" list={rel.sameDay} entry={entry} />
        <ClipList title="RELATED EVENT" list={rel.byEvent} entry={entry} />
        {people.length > 0 && (
          <section>
            <h2>RELATED PEOPLE</h2>
            <ul className="b2-chips">{people.map((p) => <li key={p.id}><Link href={`/bongnudo-2/people#${p.id}`}>{p.name}</Link></li>)}</ul>
          </section>
        )}
        <ClipList title="RELATED ARTICLES" list={rel.byPeople} entry={entry} />
      </div>

      <p className="b2-provenance">
        SOURCE · {a.source.service}
        {a.source.originalId != null && ` · No. ${a.source.originalId}`}
        {a.source.capturedAt && ` · ARCHIVED ${a.source.capturedAt.slice(0, 10).replace(/-/g, '.')}`}
        {a.source.originalUrl && <> · <a href={a.source.originalUrl} target="_blank" rel="noreferrer">원본 링크</a></>}
      </p>
      <ToTop />
    </main>
  );
}
