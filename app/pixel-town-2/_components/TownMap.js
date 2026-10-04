'use client';
import {useEffect, useRef, useState} from 'react';
import {mapSlots, mapRoads, regions, regionsById, regionPosition, enLabel} from '@/data/pixelTown2/regions';
import {residentsOf} from '@/data/pixelTown2/residents';
import {encountersIn} from '@/data/pixelTown2/encounters';
import {photosIn} from '@/data/pixelTown2/media';

// MEMORY MAP — 실제 게임 월드가 아니라 기억을 탐색하기 위한 추상 지도 (NOT TO SCALE)
const W = 1200;
const H = 760;
const OVERVIEW = [0, 0, W, H];
const slotOwner = Object.fromEntries(regions.map((r) => [r.slot, r]));

// 장식용 나무/구름 (실제 랜드마크 아님)
const TREES = [[70, 260], [95, 285], [270, 250], [500, 250], [520, 470], [730, 260], [940, 270], [960, 480], [300, 480], [760, 700], [1130, 300], [80, 690], [580, 500], [1150, 540], [320, 90]];
const CLOUDS = [[150, 60, 70], [700, 50, 90], [1080, 80, 60], [960, 730, 70]];
// 이름표가 겹치지 않도록 두 줄로 엇갈려 배치
// 주민이 적은 구역은 구역 아래 가운데로 모은다
const FEW_PINS = {1: [[0, 78]], 2: [[-50, 80], [50, 80]], 3: [[-72, 74], [0, 102], [72, 74]]};
const PIN_OFFSETS = [[-120, 58], [-60, 100], [0, 58], [60, 100], [120, 58], [-90, 142], [90, 142]];

const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const routeD = (a, b) => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - Math.abs(a.x - b.x) * 0.16 - 30;
  return `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`;
};
const markerAt = (r) => {
  const p = regionPosition(r);
  return {x: p.x - 66, y: p.y + 14};
};

function focusBox(regionId) {
  if (!regionId) return OVERVIEW;
  const p = regionPosition(regionsById[regionId]);
  const w = 560;
  const h = (w * H) / W;
  const x = Math.max(0, Math.min(W - w, p.x - w / 2));
  const y = Math.max(0, Math.min(H - h, p.y - h / 2 + 30));
  return [x, y, w, h];
}

function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => setR(window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);
  return r;
}

// 카메라: viewBox를 부드럽게 옮긴다
function useCamera(target, reduced) {
  const [box, setBox] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const from = cur.current;
    const t0 = performance.now();
    const ms = reduced ? 0 : 950;
    let raf;
    const step = (now) => {
      const k = ms ? Math.min(1, (now - t0) / ms) : 1;
      const e = ease(k);
      const next = from.map((v, i) => v + (target[i] - v) * e);
      cur.current = next;
      setBox(next);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.join(',')]);
  return box;
}

// 리코 마커: 지역이 바뀌면 길을 따라 이동하고, 지나온 길은 점선 발자국으로 남는다
function useTraveler(regionId, reduced) {
  const [pos, setPos] = useState(() => markerAt(regionsById[regionId]));
  const [route, setRoute] = useState(null); // {d, progress}
  const [trails, setTrails] = useState([]);
  const from = useRef(regionId);
  const pathRef = useRef(null);
  useEffect(() => {
    const a = from.current;
    if (a === regionId) return;
    const pa = markerAt(regionsById[a]);
    const pb = markerAt(regionsById[regionId]);
    const d = routeD(pa, pb);
    from.current = regionId;
    if (reduced) {
      setPos(pb);
      setTrails((t) => [...t, d]);
      return;
    }
    setRoute({d, progress: 0});
    let raf;
    const t0 = performance.now();
    const ms = 1300;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      const e = ease(k);
      const el = pathRef.current;
      if (el && el.getAttribute('d') === d) {
        const len = el.getTotalLength();
        const pt = el.getPointAtLength(len * e);
        setPos({x: pt.x, y: pt.y});
      }
      setRoute({d, progress: e});
      if (k < 1) raf = requestAnimationFrame(step);
      else {
        setRoute(null);
        setTrails((t) => (t.includes(d) ? t : [...t, d]));
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [regionId, reduced]);
  return {pos, route, trails, pathRef};
}

function House({x, y, s = 1, tone = 'a'}) {
  return (
    <g className={'pt-house ' + tone} transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-12" y="-8" width="24" height="18" />
      <path d="M-15 -8 L0 -21 L15 -8 Z" />
      <rect className="door" x="-3" y="2" width="6" height="8" />
    </g>
  );
}

function activate(fn) {
  return {
    onClick: fn,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fn();
      }
    },
  };
}

