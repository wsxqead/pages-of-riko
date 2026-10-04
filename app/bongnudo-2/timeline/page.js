import Link from 'next/link';
import {archive, reporter} from '@/data/bongnudo2/meta';
import {politicsDays, seatOf} from '@/data/bongnudo2/politics';
import {articles, archiveIndex, events, newsroomStories, getEventsByDay, getArticlesByDay, getStoriesByDay, dayStats, getPerson} from '@/data/bongnudo2';
import {Clipping, personPath} from '../_components/ui';
import {StoryCard} from '../_components/newsroom';

export const metadata = {title: 'PRESS TIMELINE — 봉누도 2'};

const DAY_MS = 86400000;
const dateOf = (day) => {
  const s = archive.serverPeriod.start;
  if (!s) return null;
  return new Date(new Date(s).getTime() + (day - 1) * DAY_MS).toISOString().slice(0, 10).replace(/-/g, '.');
};

// DAILY EDITION: 그날의 장면 · 취재 · 사건 · 기사가 먼저, 보도국 안의 입장은 그날의 여러 기록 중 하나로 맨 아래.
function editions() {
  const covered = new Set(politicsDays.flatMap((d) => d.days));
  const extra = [
    ...new Set([...articles.map((a) => a.day), ...events.map((e) => e.day), ...newsroomStories.map((s) => s.day)].filter((d) => d && !covered.has(d))),
  ];
  const list = [
    ...politicsDays.map((d) => ({id: d.id, label: d.label, days: d.days, untilEnd: d.untilEnd, politics: d})),
    ...extra.map((d) => ({id: `day${String(d).padStart(2, '0')}`, label: `DAY ${String(d).padStart(2, '0')}`, days: [d], politics: null})),
  ];
  return list.sort((a, b) => a.days[0] - b.days[0]);
}

export default function TimelinePage() {
  const index = archiveIndex();
  const entry = (a) => index.find((x) => x.id === a.id);
  return (
    <main className="b2-main b2-timeline">
      <header className="b2-page-head">
        <p className="b2-kicker">PRESS TIMELINE</p>
        <h1>날마다 발행된 판</h1>
        <p className="b2-page-lead">하루를 한 판의 신문처럼 묶었습니다. 그날 보도국에서 있었던 장면과 취재, 실린 기사가 먼저 놓이고, 보도국 안의 입장 기록은 맨 아래에 함께 남습니다.</p>
      </header>

      <ol className="b2-editions">
        {editions().map((ed) => {
          const stats = ed.days.reduce((s, d) => {
            const x = dayStats(d);
            return {articles: s.articles + x.articles, shinIbi: s.shinIbi + x.shinIbi, photos: s.photos + x.photos, videos: s.videos + x.videos};
          }, {articles: 0, shinIbi: 0, photos: 0, videos: 0});
          const evs = ed.days.flatMap((d) => getEventsByDay(d));
          const stories = ed.days.flatMap((d) => getStoriesByDay(d));
          const reports = stories.filter((s) => s.type === 'reporting');
          const scenes = stories.filter((s) => s.type !== 'reporting');
          const dayArticles = ed.days.flatMap((d) => getArticlesByDay(d));
          const shinArticles = dayArticles.filter((a) => a.isShinIbiArticle);
          const shown = (shinArticles.length ? shinArticles : dayArticles).slice(0, 5);
          const seat = ed.politics && seatOf(reporter.id, ed.politics);
          const date = dateOf(ed.days[0]);
          return (
            <li key={ed.id} id={ed.days.map((d) => `day-${d}`)[0]} className="b2-edition-day">
              <header>
                <h2>{ed.label}</h2>
                <p>{date ? `${date} · ` : ''}{ed.untilEnd ? 'FINAL EDITIONS' : 'DAILY EDITION'}</p>
              </header>
              {(scenes.length > 0 || reports.length > 0 || evs.length > 0 || stats.articles > 0) && (
                <div className="b2-edition-body">
                  {scenes.length > 0 && (
                    <section>
                      <h3>NEWSROOM STORIES</h3>
                      <div className="b2-stories">{scenes.map((s) => <StoryCard key={s.id} s={s} compact />)}</div>
                    </section>
                  )}
                  {reports.length > 0 && (
                    <section>
                      <h3>REPORTS</h3>
                      <div className="b2-stories">{reports.map((s) => <StoryCard key={s.id} s={s} compact />)}</div>
                    </section>
                  )}
                  {evs.length > 0 && (
                    <section className="b2-ed-events">
                      <h3>MAJOR EVENTS</h3>
                      <ul className="b2-event-list">{evs.map((e) => <li key={e.id}><b>{e.title}</b>{e.summary && <p>{e.summary}</p>}</li>)}</ul>
                    </section>
                  )}
                  {stats.articles > 0 && (
                    <section className="b2-ed-articles">
                      <h3>ARTICLES</h3>
                      <p className="b2-ed-stats">
                        <span>ARTICLES · {stats.articles}</span>
                        {stats.shinIbi > 0 && <span>SHIN IBI · {stats.shinIbi}</span>}
                        {stats.photos > 0 && <span>PHOTOS · {stats.photos}</span>}
                        {stats.videos > 0 && <span>VIDEOS · {stats.videos}</span>}
                      </p>
                      <ol className="b2-clips compact">{shown.map((a) => <li key={a.id}><Clipping a={entry(a)} compact /></li>)}</ol>
                      <Link className="b2-textlink" href={`/bongnudo-2/archive?day=${ed.days[0]}`}>이날의 기사 →</Link>
                    </section>
                  )}
                </div>
              )}
              {ed.politics && (
                <footer className="b2-ed-position">
                  <h3>NEWSROOM POSITION</h3>
                  {ed.politics.caption && <p className="cap">{ed.politics.caption}</p>}
                  <ul>
                    {ed.politics.groups.map((g) => (
                      <li key={g.id} className={'tone-' + (g.tone || 'c')}>
                        <b>{g.name}{g.inferred && <i className="b2-inferred" title="원자료에 개별 인물이 적혀 있지 않아 보간한 구성">*</i>}</b>
                        <span>
                          {ed.politics.scope === 'whole'
                            ? `보도국 ${g.members.length}명`
                            : g.members.map((id, i) => (
                                <span key={id}>
                                  {i > 0 && ' · '}
                                  <Link href={personPath(id)} className={id === reporter.id ? 'is-shin' : ''}>{getPerson(id)?.name}</Link>
                                </span>
                              ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {seat && ed.politics.scope === 'faction' && <p className="shin">신이비 · {seat.name}</p>}
                  <Link className="b2-textlink" href={`/bongnudo-2/newsroom#${ed.politics.id}`}>보도국 안의 입장 보기 →</Link>
                </footer>
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
