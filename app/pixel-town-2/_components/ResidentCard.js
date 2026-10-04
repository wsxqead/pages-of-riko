'use client';
import Link from 'next/link';
import {useEffect, useRef} from 'react';
import {getResident} from '@/data/pixelTown2/residents';
import {regionsById} from '@/data/pixelTown2/regions';
import {encountersWith, rikoStories} from '@/data/pixelTown2/encounters';
import {mediaWith, formatDate} from '@/data/pixelTown2/media';
import Stories from './Stories';
import {rikoPets} from '@/data/pixelTown2/pets';

// RESIDENT CARD — 스탯창이 아니라 마을 주민 등록 카드
export default function ResidentCard({id, onClose}) {
  const r = getResident(id);
  const close = useRef(null);
  useEffect(() => {
    close.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id, onClose]);
  if (!r) return null;
  const home = r.homeRegion && regionsById[r.homeRegion];
  const enc = encountersWith(r.id);
  const visits = enc.filter((e) => e.type === 'visit');
  const stories = r.player ? rikoStories() : enc;
  const media = mediaWith(r.id).filter((m) => m.type !== 'photo');

  return (
    <>
      <div className="pt-scrim" onClick={onClose} />
      <aside className="pt-card" role="dialog" aria-modal="true" aria-label={`${r.name} 주민 카드`}>
        <button ref={close} className="pt-card-close" onClick={onClose}>닫기 ✕</button>
        <p className="pt-card-kind">RESIDENT CARD{r.tier === 'featured' ? ' · FEATURED' : ''}</p>
        <header className="pt-card-head">
          <span className="pt-card-face" aria-hidden="true">{r.portrait?.src ? <img src={r.portrait.src} alt="" /> : r.name[0]}</span>
          <div>
            <h2>{r.name}{r.player && <em>RIKO</em>}</h2>
            {r.en && <p className="en">{r.en}</p>}
          </div>
        </header>

        <dl className="pt-card-rows">
          {home && (
            <div>
              <dt>HOME</dt>
              <dd><Link href={`/pixel-town-2#${home.id}`}>{home.name} →</Link></dd>
            </div>
          )}
          <div><dt>CONNECTION</dt><dd>{r.connection}</dd></div>
          {enc.length > 0 && <div><dt>STORIES</dt><dd>{enc.length}</dd></div>}
        </dl>

        {stories.length > 0 && (
          <section>
            <h3>{r.player ? "RIKO'S TOWN STORIES" : 'SHARED MEMORIES'}</h3>
            <Stories stories={stories} compact />
          </section>
        )}
        {visits.length > 0 && (
          <section>
            <h3>VISITED TOGETHER</h3>
            <ul className="pt-card-list">{visits.map((e) => <li key={e.id}>{regionsById[e.location]?.name} · {e.title}</li>)}</ul>
          </section>
        )}

        {r.streamLog.length > 0 && (
          <section>
            <h3>{r.name}의 픽크타2 방송 기록</h3>
            <p className="pt-card-note">본인 채널 기록 · 리코와 함께한 기록이 아닙니다. {r.streamNote}</p>
            <ol className="pt-days">
              {r.streamLog.map((d) => (
                <li key={d.date} title={d.extra || ''}>
                  <b>{d.date}</b>
                  <span>{d.label}</span>
                  {d.extra && <small>{d.extra}</small>}
                </li>
              ))}
            </ol>
          </section>
        )}

        {media.length > 0 && (
          <section>
            <h3>{r.player ? "RIKO'S PIXEL TOWN RECORD" : '제목에 이름이 나오는 공식 편집본'}</h3>
            <ul className="pt-card-list">
              {media.map((m) => (
                <li key={m.id}>
                  <time>{m.label.split(' ')[0]}</time>
                  <span>
                    {m.url ? <a href={m.url} target="_blank" rel="noreferrer">{m.title}</a> : m.title}
                    {m.publishedAt && <small className="pub">{formatDate(m.publishedAt)} 공개</small>}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {r.player && rikoPets.length > 0 && (
          <section>
            <h3>RIKO&apos;S PETS</h3>
            <ul className="pt-card-list">{rikoPets.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
          </section>
        )}
      </aside>
    </>
  );
}
