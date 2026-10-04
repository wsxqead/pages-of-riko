import Link from 'next/link';
import {archive, reporter} from '@/data/bongnudo2/meta';
import {getPage} from '@/data/pages';
import {
  articles,
  archiveIndex,
  getFeaturedArticles,
  getArticlesWithMedia,
  getLetters,
  getShinIbiArticles,
  getArticleThumbnail,
  reporterStats,
  reporterHref,
  getCoreNewsroom,
} from '@/data/bongnudo2';
import Edition from './_components/Edition';
import {Clipping, fmtDate, personPath, BbsLogo} from './_components/ui';

const logo = getPage('bongnudo-2')?.logo;

// 봉누도방송국 이야기의 흐름 — 각 막은 그 내용을 볼 수 있는 화면으로 이어진다 (날짜를 단정하지 않는다)
const ACTS = [
  {no: 'ACT 1', title: 'THE NEWSROOM OPENS', text: '기자들이 모이고, 서로를 알아가고, 기사를 쓰기 시작한다.', href: '/bongnudo-2/newsroom#reporters'},
  {no: 'ACT 2', title: 'REPORTING THE CITY', text: '경찰과 시민과 갱단을 만나고, 기사와 사진과 영상이 쌓인다.', href: '/bongnudo-2/archive'},
  {no: 'ACT 3', title: 'A NEWSROOM IN CONFLICT', text: '취재가 이어지면서 기자들의 생각이 갈리기 시작한다.', href: '/bongnudo-2/newsroom#politics'},
  {no: 'ACT 4', title: 'WHAT SHOULD A REPORTER DO?', text: '경찰과 갱단의 충돌 속에서, 무엇을 어떻게 보도할 것인가.', href: '/bongnudo-2/reporter#choices'},
  {no: 'ACT 5', title: 'BACK TO THE NEWSROOM', text: '갈등을 겪으면서도 기자들은 계속 함께 일한다.', href: '/bongnudo-2/newsroom#stories'},
  {no: 'ACT 6', title: 'WAR CORRESPONDENTS', text: '전쟁이 시작되고, 기자들이 현장으로 들어간다.', href: '/bongnudo-2/newsroom#reporting-together'},
  {no: 'ACT 7', title: 'FINAL EDITION', text: '기사가 끝나고, 보도국도 문을 닫는다.', href: '/bongnudo-2/ending'},
  {no: 'EPILOGUE', title: 'TO SHIN IBI', text: '기사 대신, 동료들이 남긴 개인적인 말.', href: '/bongnudo-2/rolling-paper'},
];

