// 사진/클립 자리. 실제 자료가 없으면 placeholder, 클립은 아예 렌더하지 않는다.

// variant: cctv(경찰 기록 느낌) | polaroid(칠쌍파 앨범 느낌)
export function Photo({photo, variant = 'cctv', cam = 'CAM 01', date, caption, className = ''}) {
  const src = photo?.src;
  const cap = photo?.caption || caption;
  return (
    <figure className={`b1-photo ${variant} ${className}`}>
      <div className="b1-photo-frame">
        {src ? (
          <img src={src} alt={cap || ''} loading="lazy" decoding="async" />
        ) : (
          <div className="b1-photo-empty">
            {variant === 'cctv' ? (
              <>
                <span className="tl">{cam}</span>
                <span className="tr">REC</span>
                <span className="mid">NO FOOTAGE<small>자료 대기</small></span>
                {date && <span className="bl">{date}</span>}
              </>
            ) : (
              <span className="mid">사진 자리<small>PHOTO PENDING</small></span>
            )}
          </div>
        )}
      </div>
      {cap && <figcaption>{cap}</figcaption>}
    </figure>
  );
}

// url이 있는 클립만 받는다 (media.js 의 mediaFor* 사용). 없으면 섹션 자체를 숨김.
export function Clips({items, title = 'CLIPS'}) {
  if (!items?.length) return null;
  return (
    <section className="b1-clips">
      <h4>{title}</h4>
      <ul>
        {items.map((m) => (
          <li key={m.id}>
            <a href={m.url} target="_blank" rel="noreferrer">
              {m.thumbnail && <img src={m.thumbnail} alt="" loading="lazy" />}
              <span>{m.title}</span>
              <small>{m.date}</small>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
