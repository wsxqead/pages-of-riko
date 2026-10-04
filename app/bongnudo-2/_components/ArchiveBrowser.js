'use client';
import {useEffect, useMemo, useState} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {Clipping} from './ui';

const SHIN = 'shin-ibi';
const FILTERS = [
  {id: 'all', label: 'ALL', ko: '전체'},
  {id: 'shin', label: 'SHIN IBI', ko: '신이비 기사'},
  {id: 'mentions', label: 'MENTIONS', ko: '신이비 등장'},
];

// 검색·필터·정렬 상태는 URL 에 남긴다 (?q=&filter=&reporter=&category=&day=&date=&sort=)
// lockedReporter: 기자별 Archive 에서 쓰면 그 기자의 기사 안에서만 검색/필터한다
export default function ArchiveBrowser({index, facets, pageSize, lockedReporter = null}) {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const get = (k, d = '') => params.get(k) ?? d;

  const [query, setQuery] = useState(get('q') || get('query'));
  const filter = get('filter', 'all');
  const reporter = lockedReporter || get('reporter');
  const category = get('category');
  const day = get('day');
  const date = get('date');
  const sort = get('sort', 'newest');
  const [shown, setShown] = useState(pageSize);

  // 다른 탭/뒤로가기로 URL 이 바뀌면 입력창도 따라간다
  useEffect(() => setQuery(params.get('q') ?? params.get('query') ?? ''), [params]);

  // 항상 "지금 주소"를 기준으로 고친다 (지연된 검색어 반영이 오래된 필터를 되살리지 않게)
  const setParam = (patch) => {
    const next = new URLSearchParams(window.location.search);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    const qs = next.toString();
    router.replace(qs ? `${path}?${qs}` : path, {scroll: false});
    setShown(pageSize);
  };

  // 입력은 바로 반영하고 URL 은 잠깐 뒤에
  useEffect(() => {
    const t = setTimeout(() => {
      const cur = new URLSearchParams(window.location.search);
      if ((cur.get('q') ?? cur.get('query') ?? '') !== query) setParam({q: query, query: ''});
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    let list = index.filter((a) => {
      if (filter === 'shin' && !a.isShinIbiArticle) return false;
      if (filter === 'mentions' && !(a.featuresShinIbi || a.relatedPeople.includes(SHIN))) return false;
      if (reporter && a.reporterKey !== reporter) return false;
      if (category && a.category !== category) return false;
      if (day && String(a.day) !== day) return false;
      if (date && !(a.publishedAt || '').startsWith(date)) return false;
      return terms.every((t) => a.searchText.includes(t));
    });
    if (sort === 'oldest') list = [...list].reverse();
    return list;
  }, [index, query, filter, reporter, category, day, date, sort]);

  const visible = results.slice(0, shown);
  const narrowed = query || filter !== 'all' || (reporter && !lockedReporter) || category || day || date;

  return (
    <section className="b2-archive-browser" aria-label="기사 검색과 목록">
      <div className="b2-search">
        <label className="b2-search-box">
          <span>SEARCH</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목, 본문, 기자, 태그, 인물"
            aria-label="기사 검색"
          />
        </label>
        <div className="b2-filter-row" role="group" aria-label="기사 범위">
          {FILTERS.map((f) => (
            <button key={f.id} className={filter === f.id ? 'on' : ''} aria-pressed={filter === f.id} onClick={() => setParam({filter: f.id === 'all' ? '' : f.id})}>
              {f.label}<small>{f.ko}</small>
            </button>
          ))}
        </div>
        <div className="b2-select-row">
          {!lockedReporter && facets.reporters.length > 1 && (
            <label>
              <span>REPORTER</span>
              <select value={reporter} onChange={(e) => setParam({reporter: e.target.value})}>
                <option value="">모든 기자</option>
                {facets.reporters.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.count})</option>)}
              </select>
            </label>
          )}
          {facets.categories.length > 0 && (
            <label>
              <span>CATEGORY</span>
              <select value={category} onChange={(e) => setParam({category: e.target.value})}>
                <option value="">모든 분류</option>
                {facets.categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          )}
          {facets.days.length > 0 && (
            <label>
              <span>DATE</span>
              <select value={day} onChange={(e) => setParam({day: e.target.value})}>
                <option value="">모든 날</option>
                {facets.days.map((d) => <option key={d} value={d}>DAY {String(d).padStart(2, '0')}</option>)}
              </select>
            </label>
          )}
          <label>
            <span>SORT</span>
            <select value={sort} onChange={(e) => setParam({sort: e.target.value === 'newest' ? '' : e.target.value})}>
              <option value="newest">NEWEST</option>
              <option value="oldest">OLDEST</option>
            </select>
          </label>
        </div>
      </div>

      <p className="b2-result-count" aria-live="polite">
        {narrowed ? `${results.length} CLIPPINGS FOUND` : `${results.length} ARTICLES`}
        {narrowed && <button onClick={() => { setQuery(''); router.replace(path, {scroll: false}); }}>필터 지우기</button>}
      </p>

      {results.length === 0 ? (
        <p className="b2-noresult">이 조건에 맞는 기사가 보관함에 없습니다.</p>
      ) : (
        <ol className="b2-clips">
          {visible.map((a) => (
            <li key={a.id}><Clipping a={a} hideReporter={Boolean(lockedReporter)} /></li>
          ))}
        </ol>
      )}

      {results.length > shown && (
        <button className="b2-more" onClick={() => setShown((n) => n + pageSize)}>
          MORE CLIPPINGS <small>{Math.min(pageSize, results.length - shown)}건 더 보기 · {shown}/{results.length}</small>
        </button>
      )}
    </section>
  );
}