export default function FrontPage() {
  const index = archiveIndex();
  const entry = (a) => index.find((x) => x.id === a.id);
  const featured = getFeaturedArticles();
  const lead = featured[0] || null;
  const second = featured[1] || null;
  const photo = getArticlesWithMedia().find((a) => a._images.length && a.id !== lead?.id) || null;
  const photoImg = photo ? getArticleThumbnail(photo) : null;
  const shin = reporterStats(reporter.id);
  const shinPhoto = getShinIbiArticles().filter((a) => a._images.length).length;
  const shinVideo = getShinIbiArticles().filter((a) => a._videos.length).length;
  const latest = index.filter((a) => a.id !== lead?.id && a.id !== second?.id).slice(0, 5);
  const letters = getLetters();
  const newsroom = getCoreNewsroom();

  return (
    <main className="b2-main b2-front">
      <Edition>
        <header className="b2-masthead">
          <div className="b2-masthead-row has-mark">
            <span className="b2-station-mark">
              <BbsLogo className="is-masthead" />
              {archive.station}
            </span>
            <span>FINAL ARCHIVE EDITION</span>
            <span>{archive.serverPeriod.label} OF REPORTING</span>
          </div>
          <div className="b2-nameplate">
            {logo && <img className="b2-logo" src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} />}
            <h1>
              <small>THE REPORTER</small>
              {reporter.en}
              <span>PRESS ARCHIVE</span>
            </h1>
          </div>
          <div className="b2-masthead-rule" />
        </header>

        <section className="b2-lead">
          <h2 className="b2-headline">
            신이비가 기자로 남긴
            <br />
            {archive.serverPeriod.labelKo}간의 기록.
          </h2>
          <p className="b2-deck">
            취재하고, 기사를 쓰고, 사람을 만나고,
            <br />
            때로는 선택해야 했던 시간.
          </p>
          <p className="b2-byline">{archive.station} 보도국 {reporter.role} {reporter.name} · {reporter.streamer}</p>
        </section>

        <div className="b2-columns">
          {lead && (
            <article className="b2-col b2-story-lead">
              <p className="b2-kicker">MAIN HEADLINE</p>
              <Clipping a={entry(lead)} />
            </article>
          )}
          {second && (
            <article className="b2-col">
              <p className="b2-kicker">SECONDARY STORY</p>
              <Clipping a={entry(second)} />
            </article>
          )}
          {photo && (
            <article className="b2-col b2-photo-story">
              <p className="b2-kicker">PHOTO STORY</p>
              <Link href={`/bongnudo-2/archive/${photo.id}`} className="b2-photo-link">
                <img src={photoImg.src} alt={photoImg.alt || photoImg.caption || photo.title} loading="lazy" />
                <b>{photo.title}</b>
                {photoImg.caption && <small>{photoImg.caption}</small>}
              </Link>
            </article>
          )}

          <Link href="/bongnudo-2/archive" className="b2-col b2-box b2-box-archive">
            <p className="b2-kicker">BBS ARCHIVE<span className="b2-axis">무엇을 보도했는가</span></p>
            <p className="b2-figure-num">{archive.totalExpectedArticles}<small>ARTICLES</small></p>
            <p className="b2-box-text">봉누도방송국 BBS에 실렸던 기사 {archive.totalExpectedArticles}건. 서버가 닫힌 뒤에도 읽을 수 있도록 원문 그대로 보존합니다.</p>
            {articles.length > 0 && <p className="b2-box-meta">PRESERVED · {articles.length} ARTICLES</p>}
            <em>ARCHIVE →</em>
          </Link>

          <div className="b2-col b2-box b2-box-newsroom">
            <p className="b2-kicker">THE BBS NEWSROOM<span className="b2-axis">누구와 함께 일했는가</span></p>
            <Link href="/bongnudo-2/newsroom" className="b2-box-main">
              <h3>함께 취재하고, 기사를 쓰고, 때로는 부딪히면서도 같은 보도국에서 {archive.serverPeriod.labelKo}를 보낸 기자들.</h3>
              <em>MEET THE NEWSROOM →</em>
            </Link>
            <p className="b2-box-names">
              {newsroom.map((p) => (
                <Link key={p.id} href={personPath(p.id)} className={p.id === reporter.id ? 'is-shin' : ''}>{p.name}</Link>
              ))}
            </p>
            <Link href="/bongnudo-2/newsroom#politics" className="b2-box-sub">
              <b>NEWSROOM POLITICS</b>
              <span>보도국 안에서 달라졌던 입장들 →</span>
            </Link>
          </div>

          {shin && (
            <Link href={reporterHref(reporter.id)} className="b2-col b2-box b2-box-desk">
              <p className="b2-kicker">SHIN IBI COLLECTION</p>
              <h3>REPORTER'S DESK</h3>
              <ul className="b2-desk-figures">
                <li><b>{shin.articles}</b><span>ARTICLES</span></li>
                {shinPhoto > 0 && <li><b>{shinPhoto}</b><span>PHOTO STORIES</span></li>}
                {shinVideo > 0 && <li><b>{shinVideo}</b><span>VIDEO REPORTS</span></li>}
              </ul>
              <em>OPEN COLLECTION →</em>
            </Link>
          )}

          <Link href="/bongnudo-2/reporter" className="b2-col b2-box b2-box-card">
            <p className="b2-kicker">THE REPORTER</p>
            <div className="b2-minicard">
              <b>{reporter.name}</b>
              <span>{archive.station} 보도국 {reporter.role}</span>
              <span>{reporter.streamer}</span>
              {reporter.finalPosition && <small>FINAL POSITION · {reporter.finalPosition}</small>}
            </div>
            <em>THE REPORTER →</em>
          </Link>

          <Link href="/bongnudo-2/rolling-paper" className={'b2-col b2-box b2-box-letters' + (latest.length ? '' : ' wide')}>
            <p className="b2-kicker">TO SHIN IBI<span className="b2-axis">마지막에 무엇을 남겼는가</span></p>
            <h3>Letters from the Newsroom</h3>
            <p className="b2-box-text">마지막 기사 뒤에 남겨진 말들.</p>
            {letters.length > 0 && <p className="b2-box-meta">{letters.length} LETTERS</p>}
            <em>LETTERS →</em>
          </Link>

          {latest.length > 0 && (
            <section className="b2-col b2-latest">
              <p className="b2-kicker">LATEST ARCHIVE</p>
              <ol className="b2-clips compact">
                {latest.map((a) => <li key={a.id}><Clipping a={a} compact /></li>)}
              </ol>
            </section>
          )}
        </div>

        <nav className="b2-acts" aria-label="봉누도방송국의 3주">
          <p className="b2-kicker">IN THIS EDITION · 봉누도방송국의 {archive.serverPeriod.labelKo}</p>
          <ol>
            {ACTS.map((a) => (
              <li key={a.no}>
                <Link href={a.href}>
                  <small>{a.no}</small>
                  <b>{a.title}</b>
                  <span>{a.text}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <Link href="/bongnudo-2/ending" className="b2-final-teaser">
          <span>FINAL EDITION</span>
          <b>마지막 판 펼치기 →</b>
          {lead?.publishedAt && <small>{fmtDate(lead.publishedAt)}</small>}
        </Link>
      </Edition>
    </main>
  );
}
