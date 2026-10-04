'use client';
import {useCallback, useEffect, useRef, useState, useSyncExternalStore} from 'react';
import {server, player} from '@/data/pixelTown2/meta';
import {regionsById, primaryRegions, otherRegions, enLabel} from '@/data/pixelTown2/regions';
import {residents, residentsOf} from '@/data/pixelTown2/residents';
import {encountersIn, rikoStories, storiesWithResidentsOf} from '@/data/pixelTown2/encounters';
import Stories from './_components/Stories';
import {photosIn} from '@/data/pixelTown2/media';
import {getPage} from '@/data/pages';
import {readWelcomed, markWelcomed, readVisits, addVisit} from '@/lib/pct2Session';
import TownMap from './_components/TownMap';
import ResidentCard from './_components/ResidentCard';
import Postcard from './_components/Postcard';

const logo = getPage('pixel-town-2')?.logo;
const noSub = () => () => {};
// ◀ ▶ 이동 순서: 마을 전체 → 주요 지역(세피아·미스론·아르시안) → 그 외 지역
const STOPS = [null, ...primaryRegions.map((r) => r.id), ...otherRegions.map((r) => r.id)];
const TAG = {home: '★ HOME REGION', featured: '● FEATURED RESIDENT', town: 'RESIDENTIAL DISTRICT'};

function useNarrow() {
  const [n, setN] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 860px)');
    const on = () => setN(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return n;
}

function Overview({onSelect}) {
  const featured = residents.filter((r) => r.tier === 'featured');
  const stories = rikoStories();
  return (
    <div className="pt-panel-body" key="overview">
      <header className="pt-region-sign">
        <small>TOWN OVERVIEW</small>
        <h2>마을 전체</h2>
        <p>{server.totalRegions}개의 거주 구역</p>
      </header>
      <p className="pt-rule">{server.movingRule} 그래서 사람들은 서로 다른 마을에 흩어져 살았고, 만나려면 길을 건너야 했다.</p>
      <h3>주요 지역</h3>
      <ul className="pt-region-list">
        {primaryRegions.map((r) => (
          <li key={r.id}>
            <button onClick={() => onSelect(r.id)}>
              <b>{r.name}</b>{enLabel(r) && <span>{enLabel(r)}</span>}<small>{r.tagline}</small>
            </button>
          </li>
        ))}
      </ul>
      <h3>그 외 거주 구역 <small>{otherRegions.length}</small></h3>
      <ul className="pt-town-chips">
        {otherRegions.map((r) => (
          <li key={r.id}><button onClick={() => onSelect(r.id)}>{r.name}</button></li>
        ))}
      </ul>
      <h3>FEATURED RESIDENTS</h3>
      <ul className="pt-featured">
        {featured.map((r) => (
          <li key={r.id}>
            <span className="dot" aria-hidden="true">{r.name[0]}</span>
            <b>{r.name}</b>
            <small>{regionsById[r.homeRegion]?.name}</small>
          </li>
        ))}
      </ul>
      {stories.length > 0 && (
        <>
          <h3>TOWN STORIES <small>{stories.length}</small></h3>
          <Stories stories={stories} compact />
        </>
      )}
      <h3>SERVER</h3>
      <dl className="pt-facts">
        <div><dt>기간</dt><dd>{server.startLabel} — {server.endLabel}<small>{server.restDay.slice(5).replace('.', '/')} 서버 휴식</small></dd></div>
        <div><dt>참여</dt><dd>{server.participants}명</dd></div>
        <div><dt>거주 구역</dt><dd>{server.totalRegions}곳<small>구역당 최대 {server.regionCapacity}명</small></dd></div>
        <div><dt>버전</dt><dd>{server.version}</dd></div>
        <div><dt>플랫폼</dt><dd>{server.platform}</dd></div>
      </dl>
      <p className="pt-rule">{server.predecessor}</p>
      <h3>TOWN SYSTEMS</h3>
      <ul className="pt-systems">{server.systems.map((s) => <li key={s}>{s}</li>)}</ul>
    </div>
  );
}

