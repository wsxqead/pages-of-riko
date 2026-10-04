'use client';
import Link from 'next/link';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {people, getPerson} from '@/data/bongnudo1/people';
import {phases, linkAt, linkHistory, ties} from '@/data/bongnudo1/relationships';
import {groups, relationTypes, linkStates, priorities, yuja} from '@/data/bongnudo1/meta';
import {mediaForPerson} from '@/data/bongnudo1/media';
import {useSide} from './Shell';
import {Photo, Clips} from './Media';

const TIER = {core: 0, important: 1, extended: 2};
// 그룹별 열 위치(x%). 경찰은 왼쪽, 칠쌍파는 오른쪽, 청룡은 그 바깥.
const COLUMN_X = {police: [31, 19, 7], chilssang: [69, 79, 79], cheongryong: [90, 90, 90]};
const BOTTOM = ['ems', 'other'];
const GROUP_ORDER = ['police', 'chilssang', 'cheongryong', 'ems', 'other'];
const SCOPES = [
  {id: 0, label: 'CORE'},
  {id: 1, label: '+ IMPORTANT'},
  {id: 2, label: '+ EXTENDED'},
];

function spread(n, a, b, maxGap = 15) {
  if (n === 1) return [(a + b) / 2];
  const gap = Math.min((b - a) / (n - 1), maxGap);
  const start = (a + b) / 2 - (gap * (n - 1)) / 2;
  return Array.from({length: n}, (_, i) => start + gap * i);
}

function interleave(list) {
  const buckets = GROUP_ORDER.map((g) => list.filter((v) => v.p.group === g));
  const out = [];
  while (buckets.some((b) => b.length)) buckets.forEach((b) => b.length && out.push(b.shift()));
  return out;
}

// phase에 따라 사람들의 자리를 계산한다 (단위: %)
function layout(phase, visible) {
  const pos = {__yuja: {x: phase.yujaX ?? 50, y: phase.split ? 74 : 50}};
  if (phase.converge) {
    // 마지막 날: 소속별 열이 풀리고, 모두 정유자를 둘러싼 하나의 원으로 모인다.
    const ring = (list, rx, ry, offset) =>
      interleave(list).forEach((v, i, arr) => {
        const a = -Math.PI / 2 + offset + (i / arr.length) * Math.PI * 2;
        pos[v.p.id] = {x: 50 + rx * Math.cos(a), y: 50 + ry * Math.sin(a)};
      });
    const inner = visible.filter((v) => v.p.priority === 'core');
    const outer = visible.filter((v) => v.p.priority !== 'core');
    ring(inner, 21, 29, 0);
    ring(outer, 38, 41, outer.length ? Math.PI / outer.length : 0);
    return pos;
  }
  const bands = phase.split ? {north: [11, 35], south: [58, 92]} : {all: [10, 90]};
  const cols = {};
  for (const v of visible) {
    const band = phase.split ? (v.link.side === 'north' ? 'north' : 'south') : 'all';
    const bottom = BOTTOM.includes(v.p.group);
    const x = bottom ? null : COLUMN_X[v.p.group][TIER[v.p.priority]];
    const key = (bottom ? 'bottom' : v.p.group + x) + '|' + band;
    (cols[key] ||= {x, band, bottom, list: []}).list.push(v);
  }
  for (const c of Object.values(cols)) {
    if (c.bottom) {
      const y = phase.split ? (c.band === 'north' ? 35 : 95) : 93;
      spread(c.list.length, 42, 58, 9).forEach((x, i) => (pos[c.list[i].p.id] = {x, y}));
    } else {
      const [a, b] = bands[c.band];
      spread(c.list.length, a, b).forEach((y, i) => (pos[c.list[i].p.id] = {x: c.x, y}));
    }
  }
  return pos;
}

