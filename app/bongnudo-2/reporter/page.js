import Link from 'next/link';
import {archive, reporter} from '@/data/bongnudo2/meta';
import {stanceTrack} from '@/data/bongnudo2/politics';
import {
  archiveIndex,
  getShinIbiArticles,
  firstShinIbiArticle,
  events,
  getLetters,
  getPerson,
  getCoreNewsroom,
  getStoriesByPerson,
  withNewsroom,
  personStats,
  reporterHref,
} from '@/data/bongnudo2';
import {Clipping, StanceTrack, fmtDate} from '../_components/ui';
import {StoryCard, Between, PersonChip} from '../_components/newsroom';

export const metadata = {title: 'THE REPORTER · 신이비 — 봉누도 2'};

const pad = (n) => String(n).padStart(2, '0');

// 신이비의 3주 — 보도국에 들어와, 도시를 취재하고, 사람을 만나고, 보도국에서 생활하고,
// 기사 방향을 선택하고, 종군기자로 현장에 들어가고, 마지막 날을 보내고, 편지를 받는다.
// 파벌 변화는 05 안의 작은 기록. 자료가 없는 장은 숨기고 번호는 이어서 매긴다.
export default function ReporterPage() {
  const me = getPerson(reporter.id);
  const index = archiveIndex();
  const entry = (a) => index.find((x) => x.id === a.id);
  const own = getShinIbiArticles();
  const first = firstShinIbiArticle();
  const last = own[0] || null;
  const s = personStats(reporter.id);
  const featured = own.filter((a) => a.featured);
  const representative = [...featured, ...own.filter((a) => !a.featured)].slice(0, 6);

  const stories = getStoriesByPerson(reporter.id);
  const cases = stories.filter((x) => x.steps.length);
  const war = stories.filter((x) => x.day === 14 && x.type === 'reporting' && x.people.length > 1);
  const warIds = new Set(war.map((x) => x.id));
  const together = stories.filter((x) => x.type === 'reporting' && !x.steps.length && x.people.length > 1 && !warIds.has(x.id));
  const life = stories.filter((x) => ['daily-life', 'news', 'relationship', 'incident'].includes(x.type));
  const choices = stories.filter((x) => x.type === 'conflict');
  const farewell = stories.filter((x) => x.type === 'farewell');
  const mine = (t) => events.filter((e) => e.people?.includes(reporter.id) && e.type === t && e.verified !== false);
  const field = mine('field');
  const interviews = mine('interview');
  const colleagues = withNewsroom(reporter.id);
  const colleaguesCount = getCoreNewsroom().filter((p) => p.id !== reporter.id).length;
  const city = s.frequentPeople.filter((f) => f.person.group !== 'newsroom');
  const track = stanceTrack(reporter.id);
  const letters = getLetters();

  const chapters = [
    {
      id: 'joining',
      title: 'JOINING THE NEWSROOM',
      ko: '보도국에 들어오다',
      show: true,
      body: (
        <>
          <p className="b2-chapter-lead">{archive.station} 보도국에 {reporter.role}로 들어왔다.</p>
          <p className="b2-chapter-sub">함께 일한 기자 {colleaguesCount}명 · <Link href="/bongnudo-2/newsroom#reporters">THE BBS NEWSROOM →</Link></p>
          {me?.career.promotions.length > 0 && (
            <ol className="b2-career">
              {me.career.promotions.map((c) => <li key={c.day + c.position}><small>DAY {pad(c.day)}</small>{c.position}</li>)}
            </ol>
          )}
          {first && (
            <div className="b2-chapter-block">
              <p className="b2-kicker">FIRST REPORT</p>
              <Clipping a={entry(first)} />
            </div>
          )}
        </>
      ),
    },
    {
      id: 'reporting',
      title: 'REPORTING THE CITY',
      ko: '도시를 취재하다',
      show: own.length > 0 || cases.length > 0 || together.length > 0 || field.length > 0,
      body: (
        <>
          {own.length > 0 && (
            <>
              <dl className="b2-reporter-figures">
                <div><dt>ARTICLES WRITTEN</dt><dd>{own.length}</dd></div>
                {s.photoArticles > 0 && <div><dt>PHOTO REPORTS</dt><dd>{s.photoArticles}</dd></div>}
                {s.videoArticles > 0 && <div><dt>VIDEO REPORTS</dt><dd>{s.videoArticles}</dd></div>}
                {s.firstReport && <div><dt>FIRST REPORT</dt><dd className="date">{fmtDate(s.firstReport)}</dd></div>}
                {s.lastReport && <div><dt>LAST REPORT</dt><dd className="date">{fmtDate(s.lastReport)}</dd></div>}
              </dl>
              <div className="b2-chapter-block">
                <p className="b2-kicker">{featured.length ? 'SELECTED REPORTS' : 'REPORTS'}</p>
                <ol className="b2-clips">{representative.map((a) => <li key={a.id}><Clipping a={entry(a)} hideReporter /></li>)}</ol>
                <Link className="b2-view-articles" href={reporterHref(reporter.id)}>SHIN IBI COLLECTION · {own.length} ARTICLES →</Link>
              </div>
            </>
          )}
          {cases.length > 0 && (
            <div className="b2-chapter-block">
              <p className="b2-kicker">REPORTING CASE</p>
              <div className="b2-stories">{cases.map((x) => <StoryCard key={x.id} s={x} compact hidePeople />)}</div>
            </div>
          )}
          {together.length > 0 && (
            <div className="b2-chapter-block">
              <p className="b2-kicker">REPORTING TOGETHER</p>
              <div className="b2-stories">{together.map((x) => <StoryCard key={x.id} s={x} compact />)}</div>
            </div>
          )}
          {field.length > 0 && (
            <div className="b2-chapter-block">
              <p className="b2-kicker">FIELD REPORTING</p>
              <ul className="b2-event-list">{field.map((e) => <li key={e.id}>{e.day && <small>DAY {pad(e.day)}</small>}<b>{e.title}</b>{e.summary && <p>{e.summary}</p>}</li>)}</ul>
            </div>
          )}
        </>
      ),
    },
    {
      id: 'people',
      title: 'THE PEOPLE SHE MET',
      ko: '만난 사람들',
      show: colleagues.length > 0 || city.length > 0 || interviews.length > 0,
      body: (
        <>
          {colleagues.length > 0 && (
            <div className="b2-chapter-block">
              <p className="b2-kicker">NEWSROOM</p>
              <ul className="b2-betweens">{colleagues.map((x) => <Between key={x.person.id} x={x} />)}</ul>
            </div>
          )}
          {city.length > 0 && (
            <div className="b2-chapter-block">
              <p className="b2-kicker">PEOPLE IN THE CITY</p>
              <p className="b2-person-met">{city.map((f) => <span key={f.person.id}><PersonChip id={f.person.id} /> 기사 {f.count}</span>)}</p>
            </div>
          )}
          {interviews.length > 0 && (
            <div className="b2-chapter-block">
              <p className="b2-kicker">MAJOR ENCOUNTERS</p>
              <ul className="b2-event-list">{interviews.map((e) => <li key={e.id}>{e.day && <small>DAY {pad(e.day)}</small>}<b>{e.title}</b>{e.summary && <p>{e.summary}</p>}</li>)}</ul>
            </div>
          )}
        </>
      ),
    },
    {
      id: 'life',
      title: 'LIFE IN THE NEWSROOM',
      ko: '보도국 생활',
      show: life.length > 0,
      body: <div className="b2-stories">{life.map((x) => <StoryCard key={x.id} s={x} compact />)}</div>,
    },
    {
      id: 'choices',
      title: 'CHOICES AS A REPORTER',
      ko: '어떤 기사를 쓸 것인가',
      show: choices.length > 0 || track.some((t) => t.group),
      body: (
        <>
          {choices.length > 0 && <div className="b2-stories">{choices.map((x) => <StoryCard key={x.id} s={x} compact />)}</div>}
          {track.some((t) => t.group) && (
            <div className="b2-chapter-block b2-inside">
              <p className="b2-kicker">INSIDE THE NEWSROOM</p>
              <p className="b2-note">보도국 안에서 기사 방향이 갈렸던 날들의 입장 기록. 신이비를 설명하는 여러 기록 중 하나입니다.</p>
              <StanceTrack track={track} compact />
              <Link className="b2-textlink" href="/bongnudo-2/newsroom#politics">POSITIONS &amp; CONFLICTS →</Link>
            </div>
          )}
        </>
      ),
    },
    {
      id: 'war',
      title: 'WAR CORRESPONDENT',
      ko: '종군기자',
      show: war.length > 0,
      body: <div className="b2-stories">{war.map((x) => <StoryCard key={x.id} s={x} compact />)}</div>,
    },
    {
      id: 'final-days',
      title: 'THE FINAL DAYS',
      ko: '마지막 날들',
      show: farewell.length > 0 || Boolean(last),
      body: (
        <>
          {farewell.length > 0 && <div className="b2-stories">{farewell.map((x) => <StoryCard key={x.id} s={x} compact />)}</div>}
          {last && (
            <div className="b2-chapter-block">
              <p className="b2-kicker">LAST REPORT</p>
              <Clipping a={entry(last)} hideReporter />
            </div>
          )}
        </>
      ),
    },
    {
      id: 'letters',
      title: 'LETTERS LEFT BEHIND',
      ko: '남겨진 말',
      show: letters.length > 0,
      body: (
        <>
          <p className="b2-chapter-lead">기사 대신, 함께 일했던 사람들이 남긴 개인적인 말.</p>
          <Link className="b2-letter-link" href="/bongnudo-2/rolling-paper">
            <small>TO SHIN IBI</small>
            동료들이 남긴 편지 {letters.length}통 →
          </Link>
        </>
      ),
    },
  ].filter((c) => c.show);

  return (
    <main className="b2-main b2-reporter-page">
      <header className="b2-page-head">
        <p className="b2-kicker">THE REPORTER · {reporter.en}</p>
        <h1>한 명의 기자가 보낸 {archive.serverPeriod.labelKo}</h1>
        <p className="b2-page-lead">
          보도국에 들어와 기자가 되었고, 사건 현장에 갔고, 사람들을 만나 취재했다. 동료 기자들과 같은 보도국에서 생활했고, 여러 갈등 속에서 어떤 기사를 쓸지 골랐다.
        </p>
      </header>

      <div className="b2-reporter-grid">
        <aside className="b2-presscard" aria-label="기자증">
          <div className="b2-presscard-top">
            <span>PRESS</span>
            <b>{archive.sourceShort}</b>
          </div>
          <div className="b2-presscard-body">
            {reporter.image ? (
              <img className="b2-presscard-photo" src={reporter.image.src} alt={reporter.image.alt || reporter.name} />
            ) : (
              <span className="b2-presscard-photo empty" aria-hidden="true">{archive.sourceShort}</span>
            )}
            <div>
              <h2>{reporter.name}<small>{reporter.en}</small></h2>
              <dl>
                <div><dt>STATION</dt><dd>{archive.station} 보도국</dd></div>
                <div><dt>ROLE</dt><dd>{reporter.roleEn} · {reporter.role}</dd></div>
              </dl>
            </div>
          </div>
          <p className="b2-presscard-foot">
            <span>{reporter.streamer}</span>
            {reporter.finalPosition && <small>FINAL POSITION · {reporter.finalPosition}</small>}
          </p>
          <nav className="b2-chapter-toc" aria-label="장 목록">
            {chapters.map((c, i) => (
              <a key={c.id} href={`#${c.id}`}><small>{pad(i + 1)}</small>{c.title}</a>
            ))}
          </nav>
        </aside>

        <div className="b2-chapters">
          {chapters.map((c, i) => (
            <section key={c.id} id={c.id} className="b2-chapter">
              <header>
                <span className="b2-chapter-num">{pad(i + 1)}</span>
                <div>
                  <h2>{c.title}</h2>
                  <p>{c.ko}</p>
                </div>
              </header>
              {c.body}
            </section>
          ))}
          <Link className="b2-textlink" href="/bongnudo-2/people/shin-ibi">PEOPLE · 신이비의 기록 전체 →</Link>
        </div>
      </div>
    </main>
  );
}
