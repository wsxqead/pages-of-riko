'use client';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

// BBS 기사 본문 렌더러 — content 블록을 "원본 순서 그대로" 그린다.
// 기자마다 다른 글/사진/영상의 리듬을 하나의 템플릿으로 재구성하지 않는다.
// 사진: 본문 폭 안에서 원본 비율 그대로(object-fit: contain), lazy, 클릭하면 확대(기사 안의 모든 사진을 순서대로 넘겨 볼 수 있음)
// 영상: 자동재생 없음, preload="none" (재생을 눌러야 불러온다)

function ImageBlock({b, index, onOpen}) {
  if (!b.src) return null;
  const ratio = b.width && b.height ? `${b.width} / ${b.height}` : undefined;
  const tall = b.width && b.height && b.height / b.width > 1.25;
  return (
    <figure className={'b2-figure' + (tall ? ' is-tall' : '')}>
      <button className="b2-figure-btn" onClick={() => onOpen(index)} aria-label={`사진 ${index + 1} 크게 보기${b.caption ? `: ${b.caption}` : ''}`}>
        <img src={b.src} alt={b.alt || b.caption || ''} width={b.width || undefined} height={b.height || undefined} style={{aspectRatio: ratio}} loading="lazy" decoding="async" />
      </button>
      {b.caption && <figcaption>{b.caption}</figcaption>}
    </figure>
  );
}

function VideoBlock({b}) {
  if (!b.src) return null;
  const ratio = b.width && b.height ? `${b.width} / ${b.height}` : undefined;
  return (
    <figure className="b2-video">
      <video controls preload="none" playsInline poster={b.poster || undefined} src={b.src} style={{aspectRatio: ratio}} />
    </figure>
  );
}

function Lightbox({images, at, onMove, onClose}) {
  const btn = useRef(null);
  const img = images[at];
  useEffect(() => {
    btn.current?.focus();
    const k = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onMove(1);
      if (e.key === 'ArrowLeft') onMove(-1);
    };
    window.addEventListener('keydown', k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', k);
      document.body.style.overflow = prev;
    };
  }, [onClose, onMove]);
  return (
    <div className="b2-lightbox" role="dialog" aria-modal="true" aria-label="사진 확대" onClick={onClose}>
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={img.src} alt={img.alt || img.caption || ''} />
        <figcaption>
          <span>{img.caption}</span>
          <span className="b2-lb-nav">
            {images.length > 1 && (
              <>
                <button onClick={() => onMove(-1)} disabled={at === 0} aria-label="이전 사진">←</button>
                <b>{at + 1} / {images.length}</b>
                <button onClick={() => onMove(1)} disabled={at === images.length - 1} aria-label="다음 사진">→</button>
              </>
            )}
            <button ref={btn} onClick={onClose}>닫기 ✕</button>
          </span>
        </figcaption>
      </figure>
    </div>
  );
}

export default function ArticleContent({blocks}) {
  // 확대 보기용: 기사 안의 모든 사진(갤러리 포함)을 원본 순서대로 번호 매긴다
  const {images, indexed} = useMemo(() => {
    const imgs = [];
    const out = blocks.map((b) => {
      if (b.type === 'image' && b.src) return {...b, _i: imgs.push(b) - 1};
      if (b.type === 'gallery') return {...b, images: b.images.filter((im) => im.src).map((im) => ({...im, _i: imgs.push(im) - 1}))};
      return b;
    });
    return {images: imgs, indexed: out};
  }, [blocks]);
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);
  const move = useCallback((d) => setOpen((i) => Math.max(0, Math.min(images.length - 1, i + d))), [images.length]);

  return (
    <>
      <div className="b2-content">
        {indexed.map((b, i) => {
          switch (b.type) {
            case 'paragraph':
              return b.text ? <p key={i}>{b.text}</p> : null;
            case 'heading':
              return b.level >= 3 ? <h3 key={i} className="b2-content-h">{b.text}</h3> : <h2 key={i} className="b2-content-h">{b.text}</h2>;
            case 'quote':
              return (
                <blockquote key={i} className="b2-content-quote">
                  <p>{b.text}</p>
                  {b.cite && <cite>{b.cite}</cite>}
                </blockquote>
              );
            case 'divider':
              return <hr key={i} className="b2-content-hr" />;
            case 'image':
              return <ImageBlock key={i} b={b} index={b._i} onOpen={setOpen} />;
            case 'gallery':
              return (
                <figure key={i} className="b2-gallery">
                  <div className="b2-gallery-grid">
                    {b.images.map((im) => <ImageBlock key={im._i} b={im} index={im._i} onOpen={setOpen} />)}
                  </div>
                  {b.caption && <figcaption>{b.caption}</figcaption>}
                </figure>
              );
            case 'video':
              return <VideoBlock key={i} b={b} />;
            default:
              return null; // 모르는 블록은 그리지 않는다 (데이터는 보존, validate 가 알려 줌)
          }
        })}
      </div>
      {open != null && <Lightbox images={images} at={open} onMove={move} onClose={close} />}
    </>
  );
}
