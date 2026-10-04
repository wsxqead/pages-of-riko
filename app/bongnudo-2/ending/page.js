import Link from 'next/link';
import {archive, reporter} from '@/data/bongnudo2/meta';
import {articles, archiveIndex, getShinIbiArticles, getLetters, getArticlesWithMedia, getArticleThumbnail, getCoreNewsroom, getNewsroomOthers, getStory} from '@/data/bongnudo2';
import {Clipping, personPath, BbsLogo} from '../_components/ui';
import {PersonChip} from '../_components/newsroom';

export const metadata = {title: 'FINAL EDITION — 봉누도 2'};

// 마지막 판: 폐허가 아니라 "발행이 끝난 신문". 신이비의 마지막이면서, 이 기자단이 함께 보낸 3주의 마지막.
export default function FinalEdition() {
  const index = archiveIndex();
  const entry = (a) => index.find((x) => x.id === a.id);
  const war = getStory('day14-war-correspondents');
  const members = getCoreNewsroom();
  const others = getNewsroomOthers();
  const lastShin = getShinIbiArticles()[0] || null;
  const lastPhoto = getArticlesWithMedia().find((a) => a._images.length) || null;
  const lastPhotoImg = lastPhoto ? getArticleThumbnail(lastPhoto) : null;
  const letters = getLetters();

  return (
    <main className="b2-main b2-final">
      <article className="b2-final-paper">
        <header className="b2-masthead small">
          <div className="b2-masthead-row has-mark">
            <span className="b2-station-mark">
              <BbsLogo className="is-masthead" />
              {archive.station}
            </span>
            <span>FINAL EDITION</span>
            <span>{reporter.en}</span>
          </div>
          <h1 className="b2-final-title">FINAL EDITION</h1>
          <div className="b2-masthead-rule" />
        </header>

        <div className="b2-final-cols">
          {war && (
            <section className="b2-final-war">
              <p className="b2-kicker">DAY {String(war.day).padStart(2, '0')} · WAR CORRESPONDENTS</p>
              <h2>{war.title}</h2>
              <p>{war.summary}</p>
              <p className="b2-story-people">{war.people.map((id) => <PersonChip key={id} id={id} />)}</p>
              {war.contrast && (
                <p className="b2-story-contrast">
                  <small>{war.contrast.label}</small>
                  {war.contrast.people.map((id) => <PersonChip key={id} id={id} />)}
                </p>
              )}
            </section>
          )}
          {lastShin && (
            <section>
              <p className="b2-kicker">LAST REPORT</p>
              <Clipping a={entry(lastShin)} compact />
            </section>
          )}
          {lastPhoto && (
            <section>
              <p className="b2-kicker">LAST PHOTO</p>
              <Link href={`/bongnudo-2/archive/${lastPhoto.id}`} className="b2-photo-link">
                <img src={lastPhotoImg.src} alt={lastPhotoImg.alt || lastPhotoImg.caption || lastPhoto.title} loading="lazy" />
              </Link>
            </section>
          )}
          <section>
            <p className="b2-kicker">THE RECORD</p>
            <ul className="b2-final-figures">
              <li><b>{archive.totalExpectedArticles}</b><span>BBS 원본 기사</span></li>
              {articles.length > 0 && <li><b>{articles.length}</b><span>보존된 기사</span></li>}
              {getShinIbiArticles().length > 0 && <li><b>{getShinIbiArticles().length}</b><span>신이비 기사</span></li>}
              {letters.length > 0 && <li><b>{letters.length}</b><span>동료들의 편지</span></li>}
            </ul>
          </section>
          <section className="b2-final-newsroom">
            <p className="b2-kicker">THE BBS NEWSROOM</p>
            <h2>이 판을 함께 만든 사람들</h2>
            <ul className="b2-final-names">
              {members.map((p) => (
                <li key={p.id} className={p.id === reporter.id ? 'is-shin' : ''}>
                  <Link href={personPath(p.id)}>
                    <b>{p.name}</b>
                    {p.streamer && <small>{p.streamer}</small>}
                  </Link>
                </li>
              ))}
              {others.map((p) => (
                <li key={p.id} className="later">
                  <Link href={personPath(p.id)}>
                    <b>{p.name}</b>
                    <small>보도국 기록</small>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <Link href="/bongnudo-2/rolling-paper" className="b2-final-letters">
            <p className="b2-kicker">TO SHIN IBI</p>
            <span>마지막 기사 뒤에 남겨진 말들 →</span>
          </Link>
        </div>

        <footer className="b2-colophon">
          <p className="b2-end-mark">
            <BbsLogo className="is-colophon" />
            <span>END OF EDITION</span>
          </p>
          <p className="b2-end-line">서버는 끝나도,<br />기사는 남는다.</p>
          <Link href="/" className="b2-return-album">← RETURN TO THE ALBUM</Link>
        </footer>
      </article>
    </main>
  );
}
