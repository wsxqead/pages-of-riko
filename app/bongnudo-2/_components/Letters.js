'use client';
import {useCallback, useEffect, useRef, useState} from 'react';

const READ_KEY = 'bb2LettersRead';
const readSet = () => {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(READ_KEY) || '[]'));
  } catch {
    return new Set();
  }
};
const saveSet = (s) => {
  try {
    sessionStorage.setItem(READ_KEY, JSON.stringify([...s]));
  } catch {}
};

// 펼친 편지: 사이트의 관계 설명(위)과 원문(아래)을 분리한다. 원문은 줄바꿈 그대로, 길이 제한 없이.
function OpenLetter({l, onClose}) {
  const btn = useRef(null);
  useEffect(() => {
    btn.current?.focus();
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="b2-letter-wrap" role="dialog" aria-modal="true" aria-label={`${l.fromName}의 편지`} onClick={onClose}>
      <article className="b2-letter" onClick={(e) => e.stopPropagation()}>
        <button ref={btn} className="b2-letter-close" onClick={onClose}>닫기 ✕</button>
        <header>
          <p><small>FROM</small><b>{l.fromName}</b></p>
          {l.fromStreamer && <p><small>STREAMER</small><span>{l.fromStreamer}</span></p>}
        </header>
        {l.relationship && (
          <section className="b2-letter-note">
            <h3>3 WEEKS TOGETHER</h3>
            <p>{l.relationship}</p>
          </section>
        )}
        <section className="b2-letter-body">
          <h3>ORIGINAL LETTER</h3>
          {l.title && <h4>{l.title}</h4>}
          <div className="text">{l.body}</div>
          {l.image && <img src={l.image.src} alt={l.image.alt || `${l.fromName}의 편지 원본`} width={l.image.width || undefined} height={l.image.height || undefined} />}
          {l.writtenAt && <p className="date">{l.writtenAt}</p>}
        </section>
      </article>
    </div>
  );
}

export default function Letters({letters}) {
  const [open, setOpen] = useState(null);
  const [read, setRead] = useState(new Set());
  useEffect(() => {
    setRead(readSet());
    const h = decodeURIComponent(location.hash.slice(1));
    const hit = letters.find((l) => l.fromPersonId === h || l.id === h);
    if (hit) setOpen(hit.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const choose = (l) => {
    setOpen(l.id);
    const s = new Set(read);
    s.add(l.id);
    setRead(s);
    saveSet(s);
  };
  const close = useCallback(() => setOpen(null), []);
  const letter = letters.find((l) => l.id === open);
  const allRead = letters.length > 0 && letters.every((l) => read.has(l.id));

  return (
    <>
      <ul className="b2-envelopes">
        {letters.map((l, i) => (
          <li key={l.id} style={{'--i': i, '--r': `${((i * 37) % 7) - 3}deg`}}>
            <button className={read.has(l.id) ? 'read' : ''} onClick={() => choose(l)}>
              <small>FROM</small>
              <b>{l.fromName}</b>
              {l.fromStreamer && <span>{l.fromStreamer}</span>}
              <em>{read.has(l.id) ? 'READ' : 'UNREAD'}</em>
            </button>
          </li>
        ))}
      </ul>
      {allRead && <p className="b2-allread">ALL LETTERS READ</p>}
      {letter && <OpenLetter l={letter} onClose={close} />}
    </>
  );
}
