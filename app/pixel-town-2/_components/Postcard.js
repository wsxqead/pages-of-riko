'use client';
import {useEffect, useRef} from 'react';
import {regionsById} from '@/data/pixelTown2/regions';
import {getResident} from '@/data/pixelTown2/residents';
import {encounters} from '@/data/pixelTown2/encounters';

// 사진을 열면: 원본 비율 그대로의 엽서 — 날짜 / 지역 / 함께 있던 사람 / 관련 장면
export default function Postcard({photo, onClose}) {
  const close = useRef(null);
  useEffect(() => {
    close.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const region = regionsById[photo.region];
  const enc = encounters.find((e) => e.id === photo.encounter);
  return (
    <div className="pt-postcard-wrap" role="dialog" aria-modal="true" aria-label="기억 사진" onClick={onClose}>
      <figure className="pt-postcard" onClick={(e) => e.stopPropagation()}>
        <img src={photo.src} alt={photo.caption || '픽크타2 사진'} width={photo.width} height={photo.height} />
        <figcaption>
          <div>
            <b>{region ? region.name : 'PIXEL CREATOR TOWN 2'}</b>
            {photo.date && <time>{photo.date}</time>}
          </div>
          {photo.caption && <p>{photo.caption}</p>}
          {photo.people?.length > 0 && <p className="with">함께: {photo.people.map((p) => getResident(p)?.name).filter(Boolean).join(', ')}</p>}
          {enc && <p className="with">기억: {enc.title}</p>}
          <button ref={close} onClick={onClose}>닫기 ✕</button>
        </figcaption>
      </figure>
    </div>
  );
}
