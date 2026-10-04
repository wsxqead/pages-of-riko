'use client';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {getResident} from '@/data/pixelTown2/residents';
import {regionsById} from '@/data/pixelTown2/regions';
import {readVisits, addVisit} from '@/lib/pct2Session';

const TYPE = {event: 'TOWN STORY', relationship: 'RELATIONSHIP UPDATE', encounter: 'ENCOUNTER', visit: 'VISIT'};

function People({ids, label}) {
  const list = (ids || []).map(getResident).filter(Boolean);
  if (!list.length) return null;
  return (
    <p className="pt-story-people">
      {label && <small>{label}</small>}
      {list.map((r) => (
        <Link key={r.id} href={`/pixel-town-2/residents#${r.id}`} className={r.player ? 'me' : ''}>
          {r.name}
          {r.homeRegion && <em>{regionsById[r.homeRegion].name}</em>}
        </Link>
      ))}
    </p>
  );
}

// 기억 카드: 펼치면 이번 방문 기록(LAST DAY)에 "열어 본 기억"으로 남는다
export function StoryCard({story, compact = false}) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(true);
  useEffect(() => setSeen(readVisits().encounters.includes(story.id)), [story.id]);
  const toggle = () => {
    setOpen((o) => !o);
    if (!seen) {
      addVisit('encounters', story.id);
      setSeen(true);
    }
  };
  return (
    <article className={'pt-story t-' + story.type + (open ? ' open' : '') + (compact ? ' compact' : '')} id={story.id}>
      <button className="pt-story-head" onClick={toggle} aria-expanded={open}>
        <small>{TYPE[story.type]}{!seen && <b className="new">NEW</b>}</small>
        <h3>{story.title}</h3>
        <People ids={story.people} />
        <span className="chev" aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="pt-story-body">
          <p>{story.summary}</p>
          {story.relatedPeople?.length > 0 && <People ids={story.relatedPeople} label="함께 등장" />}
          {story.continuing && (
            <Link className="pt-continuing" href={story.continuing.href}>
              <small>CONTINUING MEMORY</small>
              <b>{story.continuing.label}</b>
              <span>{story.continuing.note}</span>
            </Link>
          )}
        </div>
      )}
    </article>
  );
}

export default function Stories({stories, compact}) {
  if (!stories.length) return null;
  return (
    <div className={'pt-stories' + (compact ? ' compact' : '')}>
      {stories.map((s) => <StoryCard key={s.id} story={s} compact={compact} />)}
    </div>
  );
}
