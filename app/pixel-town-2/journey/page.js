import Link from 'next/link';
import {footprints, recordIntro} from '@/data/pixelTown2/journey';
import {worldEvents, serverDays} from '@/data/pixelTown2/worldProgress';
import {regionsById} from '@/data/pixelTown2/regions';
import {officialEdits, formatDate, dayKey} from '@/data/pixelTown2/media';
import {encounters, encountersById, undatedStories} from '@/data/pixelTown2/encounters';
import {getResident} from '@/data/pixelTown2/residents';
import {server} from '@/data/pixelTown2/meta';
import Stories from '../_components/Stories';

export const metadata = {title: "RIKO'S JOURNEY · 픽크타2 — PAGES OF RIKO"};

const KIND = {server: '◆', boss: '⚔', dungeon: '▦', rest: '☾'};
const MONTH = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const shortDate = (iso) => `${MONTH[Number(iso.slice(5, 7)) - 1]} ${iso.slice(8, 10)}`;

// RIKO 줄: 리코에게 확인된 기록만 (WORLD 줄과 섞지 않는다)
const rikoByDay = {};
const push = (k, item) => k && (rikoByDay[k] ||= []).push(item);
footprints.filter((f) => f.date).forEach((f) => push(dayKey(f.date), {id: f.id, label: f.type === 'session' ? 'PLAY SESSION' : f.title, kind: 'session'}));
encounters.filter((e) => e.date && e.people.includes('riko') && e.verification === 'confirmed').forEach((e) => push(dayKey(e.date), {id: e.id, label: e.title, kind: 'story'}));
officialEdits.forEach((m) => push(dayKey(m.publishedAt), {id: m.id, label: `${m.label.split(' ')[0]} 공개`, kind: 'pub'}));
const afterClose = officialEdits.filter((m) => m.publishedAt && !serverDays.includes(dayKey(m.publishedAt)));

// 발자국: 날짜 없는 HOME → 날짜순 기록
const steps = [...footprints].sort((a, b) => (a.date || '').localeCompare(b.date || ''));

