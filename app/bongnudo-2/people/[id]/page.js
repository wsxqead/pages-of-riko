import Link from 'next/link';
import {notFound} from 'next/navigation';
import {stanceTrack} from '@/data/bongnudo2/politics';
import {
  people,
  getPerson,
  personStats,
  personMedia,
  archiveIndex,
  getArticlesByReporter,
  getArticlesByPerson,
  getStoriesByPerson,
  between,
  withNewsroom,
  getPersonRollingPaper,
  getPersonEvents,
  reporterHref,
} from '@/data/bongnudo2';
import {Portrait, StoryCard, Between, SourceTag, PersonChip} from '../../_components/newsroom';
import {Clipping, StanceTrack, fmtDate} from '../../_components/ui';

const SHIN = 'shin-ibi';
const pad = (n) => String(n).padStart(2, '0');

export const dynamicParams = false;
export function generateStaticParams() {
  return people.map((p) => ({id: p.id}));
}
export async function generateMetadata({params}) {
  const {id} = await params;
  const p = getPerson(decodeURIComponent(id));
  return {title: p ? `${p.name} — PEOPLE · 봉누도 2` : 'PEOPLE — 봉누도 2'};
}

// 한 사람 = 하나의 작은 Archive: PROFILE → REPORTING → NEWSROOM STORIES → WITH SHIN IBI → ARTICLES → PHOTOS/VIDEOS → LETTER
// 자료가 있는 영역만 보인다. 직급·파벌은 맨 아래 작은 기록으로.
export default async function PersonPage({params}) {
  const {id: raw} = await params;
  const id = decodeURIComponent(raw);
  const p = getPerson(id);
  if (!p) notFound();
  const isShin = id === SHIN;
  const s = personStats(id);
  const index = new Map(archiveIndex().map((a) => [a.id, a]));
  const written = getArticlesByReporter(id).map((a) => index.get(a.id));
  const mentioned = getArticlesByPerson(id).filter((a) => a.authorId !== id).map((a) => index.get(a.id));
  const reportingStories = getStoriesByPerson(id, ['reporting']);
  const otherStories = getStoriesByPerson(id).filter((x) => x.type !== 'reporting');
  const withShin = isShin ? null : between(id, SHIN);
  const colleagues = withNewsroom(id).filter((x) => isShin || x.person.id !== SHIN);
  const media = personMedia(id);
  const letter = getPersonRollingPaper(id);
  const events = getPersonEvents(id);
  const track = stanceTrack(id);
  const hasTrack = track.some((t) => t.group && !t.group.inferred);
  const prof = p.profile;
  const hasProfile = prof.summary || prof.personality || prof.reportingStyle || prof.newsroomRole || prof.notableTraits.length || p.notes.length;
  const hasReporting = s.written > 0 || reportingStories.length > 0 || prof.reportingStyle;

  const newsroom = people.filter((x) => x.group === 'newsroom');
  const at = newsroom.findIndex((x) => x.id === id);
  const prev = at > 0 ? newsroom[at - 1] : null;
  const next = at >= 0 && at < newsroom.length - 1 ? newsroom[at + 1] : null;

  const toc = [
    hasProfile && ['profile', 'PROFILE'],
    hasReporting && ['reporting', 'REPORTING'],
    otherStories.length > 0 && ['stories', 'NEWSROOM STORIES'],
    withShin && (withShin.relationships.length || withShin.stories.length) && ['with-shin', 'WITH SHIN IBI'],
    colleagues.length > 0 && ['newsroom', isShin ? 'WITH THE NEWSROOM' : 'RELATIONSHIPS'],
    (written.length > 0 || mentioned.length > 0) && ['articles', 'ARTICLES'],
    (media.photos.length > 0 || media.videos > 0) && ['media', 'PHOTOS / VIDEOS'],
    letter && ['letter', 'LETTER'],
  ].filter(Boolean);

  return (
    <main className="b2-main b2-person">
      <Link className="b2-crumb" href="/bongnudo-2/people">← PEOPLE</Link>

      <header className={'b2-person-head' + (isShin ? ' is-shin' : '')}>
        <Portrait p={p} size="lg" />
        <div>
          <p className="b2-kicker">{p.core ? 'THE BBS NEWSROOM · 보도국 기자' : 'THE BBS NEWSROOM · 보도국 기록에 등장하는 사람'}</p>
          <h1>
            {p.name}
            {isShin && <i className="b2-press">PRESS</i>}
          </h1>
          {p.streamer && <p className="b2-person-streamer">{p.streamer}</p>}
          {prof.tagline && <p className="b2-person-tagline">“{prof.tagline}”</p>}
          {p.finalPosition && (
            <p className="b2-person-pos">
              FINAL POSITION · {p.finalPosition}
              <small>서버가 끝날 무렵의 직급</small>
            </p>
          )}
          {isShin && <Link className="b2-textlink" href="/bongnudo-2/reporter">THE REPORTER · 신이비의 3주 →</Link>}
        </div>
      </header>

      {toc.length > 1 && (
        <nav className="b2-nr-toc" aria-label={`${p.name} 기록 차례`}>
          {toc.map(([h, label]) => (
            <a key={h} href={`#${h}`}>{label}</a>
          ))}
        </nav>
      )}

      {hasProfile && (
        <section id="profile" className="b2-person-sec">
          <h2>PROFILE</h2>
          {prof.summary && <p className="b2-person-summary">{prof.summary}</p>}
          <dl className="b2-person-dl">
            {prof.newsroomRole && <div><dt>보도국에서</dt><dd>{prof.newsroomRole}</dd></div>}
            {prof.personality && <div><dt>사람</dt><dd>{prof.personality}</dd></div>}
          </dl>
          {prof.notableTraits.length > 0 && <ul className="b2-notes">{prof.notableTraits.map((t) => <li key={t}>{t}</li>)}</ul>}
          {p.notes.length > 0 && <ul className="b2-notes">{p.notes.map((n) => <li key={n}>{n}</li>)}</ul>}
          <SourceTag item={prof.source} />
        </section>
      )}

      {hasReporting && (
        <section id="reporting" className="b2-person-sec">
          <h2>REPORTING</h2>
          {s.written > 0 && (
            <>
              <dl className="b2-reporter-figures">
                <div><dt>ARTICLES</dt><dd>{s.written}</dd></div>
                {s.photoArticles > 0 && <div><dt>PHOTO REPORTS</dt><dd>{s.photoArticles}</dd></div>}
                {s.videoArticles > 0 && <div><dt>VIDEO REPORTS</dt><dd>{s.videoArticles}</dd></div>}
                {s.activeDays.length > 0 && <div><dt>ACTIVE DAYS</dt><dd>{s.activeDays.length}</dd></div>}
                {s.firstReport && <div><dt>FIRST REPORT</dt><dd className="date">{fmtDate(s.firstReport)}</dd></div>}
                {s.lastReport && <div><dt>LAST REPORT</dt><dd className="date">{fmtDate(s.lastReport)}</dd></div>}
              </dl>
              {s.categories.length > 0 && (
                <p className="b2-reporter-cats">
                  <small>자주 쓴 분류</small>
                  {s.categories.map((c) => <span key={c.category}>{c.category} {c.count}</span>)}
                </p>
              )}
              {s.frequentPeople.length > 0 && (
                <p className="b2-person-met">
                  <small>기사에 자주 함께 등장한 사람</small>
                  {s.frequentPeople.map((f) => (
                    <span key={f.person.id}><PersonChip id={f.person.id} /> {f.count}</span>
                  ))}
                </p>
              )}
              {s.activeDays.length > 0 && (
                <p className="b2-person-days">
                  <small>기사를 쓴 날</small>
                  {s.activeDays.map((d) => <Link key={d} href={`/bongnudo-2/timeline#day-${d}`}>DAY {pad(d)}</Link>)}
                </p>
              )}
              <Link className="b2-view-articles" href={reporterHref(id)}>{p.name} 기자의 기사 {s.written}건 →</Link>
            </>
          )}
          {prof.reportingStyle && <p className="b2-person-summary">{prof.reportingStyle}</p>}
          {reportingStories.length > 0 && (
            <div className="b2-stories">
              {reportingStories.map((x) => <StoryCard key={x.id} s={x} compact />)}
            </div>
          )}
        </section>
      )}

      {otherStories.length > 0 && (
        <section id="stories" className="b2-person-sec">
          <h2>NEWSROOM STORIES</h2>
          <div className="b2-stories">
            {otherStories.map((x) => <StoryCard key={x.id} s={x} compact />)}
          </div>
        </section>
      )}

      {withShin && (withShin.relationships.length > 0 || withShin.stories.length > 0) && (
        <section id="with-shin" className="b2-person-sec">
          <h2>WITH SHIN IBI</h2>
          <ul className="b2-betweens">
            <Between x={withShin} />
          </ul>
        </section>
      )}

      {colleagues.length > 0 && (
        <section id="newsroom" className="b2-person-sec">
          <h2>{isShin ? 'WITH THE NEWSROOM' : 'RELATIONSHIPS'}</h2>
          {isShin && <p className="b2-note">보도국 동료들과 남은 기록. 같은 파벌이었다는 이유만으로 가까웠다고 적지 않습니다.</p>}
          <ul className="b2-betweens">
            {colleagues.map((x) => <Between key={x.person.id} x={x} />)}
          </ul>
        </section>
      )}

      {events.length > 0 && (
        <section className="b2-person-sec">
          <h2>EVENTS</h2>
          <ul className="b2-event-list">
            {events.map((e) => (
              <li key={e.id}>{e.day && <small>DAY {pad(e.day)}</small>}<b>{e.title}</b>{e.summary && <p>{e.summary}</p>}</li>
            ))}
          </ul>
        </section>
      )}

      {(written.length > 0 || mentioned.length > 0) && (
        <section id="articles" className="b2-person-sec">
          <h2>ARTICLES</h2>
          {written.length > 0 && (
            <>
              <h3 className="b2-person-sub">{p.name} 기자가 쓴 기사 · {written.length}</h3>
              <ol className="b2-clips compact">{written.slice(0, 8).map((a) => <li key={a.id}><Clipping a={a} compact hideReporter /></li>)}</ol>
              {written.length > 8 && <Link className="b2-textlink" href={reporterHref(id)}>전체 {written.length}건 보기 →</Link>}
            </>
          )}
          {mentioned.length > 0 && (
            <>
              <h3 className="b2-person-sub">기사 속 {p.name} · {mentioned.length}</h3>
              <ol className="b2-clips compact">{mentioned.slice(0, 6).map((a) => <li key={a.id}><Clipping a={a} compact /></li>)}</ol>
            </>
          )}
        </section>
      )}

      {(media.photos.length > 0 || media.videos > 0) && (
        <section id="media" className="b2-person-sec">
          <h2>PHOTOS / VIDEOS</h2>
          {media.photos.length > 0 && (
            <ul className="b2-person-photos">
              {media.photos.map((im, i) => (
                <li key={im.src + i}>
                  <Link href={`/bongnudo-2/archive/${encodeURIComponent(im.articleId)}`} title={im.articleTitle}>
                    <img src={im.src} alt={im.alt || im.caption || im.articleTitle} loading="lazy" decoding="async" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="b2-ed-stats">
            {s.photoArticles > 0 && <span>사진이 있는 기사 {s.photoArticles}</span>}
            {media.videos > 0 && <span>영상 {media.videos}</span>}
          </p>
        </section>
      )}

      {letter && (
        <section id="letter" className="b2-person-sec">
          <h2>LETTER</h2>
          <Link className="b2-letter-link" href={`/bongnudo-2/rolling-paper#${id}`}>
            <small>TO SHIN IBI</small>
            {p.name}의 롤링페이퍼 읽기 →
          </Link>
        </section>
      )}

      {hasTrack && (
        <section className="b2-person-sec b2-person-inside">
          <h2>INSIDE THE NEWSROOM</h2>
          <p className="b2-note">보도국 안에서 기사 방향이 갈렸던 날들의 입장 기록. 이 사람을 설명하는 여러 기록 중 하나입니다.</p>
          <StanceTrack track={track} compact />
          <Link className="b2-textlink" href="/bongnudo-2/newsroom#politics">POSITIONS &amp; CONFLICTS →</Link>
        </section>
      )}

      <nav className="b2-adjacent b2-person-nav" aria-label="다른 기자">
        {prev ? (
          <Link href={`/bongnudo-2/people/${prev.id}`} className="prev"><small>← PREVIOUS</small><b>{prev.name}</b></Link>
        ) : <span />}
        {next ? (
          <Link href={`/bongnudo-2/people/${next.id}`} className="next"><small>NEXT →</small><b>{next.name}</b></Link>
        ) : <span />}
      </nav>
    </main>
  );
}