function RegionView({region, onResident, onPhoto}) {
  const people = residentsOf(region.id); // 카드가 있는 주민 (리코와 관련성이 높은 사람)
  const carded = new Set(people.map((p) => p.name));
  const others = (region.roster || []).filter((n) => !carded.has(n));
  const enc = encountersIn(region.id);
  const visits = enc.filter((e) => e.type === 'visit');
  const memories = enc.filter((e) => e.type !== 'visit');
  const residentStories = storiesWithResidentsOf(people.filter((p) => !p.player).map((p) => p.id)).filter((e) => e.location !== region.id);
  const photos = photosIn(region.id);
  const home = region.kind === 'home';
  return (
    <div className="pt-panel-body" key={region.id}>
      <header className={'pt-region-sign' + (home ? ' is-home' : '') + (region.kind === 'town' ? ' is-town' : '')}>
        <small>{TAG[region.kind]}</small>
        <h2>{region.name}{enLabel(region) && <span>{enLabel(region)}</span>}</h2>
        <p>{region.tagline || (region.roster ? `RESIDENTS ${region.roster.length}` : 'PIXEL CREATOR TOWN 2')}</p>
      </header>
      {region.note && <p className="pt-rule">{region.note}</p>}
      {!home && <p className="pt-hint">지도 위 리코 마커는 탐색 위치 표시입니다. 실제 방문 기록은 아래 VISITS에만 적힙니다.</p>}

      {region.roster ? (
        <>
          <h3>RESIDENTS <small>{region.roster.length}</small></h3>
          <ul className="pt-res-list">
            {people.map((r, i) => (
              <li key={r.id} style={{'--i': i}}>
                <button onClick={() => onResident(r.id)}>
                  <span className="dot" aria-hidden="true">{r.name[0]}</span>
                  <b>{r.name}</b>
                  {r.player ? <em className="you">RIKO</em> : r.tier === 'featured' && <em>FEATURED</em>}
                </button>
              </li>
            ))}
          </ul>
          {others.length > 0 && (
            <details className="pt-others">
              <summary>OTHER RESIDENTS <b>{others.length}</b></summary>
              <ul>{others.map((n) => <li key={n}>{n}</li>)}</ul>
            </details>
          )}
        </>
      ) : (
        <p className="pt-rule">픽크타2의 16개 거주 구역 중 하나. 이 전시에서는 리코와 이어진 사람들이 사는 곳을 중심으로 소개합니다.</p>
      )}

      {memories.length > 0 && (
        <>
          <h3>RIKO&apos;S MEMORIES HERE <small>{memories.length}</small></h3>
          <Stories stories={memories} compact />
        </>
      )}
      {residentStories.length > 0 && (
        <>
          <h3>이 마을 사람들과 이어진 이야기</h3>
          <p className="pt-hint">이 지역은 이야기 속 인물이 사는 곳입니다. 이야기가 일어난 장소는 따로 기록되지 않았습니다.</p>
          <Stories stories={residentStories} compact />
        </>
      )}

      {visits.length > 0 && (
        <>
          <h3>VISITS</h3>
          <ul className="pt-mem-list">{visits.map((e) => <li key={e.id}>{e.date && <time>{e.date}</time>}<b>{e.title}</b></li>)}</ul>
        </>
      )}
      {photos.length > 0 && (
        <>
          <h3>PHOTOS <small>{photos.length}</small></h3>
          <ul className="pt-photo-pins">
            {photos.map((p) => (
              <li key={p.id}><button onClick={() => onPhoto(p)}><img src={p.src} alt={p.caption || ''} loading="lazy" /></button></li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function Town() {
  const welcomed = useSyncExternalStore(noSub, readWelcomed, () => false);
  const narrow = useNarrow();
  const [focus, setFocus] = useState(null);
  const [rikoRegion, setRikoRegion] = useState(player.homeRegion);
  const [resident, setResident] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [toast, setToast] = useState(null);
  const [visits, setVisits] = useState({regions: [], residents: [], encounters: [], photos: []});
  const mapRef = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    setVisits(readVisits());
    const t = setTimeout(markWelcomed, 1600);
    const h = decodeURIComponent(location.hash.slice(1));
    if (regionsById[h]) {
      setFocus(h);
      setRikoRegion(h);
      setVisits(addVisit('regions', h));
      setTimeout(() => mapRef.current?.scrollIntoView({block: 'start'}), 50);
    }
    return () => {
      clearTimeout(t);
      clearTimeout(toastTimer.current);
    };
  }, []);

  const select = useCallback((id) => {
    setFocus(id);
    if (id) {
      setRikoRegion(id);
      let v = addVisit('regions', id);
      // 처음 여는 장면이 있으면 NEW ENCOUNTER
      const fresh = encountersIn(id).find((e) => !v.encounters.includes(e.id));
      if (fresh) {
        v = addVisit('encounters', fresh.id);
        setToast(fresh);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 2600);
      }
      setVisits(v);
    }
    history.replaceState(null, '', id ? '#' + id : location.pathname);
  }, []);

  const openResident = useCallback((id) => {
    setResident(id);
    setVisits(addVisit('residents', id));
  }, []);
  const closeResident = useCallback(() => setResident(null), []);
  const openPhoto = useCallback((p) => {
    setPhoto(p);
    setVisits(addVisit('photos', p.id));
  }, []);
  const closePhoto = useCallback(() => setPhoto(null), []);

  const enter = () => {
    mapRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
    select(player.homeRegion);
  };
  const step = (d) => {
    const i = STOPS.indexOf(focus);
    select(STOPS[(i + d + STOPS.length) % STOPS.length]);
  };

  const region = focus && regionsById[focus];

  return (
    <main className="pt-main pt-town">
      {/* ── 환영 표지판 ── */}
      <section className={'pt-welcome' + (welcomed ? '' : ' first')}>
        {logo && <img className="pt-logo" src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} />}
        <p className="pt-welcome-kicker">WELCOME BACK, RIKO</p>
        <div className="pt-welcome-board">
          <dl>
            <div><dt>HOME</dt><dd>세피아</dd></div>
            <div><dt>SERVER</dt><dd>{server.startLabel} — {server.endLabel}</dd></div>
            <div><dt>RESIDENT</dt><dd>{player.en}</dd></div>
          </dl>
        </div>
        <button className="pt-enter" onClick={enter}>ENTER TOWN <span aria-hidden="true">↓</span></button>
        <p className="pt-welcome-note">2주 동안 존재했던 마을. 지금은 기록 속에서 다시 걸어 볼 수 있습니다.</p>
      </section>

      {/* ── 지역 표지판 (텍스트 내비게이션 · 접근성) ── */}
      <section className="pt-explore" ref={mapRef} aria-label="마을 지도 탐색">
        <div className="pt-waysigns" role="toolbar" aria-label="지역 선택">
          <button className="arrow" onClick={() => step(-1)} aria-label="이전 지역">◀</button>
          <button className={!focus ? 'on' : ''} onClick={() => select(null)}>TOWN<small>전체</small></button>
          {primaryRegions.map((r) => (
            <button key={r.id} className={focus === r.id ? 'on' : ''} onClick={() => select(r.id)} aria-pressed={focus === r.id}>
              {r.name}{r.kind === 'home' && ' ★'}<small>{r.kind === 'home' ? "RIKO'S HOME" : 'FEATURED'}</small>
            </button>
          ))}
          <label className={'pt-more' + (focus && regionsById[focus].kind === 'town' ? ' on' : '')}>
            <span>그 외 지역</span>
            <select value={focus && regionsById[focus].kind === 'town' ? focus : ''} onChange={(e) => select(e.target.value || null)} aria-label="그 외 거주 구역 선택">
              <option value="">{otherRegions.length}곳 선택</option>
              {otherRegions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
          <button className="arrow" onClick={() => step(1)} aria-label="다음 지역">▶</button>
        </div>

        <div className="pt-explore-grid">
          <div className="pt-map-wrap">
            <TownMap
              focus={focus}
              rikoRegion={rikoRegion}
              onSelectRegion={select}
              onSelectResident={openResident}
              visitedRegions={visits.regions}
              metResidents={visits.residents}
              zoomable={!narrow}
            />
            {focus && !narrow && <button className="pt-zoomout" onClick={() => select(null)}>− 마을 전체 보기</button>}
          </div>
          <div className="pt-panel" aria-live="polite">
            {region ? <RegionView region={region} onResident={openResident} onPhoto={openPhoto} /> : <Overview onSelect={select} />}
          </div>
        </div>
      </section>

      {resident && <ResidentCard id={resident} onClose={closeResident} />}
      {photo && <Postcard photo={photo} onClose={closePhoto} />}
      <div className={'pt-toast' + (toast ? ' show' : '')} role="status" aria-live="polite">
        {toast && (<><small>NEW ENCOUNTER</small><b>{toast.title}</b><span>{regionsById[toast.location]?.name}</span></>)}
      </div>
    </main>
  );
}