function Record({m}) {
  const related = m.encounters.map((id) => encountersById[id]).filter(Boolean);
  return (
    <article className={'pt-record' + (m.episode === 4 ? ' final' : '')}>
      <header>
        <b>{m.label}</b>
        <span className="pt-record-kind">OFFICIAL EDIT</span>
      </header>
      <p className="pt-record-pub">
        <small>PUBLISHED</small>
        <time dateTime={m.publishedAt}>{formatDate(m.publishedAt)}</time>
      </p>
      <h3>{m.title}</h3>
      {m.eventDate && <p className="pt-record-date">이야기 속 날짜 · {formatDate(m.eventDate)}</p>}
      {m.titleNames.length > 0 && (
        <div className="pt-record-people">
          <small>IN THE TITLE</small>
          <ul>
            {m.titleNames.map((t) => {
              const r = t.resident && getResident(t.resident);
              return (
                <li key={t.name} className={r ? '' : 'mention'}>
                  {r ? (
                    <Link href={`/pixel-town-2/residents#${r.id}`}>
                      {r.name}
                      {r.homeRegion && <em>{regionsById[r.homeRegion].name} 주민</em>}
                    </Link>
                  ) : (
                    t.name
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {related.length > 0 && (
        <div className="pt-record-people">
          <small>RELATED STORIES</small>
          <ul>{related.map((e) => <li key={e.id}><a href={`#${e.id}`}>{e.title}</a></li>)}</ul>
        </div>
      )}
      {m.url && <a className="pt-record-watch" href={m.url} target="_blank" rel="noreferrer">영상 보기 ↗</a>}
    </article>
  );
}

export default function JourneyPage() {
  const stories = undatedStories();
  return (
    <main className="pt-main pt-journey">
      <header className="pt-page-head">
        <small>RIKO&apos;S JOURNEY</small>
        <h1>리코의 발자국</h1>
        <p>리코의 방송과 영상으로 확인되는 기록만 이어 붙였습니다. 서버 전체의 진행은 아래 WORLD PROGRESS에 따로 적었습니다.</p>
      </header>

      <ol className="pt-trailbook">
        {steps.map((f, i) => (
          <li key={f.id} className={'pt-step is-' + f.type} style={{'--i': i}}>
            <span className="feet" aria-hidden="true"><i /><i /></span>
            <div className="pt-step-card">
              <p className="kind">
                {f.date ? <b className="pt-step-date">{shortDate(f.date)}</b> : null}
                {f.type === 'home' ? 'HOME' : f.type === 'session' ? "RIKO'S PLAY SESSION" : f.type.toUpperCase()}
                {f.region && regionsById[f.region] && <> · {regionsById[f.region].name}</>}
              </p>
              <h2>{f.type === 'session' ? server.nameKo : f.title}</h2>
              <p className="txt">{f.text}</p>
              {f.region && <Link className="pt-step-map" href={`/pixel-town-2#${f.region}`}>지도에서 {regionsById[f.region].name} 보기 →</Link>}
            </div>
          </li>
        ))}
        <li className="pt-step is-record" style={{'--i': steps.length}}>
          <span className="feet" aria-hidden="true"><i /><i /></span>
          <div className="pt-step-card">
            <p className="kind">{recordIntro.label}</p>
            <h2>{recordIntro.title}</h2>
            <p className="txt">{recordIntro.text}</p>
            <div className="pt-records">
              {officialEdits.map((m) => <Record key={m.id} m={m} />)}
            </div>
          </div>
        </li>
      </ol>

      {stories.length > 0 && (
        <section className="pt-townstories" id="stories" aria-labelledby="pt-stories-title">
          <header className="pt-page-head">
            <small>TOWN STORIES</small>
            <h2 id="pt-stories-title">마을에 남은 이야기</h2>
            <p>언제, 어디서였는지는 기록되지 않았지만 분명히 있었던 일들. 날짜가 확인되면 발자국과 달력으로 옮겨집니다.</p>
          </header>
          <Stories stories={stories} />
        </section>
      )}

      <section className="pt-world" aria-labelledby="pt-world-title">
        <header className="pt-page-head">
          <small>WORLD PROGRESS</small>
          <h2 id="pt-world-title">서버 전체의 진행</h2>
          <p>
            {server.version} · {server.platform} · {server.participants}명이 참여한 서버에서 어떤 콘텐츠가 열렸는지의 기록입니다.
            서버에 콘텐츠가 있었다는 것과 리코가 그것을 클리어했다는 것은 다른 이야기라, 리코의 참여가 확인되지 않은 항목은 WORLD EVENT로만 표시합니다.
          </p>
        </header>
        <div className="pt-calendar" role="table" aria-label="서버 달력">
          <div className="pt-cal-labels" role="rowgroup" aria-hidden="true">
            <span>WORLD</span>
            <span>RIKO</span>
          </div>
          <ol className="pt-cal-days">
            {serverDays.map((d) => {
              const ev = worldEvents.filter((e) => e.date === d);
              const mine = rikoByDay[d] || [];
              return (
                <li key={d} className={(ev.length ? 'has ' : '') + (ev.some((e) => e.kind === 'server') ? 'server ' : '') + (mine.some((x) => x.kind === 'session') ? 'riko-day' : '')} role="row">
                  <time role="rowheader">{d}</time>
                  <div className="world" role="cell">
                    {ev.map((e) => (
                      <span key={e.label} className={'pt-evt ' + e.kind}>
                        <i aria-hidden="true">{KIND[e.kind]}</i>
                        <b>{e.ko}</b>
                        {e.note && <em>{e.note}</em>}
                        <small>{e.rikoEncounter ? 'RIKO JOINED' : 'WORLD EVENT'}</small>
                      </span>
                    ))}
                  </div>
                  <div className="riko" role="cell">
                    {mine.length ? mine.map((x) => <span key={x.id} className={'pt-mine ' + x.kind}>{x.label}</span>) : <span className="pt-none" aria-hidden="true" />}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <p className="pt-cal-note">
          RIKO 줄에는 리코의 확인된 플레이 기록과 공식 편집본 공개일만 표시합니다. &lsquo;공개&rsquo;는 영상이 공개된 날이며 영상 속 사건이 일어난 날과는 다를 수 있습니다.
          {afterClose.length > 0 && <> 서버 종료 뒤 공개: {afterClose.map((m) => `${m.label.split(' ')[0]} ${formatDate(m.publishedAt).slice(5)}`).join(', ')}.</>}
        </p>
      </section>
    </main>
  );
}
