'use client';
import {useCallback, useEffect, useRef, useState} from 'react';
import {groupPhotos} from '@/data/bongnudo1/meta';
import {useSide} from './Shell';

// 서로 비율이 다른 실제 단체사진 두 장을 책상 위에 겹쳐 둔다.
// 앞뒤 순서는 DUAL SIDE 렌즈(useSide)를 그대로 따른다. 이미지는 절대 자르지 않는다.
const ORDER = ['police', 'chilssang'];

export const hasGroupPhotos = ORDER.some((k) => groupPhotos[k]?.src);

function Print({kind, photo, onOpen}) {
  const ratio = `${photo.width} / ${photo.height}`;
  return (
    <figure className={`b1-gphoto ${kind}`} data-group={kind} style={{'--mw': photo.maxWidth + '%'}}>
      {kind === 'chilssang' && <span className="b1-tape" aria-hidden="true" />}
      {photo.src ? (
        <button className="b1-gphoto-img" onClick={() => onOpen(kind)} aria-label={`${photo.alt} 원본 크게 보기`}>
          <img
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            style={{objectPosition: photo.objectPosition}}
            decoding="async"
          />
        </button>
      ) : (
        <div className="b1-gphoto-empty" style={{aspectRatio: ratio}}>
          <span>사진 자리</span>
          <small>PHOTO PENDING</small>
        </div>
      )}
      <figcaption>{photo.caption}</figcaption>
    </figure>
  );
}

function Lightbox({photo, onClose}) {
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="b1-lightbox" role="dialog" aria-modal="true" aria-label={photo.alt} onClick={onClose}>
      <figure onClick={(e) => e.stopPropagation()}>
        <img
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          // 원본 비율 그대로, 화면에 맞게 (작은 원본은 최대 1.75배까지만 확대)
          style={{width: `min(92vw, calc(78vh * ${photo.width / photo.height}), ${Math.round(photo.width * 1.75)}px)`}}
        />
        <figcaption>
          <span>{photo.caption}</span>
          <button ref={closeRef} onClick={onClose}>CLOSE ✕</button>
        </figcaption>
      </figure>
    </div>
  );
}

export default function GroupPhotos() {
  const {side} = useSide();
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);
  return (
    <div className={'b1-gphotos lens-' + side}>
      {ORDER.map((k) => (
        <Print key={k} kind={k} photo={groupPhotos[k]} onOpen={setOpen} />
      ))}
      <p className="b1-gphotos-note">첨부 기록사진 2매 · 사진을 누르면 원본 전체를 볼 수 있습니다</p>
      {open && <Lightbox photo={groupPhotos[open]} onClose={close} />}
    </div>
  );
}