// 위치 보간: 사람이 이동하고, 새로 등장하는 사람은 정유자에게서 뻗어 나온다.
function useTween(target, ms = 800) {
  const [cur, setCur] = useState(target);
  const ref = useRef(target);
  useEffect(() => {
    const from = ref.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();
    let raf;
    const step = (now) => {
      const k = reduce ? 1 : Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      const next = {...from};
      for (const id in target) {
        const a = from[id] || from.__yuja || target[id];
        const b = target[id];
        next[id] = {x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e};
      }
      ref.current = next;
      setCur(next);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return cur;
}

function useSize(ref) {
  const [size, setSize] = useState({w: 0, h: 0});
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({w: e.contentRect.width, h: e.contentRect.height}));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

function Edge({a, b, state, group, selected}) {
  const solid = state === 'strong' || state === 'on';
  const cls = `b1-edge s-${state}${selected ? ' sel' : ''}${solid ? ' draw' : ''}`;
  if (state === 'cut') {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const lerp = (t) => ({x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t});
    const p1 = lerp(0.42), p2 = lerp(0.58);
    return (
      <g className={cls} data-group={group}>
        <line x1={a.x} y1={a.y} x2={p1.x} y2={p1.y} />
        <line x1={p2.x} y1={p2.y} x2={b.x} y2={b.y} />
        <path className="b1-edge-break" d={`M${mx - 5} ${my - 5}L${mx + 5} ${my + 5}M${mx + 5} ${my - 5}L${mx - 5} ${my + 5}`} />
      </g>
    );
  }
  return (
    <g className={cls} data-group={group}>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} pathLength={solid ? 1 : undefined} />
    </g>
  );
}

export function PersonPanel({id, phase, onClose}) {
  const p = getPerson(id);
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
  }, [id]);
  if (!p) return null;
  const now = linkAt(id, phase.id);
  const history = linkHistory(id);
  const clips = mediaForPerson(id);
  return (
    <aside className="b1-panel" data-group={p.group} aria-label={`${p.name} 관계 파일`}>
      <button ref={closeRef} className="b1-panel-close" onClick={onClose} aria-label="닫기">CLOSE ✕</button>
      <header>
        <small>{groups[p.group].en} · {priorities[p.priority]}</small>
        <h3>{p.name}</h3>
        {p.aliases?.length > 0 && <p className="alias">다른 표기 · {p.aliases.join(', ')}</p>}
        <p className="role">{p.role}</p>
      </header>
      <Photo photo={p.photo} variant={p.group === 'police' ? 'cctv' : 'polaroid'} cam={groups[p.group].short} className="b1-panel-photo" />
      {p.tags.length > 0 && (
        <ul className="b1-tags">{p.tags.map((t) => <li key={t}>{relationTypes[t] || t}</li>)}</ul>
      )}
      <div className="b1-panel-now" data-state={now?.state || 'none'}>
        <small>{phase.label} · {phase.date}</small>
        <b>{now ? linkStates[now.state] : '아직 만나기 전'}</b>
        {now?.note && <span>{now.note}</span>}
        {phase.split && now && <em>{now.side === 'north' ? 'NORTH · 북부' : 'SOUTH · 남부'}</em>}
      </div>
      <dl className="b1-panel-facts">
        <div><dt>첫 인연</dt><dd>{p.firstMeet}</dd></div>
        <div><dt>정유자와</dt><dd>{p.summary}</dd></div>
      </dl>
      {history.length > 0 && (
        <section>
          <h4>관계의 흐름</h4>
          <ol className="b1-history">
            {history.map((h) => (
              <li key={h.phase.id} data-state={h.state} className={h.phase.id === phase.id ? 'cur' : ''}>
                <time>{h.phase.label}</time>
                <b>{linkStates[h.state]}</b>
                {h.raw.note && <span>{h.raw.note}</span>}
              </li>
            ))}
          </ol>
        </section>
      )}
      {p.moments.length > 0 && (
        <section>
          <h4>주요 장면</h4>
          <ul className="b1-moments">
            {p.moments.map((m, i) => (
              <li key={i}>
                <time>{m.date}</time>
                <span>{m.text}</span>
                {m.incident && <Link href={`/bongnudo-1/incidents#${m.incident}`}>CASE →</Link>}
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="b1-panel-last"><small>마지막 관계</small>{p.lastRelation}</p>
      <Clips items={clips} />
      <Link className="b1-panel-more" href={`/bongnudo-1/people/${p.id}`}>인물 파일 전체 보기 →</Link>
    </aside>
  );
}

export default function Network() {
  const {side} = useSide();
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [scope, setScope] = useState(0);
  const [selected, setSelected] = useState(null);
  const [mTab, setMTab] = useState('all');
  const phase = phases[phaseIdx];
  const box = useRef(null);
  const {w, h} = useSize(box);

  const inScope = useMemo(() => people.filter((p) => TIER[p.priority] <= scope), [scope]);
  const visible = useMemo(
    () => inScope.map((p) => ({p, link: linkAt(p.id, phase.id)})).filter((v) => v.link),
    [inScope, phase],
  );
  const target = useMemo(() => layout(phase, visible), [phase, visible]);
  const pos = useTween(target);
  const visibleIds = useMemo(() => new Set(visible.map((v) => v.p.id)), [visible]);

  // 렌즈를 바꾸면 모바일 탭도 따라간다
  useEffect(() => setMTab(side === 'all' ? 'all' : side), [side]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = useCallback((d) => setPhaseIdx((i) => Math.max(0, Math.min(phases.length - 1, i + d))), []);
  const px = (p) => ({x: (p.x / 100) * w, y: (p.y / 100) * h});
  const Y = pos.__yuja;

  const mobileList = visible.filter((v) =>
    mTab === 'all' ? true : mTab === 'others' ? !['police', 'chilssang'].includes(v.p.group) : v.p.group === mTab,
  );
  const bands = phase.split ? ['north', 'south'] : ['all'];

  return (
    <div className="b1-network" data-phase={phase.id}>
      {/* ── phase 컨트롤 ── */}
      <div className="b1-phasebar">
        <button className="arrow" onClick={() => go(-1)} disabled={phaseIdx === 0} aria-label="이전 시점">←</button>
        <ol role="tablist" aria-label="시점 선택">
          {phases.map((ph, i) => (
            <li key={ph.id}>
              <button role="tab" aria-selected={i === phaseIdx} className={(i === phaseIdx ? 'on ' : '') + (i < phaseIdx ? 'past ' : '') + (ph.split ? 'split' : '')} onClick={() => setPhaseIdx(i)}>
                <b>{ph.label}</b>
                <small>{ph.date}</small>
              </button>
            </li>
          ))}
        </ol>
        <button className="arrow" onClick={() => go(1)} disabled={phaseIdx === phases.length - 1} aria-label="다음 시점">→</button>
      </div>

      <div className="b1-phase-caption" key={phase.id}>
        <small>{phase.date}</small>
        <h2>{phase.title}</h2>
        <p>{phase.caption}</p>
      </div>

      <div className="b1-scope" role="radiogroup" aria-label="인물 범위">
        <span>인물 범위</span>
        {SCOPES.map((s) => (
          <button key={s.id} role="radio" aria-checked={scope === s.id} className={scope === s.id ? 'on' : ''} onClick={() => setScope(s.id)}>{s.label}</button>
        ))}
      </div>

      {/* ── Desktop: 관계 네트워크 ── */}
      <div className={'b1-net' + (phase.split ? ' split' : '') + (phase.converge ? ' converge' : '') + (selected ? ' has-sel' : '')} ref={box}>
        <div className="b1-net-labels" aria-hidden="true">
          <span className="g-police">BONGNUDO POLICE<small>봉누도 경찰</small></span>
          <span className="g-chilssang">CHILSSANG<small>칠쌍파</small></span>
          <span className="g-cheongryong">CHEONGRYONG<small>청룡그룹</small></span>
        </div>
        <div className="b1-net-divider" aria-hidden="true">
          <span className="n">▲ NORTH · 북부</span>
          <span className="s">SOUTH · 남부 ▼</span>
        </div>
        {w > 0 && (
          <svg className="b1-net-svg" width={w} height={h} aria-hidden="true">
            {ties.map(([a, b]) =>
              visibleIds.has(a) && visibleIds.has(b) && pos[a] && pos[b] ? (
                <line key={a + b} className="b1-tie" x1={px(pos[a]).x} y1={px(pos[a]).y} x2={px(pos[b]).x} y2={px(pos[b]).y} />
              ) : null,
            )}
            {visible.map((v) =>
              pos[v.p.id] ? (
                <Edge key={v.p.id + v.link.state} a={px(Y)} b={px(pos[v.p.id])} state={v.link.state} group={v.p.group} selected={selected === v.p.id} />
              ) : null,
            )}
          </svg>
        )}
        {inScope.map((p) => {
          const q = pos[p.id] || Y;
          const vis = visibleIds.has(p.id);
          const link = vis ? visible.find((v) => v.p.id === p.id).link : null;
          return (
            <button
              key={p.id}
              className={'b1-node' + (vis ? ' on' : '') + (selected === p.id ? ' sel' : '')}
              data-group={p.group}
              data-state={link?.state}
              data-priority={p.priority}
              style={{left: q.x + '%', top: q.y + '%'}}
              tabIndex={vis ? 0 : -1}
              aria-hidden={!vis}
              onClick={() => setSelected(p.id)}
              title={link?.note}
            >
              <i className="mark">{p.name[0]}</i>
              <span>{p.name}</span>
            </button>
          );
        })}
        <div className="b1-node yuja" style={{left: Y.x + '%', top: Y.y + '%'}}>
          <b>{yuja.name}</b>
          <small key={phase.id}>{phase.status}</small>
        </div>
      </div>

      {/* ── Mobile: 정유자 중심 단계적 목록 ── */}
      <div className="b1-mnet">
        <div className="b1-mnet-yuja">
          <b>{yuja.name}</b>
          <small>{phase.status}</small>
        </div>
        <div className="b1-mnet-tabs" role="tablist">
          {[['all', '전체'], ['police', '경찰'], ['chilssang', '칠쌍파'], ['others', '청룡 · 기타']].map(([k, l]) => (
            <button key={k} role="tab" aria-selected={mTab === k} className={mTab === k ? 'on' : ''} onClick={() => setMTab(k)}>{l}</button>
          ))}
        </div>
        {bands.map((band) => {
          const list = mobileList.filter((v) => band === 'all' || (band === 'north' ? v.link.side === 'north' : v.link.side !== 'north'));
          return (
            <section key={band} className={'b1-mnet-band ' + band}>
              {band !== 'all' && <h4>{band === 'north' ? '▲ NORTH · 북부' : 'SOUTH · 남부 ▼'}</h4>}
              {list.length === 0 && <p className="empty">이 시점에 연결된 사람이 없습니다.</p>}
              <ul>
                {list.map((v) => (
                  <li key={v.p.id}>
                    <button data-group={v.p.group} data-state={v.link.state} onClick={() => setSelected(v.p.id)}>
                      <i className="mark">{v.p.name[0]}</i>
                      <span className="nm"><b>{v.p.name}</b><small>{v.p.role}</small></span>
                      <span className="ln"><i /><em>{linkStates[v.link.state]}{v.link.note ? ` · ${v.link.note}` : ''}</em></span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <ul className="b1-legend" aria-label="연결 상태 범례">
        {Object.entries(linkStates).map(([k, l]) => (
          <li key={k} data-state={k}><i />{l}</li>
        ))}
      </ul>

      {selected && (
        <>
          <div className="b1-panel-scrim" onClick={() => setSelected(null)} />
          <PersonPanel id={selected} phase={phase} onClose={() => setSelected(null)} />
        </>
      )}
    </div>
  );
}