export default function TownMap({
  focus = null,
  rikoRegion = 'sepia',
  onSelectRegion,
  onSelectResident,
  visitedRegions = [],
  metResidents = [],
  interactive = true,
  zoomable = true,
  showTrails = true,
  finale = false,
}) {
  const reduced = useReduced();
  const box = useCamera(zoomable ? focusBox(focus) : OVERVIEW, reduced);
  const {pos, route, trails, pathRef} = useTraveler(rikoRegion, reduced);
  const zoomed = zoomable && focus;

  return (
    <div className={'pt-map' + (zoomed ? ' zoomed' : '') + (finale ? ' finale' : '')}>
      <svg viewBox={box.join(' ')} role="group" aria-label="픽크타2 메모리 맵 (실제 축척 아님)">
        <defs>
          <pattern id="pt-grass" width="24" height="24" patternUnits="userSpaceOnUse">
            <rect width="24" height="24" fill="#c9e8ad" />
            <rect x="2" y="3" width="6" height="6" fill="#bfe09f" />
            <rect x="14" y="13" width="6" height="6" fill="#d3eebb" />
          </pattern>
          <pattern id="pt-plot" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill="#f3f7e6" />
            <rect width="8" height="8" fill="#ecf3dc" />
            <rect x="8" y="8" width="8" height="8" fill="#ecf3dc" />
          </pattern>
        </defs>

        {/* 바다/하늘과 섬 — 장식 */}
        <rect x="-400" y="-400" width={W + 800} height={H + 800} className="pt-sea" />
        <path className="pt-land" d="M70 120 Q120 40 300 60 Q520 20 760 50 Q1000 40 1120 110 Q1190 200 1170 360 Q1190 560 1130 680 Q1020 750 760 735 Q520 755 300 735 Q110 730 60 620 Q20 460 40 300 Q40 190 70 120 Z" />
        {CLOUDS.map(([x, y, r], i) => (
          <g key={i} className="pt-cloud" aria-hidden="true">
            <ellipse cx={x} cy={y} rx={r} ry={r * 0.32} />
            <ellipse cx={x + r * 0.35} cy={y - r * 0.18} rx={r * 0.5} ry={r * 0.3} />
          </g>
        ))}

        {/* 장식용 길 */}
        <g className="pt-roads" aria-hidden="true">
          {mapRoads.map(([a, b]) => (
            <line key={a + '-' + b} x1={mapSlots[a].x} y1={mapSlots[a].y} x2={mapSlots[b].x} y2={mapSlots[b].y} />
          ))}
        </g>
        {TREES.map(([x, y], i) => (
          <g key={i} className="pt-tree" transform={`translate(${x} ${y})`} aria-hidden="true">
            <rect x="-2" y="2" width="4" height="8" />
            <rect className="leaf" x="-9" y="-12" width="18" height="16" />
          </g>
        ))}

        {/* 지나온 길 (이번 방문에서 리코 마커가 이동한 경로) */}
        {showTrails && trails.map((d) => <path key={d} d={d} className="pt-trail" />)}
        {route && <path d={route.d} className="pt-route" pathLength="1" style={{strokeDashoffset: 1 - route.progress}} />}
        <path ref={pathRef} d={route?.d || 'M0 0'} fill="none" stroke="none" />

        {/* 16개 거주 구역 */}
        {mapSlots.map((p, i) => {
          const r = slotOwner[i];
          if (!r) return null;
          const residents = residentsOf(r.id).filter((x) => !x.player);
          const enc = encountersIn(r.id).length;
          const ph = photosIn(r.id).length;
          const isFocus = focus === r.id;
          const visited = visitedRegions.includes(r.id);
          const major = r.kind !== 'town';
          return (
            <g key={i} className={'pt-plot named kind-' + r.kind + (isFocus ? ' focus' : '') + (visited ? ' visited' : '') + (r.kind === 'home' ? ' is-home' : '')} transform={`translate(${p.x} ${p.y})`}>
              <g
                className="pt-plot-hit"
                {...(interactive
                  ? {role: 'button', tabIndex: 0, 'aria-label': `${r.name} 지역 보기`, 'aria-pressed': isFocus, ...activate(() => onSelectRegion?.(r.id))}
                  : {'aria-label': r.name})}
              >
                {major ? (
                  <>
                    <rect className="ground" x="-82" y="-48" width="164" height="108" rx="16" />
                    <House x={-40} y={6} tone="a" />
                    <House x={0} y={-6} s={1.1} tone="b" />
                    <House x={42} y={8} tone="c" />
                  </>
                ) : (
                  <>
                    <rect className="ground" x="-66" y="-38" width="132" height="86" rx="14" />
                    <House x={-20} y={6} s={0.85} tone="d" />
                    <House x={22} y={10} s={0.8} tone="d" />
                  </>
                )}
                {/* 표지판: 한글명이 주 표시, 로마자는 보조 */}
                <g className="pt-sign" transform={`translate(0 ${major ? -64 : -52})`}>
                  <rect className="post" x="-2" y="0" width="4" height="16" />
                  {enLabel(r) ? (
                    <>
                      <rect className="board" x={-48} y={-32} width={96} height={34} rx="5" />
                      <text className="ko" y="-13">{r.name}</text>
                      <text className="en" y="-3">{enLabel(r)}</text>
                    </>
                  ) : (
                    <>
                      <rect className="board" x={-44} y={-26} width={88} height={28} rx="5" />
                      <text className="ko" y="-7">{r.name}</text>
                    </>
                  )}
                  {r.kind === 'featured' && <circle className="feat" cx="41" cy="-24" r="6" />}
                </g>
                {r.kind === 'home' && (
                  <g className="pt-homeflag" transform="translate(70 -44)">
                    <rect x="-1" y="0" width="3" height="26" />
                    <path d="M2 0 L24 6 L2 12 Z" />
                    <text x="9" y="9">★</text>
                  </g>
                )}
              </g>
              {/* 주민 핀 — 같은 구역에 살았던 사람 */}
              {residents.map((res, k) => {
                const [dx, dy] = (FEW_PINS[residents.length] || PIN_OFFSETS)[k % PIN_OFFSETS.length];
                return (
                  <g
                    key={res.id}
                    className={'pt-respin ' + res.tier + (metResidents.includes(res.id) ? ' met' : '')}
                    transform={`translate(${dx} ${dy})`}
                    {...(interactive
                      ? {role: 'button', tabIndex: 0, 'aria-label': `주민 ${res.name} 카드 열기`, ...activate(() => onSelectResident?.(res.id))}
                      : {'aria-label': `주민 ${res.name}`})}
                  >
                    <circle r="12" />
                    <text className="ini" y="4">{res.name[0]}</text>
                    <text className="nm" y="27">{res.name}</text>
                  </g>
                );
              })}
              {(enc > 0 || ph > 0) && (
                <g className="pt-badges" transform="translate(60 -70)" aria-hidden="true">
                  {enc > 0 && (<g><rect x="0" y="0" width="34" height="18" rx="9" className="enc" /><text x="17" y="13">! {enc}</text></g>)}
                  {ph > 0 && (<g transform="translate(0 22)"><rect x="0" y="0" width="34" height="18" rx="9" className="ph" /><text x="17" y="13">◉ {ph}</text></g>)}
                </g>
              )}
            </g>
          );
        })}

        {/* 리코 마커 — 탐색 위치 표시 (실제 게임 위치 아님) */}
        <g className={'pt-riko' + (route ? ' moving' : '')} transform={`translate(${pos.x} ${pos.y})`} aria-hidden="true">
          <ellipse className="shadow" cx="0" cy="16" rx="10" ry="3" />
          <path className="pin" d="M0 14 C-12 0 -12 -8 -12 -12 A12 12 0 1 1 12 -12 C12 -8 12 0 0 14 Z" />
          <text className="r" y="-8">R</text>
          {!route && (
            <g className="label" transform="translate(0 -34)">
              <rect x="-46" y="-12" width="92" height="18" rx="9" />
              <text y="1">{finale ? 'RIKO WAS HERE' : 'YOU ARE HERE'}</text>
            </g>
          )}
        </g>
      </svg>
      <span className="pt-map-stamp" aria-hidden="true">MEMORY MAP · NOT TO SCALE</span>
      <span className="pt-compass" aria-hidden="true"><b>N</b></span>
    </div>
  );
}
