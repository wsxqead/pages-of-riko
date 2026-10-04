import Link from 'next/link';
import {archive} from '@/data/bongnudo2/meta';
import {
  articles,
  getCoreNewsroom,
  getNewsroomOthers,
  getStories,
  getReportingTogether,
  getLetters,
} from '@/data/bongnudo2';
import NewsroomPolitics from '../_components/NewsroomPolitics';
import {RosterPlate, StoryCard, PersonChip} from '../_components/newsroom';
import {personPath, BbsLogo} from '../_components/ui';

export const metadata = {title: 'THE BBS NEWSROOM — 봉누도 2'};

// THE BBS NEWSROOM — 보도국은 "같이 일했던 기자들"이다. 입장(POLITICS)은 그 안의 한 기록.
export default function NewsroomPage() {
  const members = getCoreNewsroom();
  const others = getNewsroomOthers();
  const together = getReportingTogether();
  const togetherIds = new Set(together.map((s) => s.id));
  const stories = getStories().filter((s) => !togetherIds.has(s.id));
  const letters = getLetters();
  const photos = articles.reduce((n, a) => n + a._images.length, 0);
  const videos = articles.reduce((n, a) => n + a._videos.length, 0);
  const count = (t) => getStories([t]).length;

  // A DAY IN THE NEWSROOM — 하루의 일. 자료가 있는 줄에만 기록 수를 붙인다.
  const day = [
    {verb: '취재했고', note: count('reporting') && `취재 기록 ${count('reporting')}`, href: '#reporting-together'},
    {verb: '기사를 썼고', note: articles.length > 0 && `BBS 기사 ${articles.length}`, href: '/bongnudo-2/archive'},
    {verb: '사진을 찍었고', note: (photos > 0 || videos > 0) && [photos > 0 && `사진 ${photos}`, videos > 0 && `영상 ${videos}`].filter(Boolean).join(' · '), href: '/bongnudo-2/archive'},
    {verb: '인터뷰했고'},
    {verb: '생방송을 했고', note: count('news') && `뉴스 진행 ${count('news')}`, href: '#stories'},
    {verb: '회의했고', note: count('daily-life') && `보도국 생활 ${count('daily-life')}`, href: '#stories'},
    {verb: '농담했고'},
    {verb: '사건에 휘말렸고', note: count('incident') && `사건 ${count('incident')}`, href: '#stories'},
    {verb: '서로 의심하기도 했고', note: count('conflict') && `보도국 안의 갈등 ${count('conflict')}`, href: '#stories'},
    {verb: '싸우기도 했고'},
    {verb: '다시 함께 일했고', note: count('relationship') && `동료 기록 ${count('relationship')}`, href: '#stories'},
    {verb: '마지막에는 서로에게 글을 남겼다.', note: letters.length > 0 && `편지 ${letters.length}`, href: '/bongnudo-2/rolling-paper', last: true},
  ];

  return (
    <main className="b2-main b2-newsroom">
      <header className="b2-page-head b2-nr-head">
        <p className="b2-kicker b2-insignia-line">
          <BbsLogo className="is-insignia" />
          <span>THE BBS NEWSROOM · {archive.station} 보도국</span>
        </p>
        <h1>같은 보도국에서 {archive.serverPeriod.labelKo}를 보낸 기자들</h1>
        <p className="b2-page-lead">
          함께 취재하고, 기사를 쓰고, 때로는 부딪히면서도 같은 보도국에서 일했던 사람들. 각자 다른 방식으로 기사를 썼지만, 그 기사는 모두 같은 BBS에 쌓였다.
        </p>
      </header>

      <nav className="b2-nr-toc" aria-label="NEWSROOM 차례">
        <a href="#reporters">THE REPORTERS</a>
        <a href="#a-day">A DAY IN THE NEWSROOM</a>
        <a href="#stories">NEWSROOM STORIES</a>
        {together.length > 0 && <a href="#reporting-together">REPORTING TOGETHER</a>}
        <a href="#politics">POSITIONS &amp; CONFLICTS</a>
        <a href="#final-newsroom">THE FINAL NEWSROOM</a>
      </nav>

      <section id="reporters" className="b2-nr-section">
        <header className="b2-nr-sechead">
          <p className="b2-kicker">THE REPORTERS</p>
          <h2>보도국 기자 명부</h2>
        </header>
        <RosterPlate members={members} others={others} />
        <ol className="b2-staffnotes">
          {members.map((p) => (
            <li key={p.id} className={p.id === 'shin-ibi' ? 'is-shin' : ''}>
              <Link href={personPath(p.id)}>
                <b>
                  {p.name}
                  {p.id === 'shin-ibi' && <i className="b2-press">PRESS</i>}
                </b>
                {p.streamer && <small>{p.streamer}</small>}
                {p.profile.summary && <span>{p.profile.summary}</span>}
                {p.finalPosition && <em>FINAL POSITION · {p.finalPosition}</em>}
              </Link>
            </li>
          ))}
        </ol>
        <Link className="b2-textlink" href="/bongnudo-2/people">기자 한 명씩 보기 →</Link>
      </section>

      <section id="a-day" className="b2-nr-section">
        <header className="b2-nr-sechead">
          <p className="b2-kicker">A DAY IN THE NEWSROOM</p>
          <h2>이들은 매일</h2>
        </header>
        <ol className="b2-dayboard">
          {day.map((d) => (
            <li key={d.verb} className={d.last ? 'last' : ''}>
              <span className="verb">{d.verb}</span>
              {d.note ? (
                d.href.startsWith('#') ? <a href={d.href} className="note">{d.note}</a> : <Link href={d.href} className="note">{d.note}</Link>
              ) : (
                <span className="rule" aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
      </section>

      <section id="stories" className="b2-nr-section">
        <header className="b2-nr-sechead">
          <p className="b2-kicker">NEWSROOM STORIES</p>
          <h2>보도국에서 함께 보낸 장면들</h2>
          <p className="b2-nr-sub">누가 어느 편이었는지보다, 같은 보도국에서 무슨 일이 있었는지. 기사·클립이 확보되는 대로 장면이 늘어난다.</p>
        </header>
        <div className="b2-stories">
          {stories.map((s) => (
            <StoryCard key={s.id} s={s} />
          ))}
        </div>
      </section>

      {together.length > 0 && (
        <section id="reporting-together" className="b2-nr-section">
          <header className="b2-nr-sechead">
            <p className="b2-kicker">REPORTING TOGETHER</p>
            <h2>기자들이 함께 현장으로 갔다</h2>
          </header>
          <div className="b2-stories wide">
            {together.map((s) => (
              <StoryCard key={s.id} s={s} />
            ))}
          </div>
        </section>
      )}

      <section id="politics" className="b2-nr-section b2-nr-politics">
        <header className="b2-nr-sechead">
          <p className="b2-kicker">INSIDE THE NEWSROOM · POSITIONS &amp; CONFLICTS</p>
          <h2>같은 보도국 안에서도, 기사를 바라보는 방향은 늘 같지 않았다</h2>
          <p className="b2-nr-sub">
            기자단 안에서 벌어진 갈등을 이해하기 위한 기록. 같은 책상에 앉았다고 가까웠다는 뜻은 아니고, 다른 책상이라고 사이가 나빴다는 뜻도 아니다. 이름을 누르면 그 기자의 기록으로 이동한다.
          </p>
        </header>
        <NewsroomPolitics />
      </section>

      <section id="final-newsroom" className="b2-nr-section b2-nr-final">
        <p className="b2-kicker">THE FINAL NEWSROOM</p>
        <h2>기사가 끝나고, 보도국도 문을 닫았다</h2>
        <p className="b2-nr-final-names">
          {members.map((p) => (
            <PersonChip key={p.id} id={p.id} />
          ))}
        </p>
        <p className="b2-nr-final-line">그리고 마지막에는, 공적인 기사 대신 서로에게 개인적인 말을 남겼다.</p>
        <p className="b2-nr-final-links">
          <Link className="b2-textlink" href="/bongnudo-2/ending">FINAL EDITION →</Link>
          <Link className="b2-textlink" href="/bongnudo-2/rolling-paper">TO SHIN IBI →</Link>
        </p>
      </section>
    </main>
  );
}
