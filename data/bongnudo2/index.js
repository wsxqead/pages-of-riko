// 봉누도 2 · 데이터 연결 helper
// 화면은 이 함수들만 쓴다. 기사·사람·사건·롤링페이퍼는 id 참조로만 연결되고, 개수는 모두 여기서 계산한다.
// → 기사 858건을 넣어도 화면 코드는 고칠 필요가 없다.

import {articles, toIndexEntry, reporterKey, getArticleImages, getArticleVideos, getArticleThumbnail} from './articles';
import {people, peopleById, getPerson as _getPerson, coreNewsroomIds} from './people';
import {newsroomStories, STORY_TYPES} from './newsroomStories';
import {events} from './events';
import {rollingPapers as realLetters} from './rollingPapers';
import {makeSampleLetters} from './dev/sampleArticles';
import {reporter} from './meta';

// 개발 전용 샘플 편지 (production 에서는 절대 포함되지 않음)
const rollingPapers =
  process.env.NODE_ENV !== 'production' && Number(process.env.NEXT_PUBLIC_BBS_DEV_SAMPLE || 0) ? [...realLetters, ...makeSampleLetters()] : realLetters;

export {articles, people, events, rollingPapers, newsroomStories, STORY_TYPES, getArticleImages, getArticleVideos, getArticleThumbnail, reporterKey};
export const SHIN = reporter.id;

const byDateDesc = (a, b) =>
  (b.publishedAt || '').localeCompare(a.publishedAt || '') || String(b.originalId ?? b.id).localeCompare(String(a.originalId ?? a.id), undefined, {numeric: true});

// 시간순(오래된 → 최신) 전체 목록: 이전/다음 기사 이동에 쓴다
const chronological = [...articles].sort((a, b) => -byDateDesc(a, b));
const position = new Map(chronological.map((a, i) => [a.id, i]));

const articleMap = new Map(articles.map((a) => [a.id, a]));
// 원본 BBS ID 로도 찾을 수 있게
articles.forEach((a) => a.originalId != null && !articleMap.has(String(a.originalId)) && articleMap.set(String(a.originalId), a));

// ── 기사 ─────────────────────────────
export const getArticle = (id) => articleMap.get(String(id)) || null;
export const getArticlesByReporter = (key) => articles.filter((a) => reporterKey(a) === key).sort(byDateDesc);
export const getArticlesByPerson = (personId) =>
  articles.filter((a) => a.relatedPeople.includes(personId) || a.authorId === personId).sort(byDateDesc);
export const getArticlesByDate = (date) => articles.filter((a) => a.publishedAt?.slice(0, 10) === date).sort(byDateDesc);
export const getArticlesByDay = (day) => articles.filter((a) => a.day === day).sort(byDateDesc);
export const getArticlesByEvent = (eventId) => {
  const ev = events.find((e) => e.id === eventId);
  const ids = new Set(ev?.articleIds?.map(String) || []);
  return articles.filter((a) => ids.has(a.id) || a.relatedEvents.includes(eventId)).sort(byDateDesc);
};
export const getShinIbiArticles = () => articles.filter((a) => a.isShinIbiArticle).sort(byDateDesc);
export const getArticlesMentioningShinIbi = () => articles.filter((a) => a.featuresShinIbi || a.relatedPeople.includes(SHIN)).sort(byDateDesc);
export const getFeaturedArticles = () => articles.filter((a) => a.featured).sort(byDateDesc);
export const getArticlesWithMedia = () => articles.filter((a) => a._images.length || a._videos.length).sort(byDateDesc);
export const getLatestArticles = (n = 6) => [...articles].sort(byDateDesc).slice(0, n);
export const firstShinIbiArticle = () => [...getShinIbiArticles()].reverse()[0] || null;

// 이전/다음 기사 (시간순 — 날짜가 없으면 원본 ID 순)
export function adjacentArticles(a) {
  const i = position.get(a.id);
  return {prev: i > 0 ? chronological[i - 1] : null, next: i < chronological.length - 1 ? chronological[i + 1] : null};
}

export function relatedArticles(a, n = 4) {
  const seen = new Set([a.id]);
  const pick = (list) => list.filter((x) => !seen.has(x.id) && seen.add(x.id));
  const key = reporterKey(a);
  return {
    moreFromReporter: key ? pick(getArticlesByReporter(key)).slice(0, n) : [],
    sameDay: a.day ? pick(getArticlesByDay(a.day)).slice(0, n) : a.publishedAt ? pick(getArticlesByDate(a.publishedAt.slice(0, 10))).slice(0, n) : [],
    byEvent: pick(articles.filter((x) => x.relatedEvents.some((e) => a.relatedEvents.includes(e)))).slice(0, n),
    byPeople: pick(articles.filter((x) => x.relatedPeople.some((p) => a.relatedPeople.includes(p)))).slice(0, n),
  };
}

// 아카이브 목록용 색인 (client 로 넘기는 가벼운 데이터)
export const archiveIndex = () => articles.map((a) => toIndexEntry(a, (id) => peopleById[id]?.name)).sort(byDateDesc);
export const archiveFacets = (list = articles) => {
  const cats = new Map();
  const days = new Set();
  list.forEach((a) => {
    if (a.category) cats.set(a.category, (cats.get(a.category) || 0) + 1);
    if (a.day) days.add(a.day);
  });
  return {
    categories: [...cats.keys()].sort(),
    reporters: getReporters().map((r) => ({id: r.key, name: r.name, count: r.articles})),
    days: [...days].sort((x, y) => x - y),
  };
};

// ── 기자 (작성 기사 데이터에서 계산) ──────
export function getReporters() {
  const map = new Map();
  articles.forEach((a) => {
    const key = reporterKey(a);
    if (!key) return;
    const r = map.get(key) || {key, personId: a.authorId, name: a.author.name, articles: 0, photoArticles: 0, videoArticles: 0};
    r.articles++;
    if (a._images.length) r.photoArticles++;
    if (a._videos.length) r.videoArticles++;
    map.set(key, r);
  });
  // 신이비를 맨 앞에, 그다음 기사 수 순
  return [...map.values()].sort((x, y) => (y.key === SHIN) - (x.key === SHIN) || y.articles - x.articles || x.name.localeCompare(y.name));
}
export function reporterStats(key) {
  const list = getArticlesByReporter(key);
  if (!list.length) return null;
  const person = peopleById[list[0].authorId] || null;
  const dated = list.filter((a) => a.publishedAt).map((a) => a.publishedAt).sort();
  const cats = new Map();
  list.forEach((a) => a.category && cats.set(a.category, (cats.get(a.category) || 0) + 1));
  return {
    key,
    person,
    name: person?.name || list[0].author.name,
    articles: list.length,
    photoArticles: list.filter((a) => a._images.length).length,
    videoArticles: list.filter((a) => a._videos.length).length,
    firstReport: dated[0] || null,
    lastReport: dated[dated.length - 1] || null,
    topCategories: [...cats.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3).map(([c, n]) => ({category: c, count: n})),
    likes: list.some((a) => a.likes != null) ? list.reduce((n, a) => n + (a.likes || 0), 0) : null,
  };
}
export const reporterHref = (key) => (key ? `/bongnudo-2/archive/reporter/${encodeURIComponent(key)}` : null);

// ── 사람 ─────────────────────────────
export const getPerson = _getPerson;
// 핵심 기자단 (명부 순서 그대로 — 직급순 아님)
export const getCoreNewsroom = () => coreNewsroomIds.map((id) => peopleById[id]);
// 보도국 관련 기록에 등장하지만 초기 기자단으로 단정하지 않는 사람
export const getNewsroomOthers = () => people.filter((p) => p.group === 'newsroom' && !p.core);
export const getPersonArticles = (id) => getArticlesByPerson(id);
export const getPersonRollingPaper = (id) => rollingPapers.find((r) => r.fromPersonId === id) || null;
export const getPersonEvents = (id) => events.filter((e) => e.people?.includes(id) && e.verified !== false);

// ── NEWSROOM STORIES ─────────────────
const storyOrder = (a, b) => (a.day ?? 99) - (b.day ?? 99);
export const getStory = (id) => newsroomStories.find((s) => s.id === id) || null;
export const getStories = (types = null) => newsroomStories.filter((s) => !types || types.includes(s.type)).sort(storyOrder);
export const getStoriesByPerson = (id, types = null) => getStories(types).filter((s) => s.people.includes(id));
export const getStoriesByDay = (day) => newsroomStories.filter((s) => s.day === day);
// 보도국 전체가 함께한 장면(6명 이상)은 개인 사이의 기록에서 빼고, 그 장면 자체로 보여 준다
const GROUP_SCENE = 6;
export const sharedStories = (a, b) =>
  newsroomStories.filter((s) => s.people.length < GROUP_SCENE && s.people.includes(a) && s.people.includes(b)).sort(storyOrder);
// 함께 취재한 기록 (취재 장면에 두 명 이상)
export const getReportingTogether = () => getStories(['reporting']).filter((s) => s.people.length > 1);

// ── 관계 (양방향: A 의 기록에 B 가 있으면 B 쪽에서도 보인다) ──
export function relationshipsOf(id) {
  const out = (peopleById[id]?.relationships || []).map((r) => ({...r, other: r.personId, direction: 'out'}));
  people.forEach((p) => {
    if (p.id === id) return;
    (p.relationships || []).forEach((r) => r.personId === id && out.push({...r, other: p.id, direction: 'in'}));
  });
  return out.filter((r) => peopleById[r.other]);
}
// 한 사람과 다른 한 사람: 확인된 관계 + 함께 등장한 장면
export const between = (a, b) => ({
  person: peopleById[b],
  relationships: relationshipsOf(a).filter((r) => r.other === b),
  stories: sharedStories(a, b),
});
// 보도국 동료들과의 기록 (자료가 있는 사람만)
export const withNewsroom = (id) =>
  people
    .filter((p) => p.group === 'newsroom' && p.id !== id)
    .map((p) => between(id, p.id))
    .filter((x) => x.relationships.length || x.stories.length);

// 기자 한 명의 기록 — 숫자는 전부 실제 기사에서 계산 (기사 0건이면 0)
export function personStats(id) {
  const written = getArticlesByReporter(id);
  const related = getArticlesByPerson(id);
  const dated = written.filter((a) => a.publishedAt).map((a) => a.publishedAt).sort();
  const cats = new Map();
  const met = new Map();
  written.forEach((a) => {
    if (a.category) cats.set(a.category, (cats.get(a.category) || 0) + 1);
    a.relatedPeople.forEach((p) => p !== id && peopleById[p] && met.set(p, (met.get(p) || 0) + 1));
  });
  return {
    written: written.length,
    related: related.length,
    mentioned: related.filter((a) => a.authorId !== id).length,
    photoArticles: written.filter((a) => a._images.length).length,
    videoArticles: written.filter((a) => a._videos.length).length,
    firstReport: dated[0] || null,
    lastReport: dated[dated.length - 1] || null,
    categories: [...cats.entries()].sort((x, y) => y[1] - x[1]).slice(0, 4).map(([category, count]) => ({category, count})),
    frequentPeople: [...met.entries()].sort((x, y) => y[1] - x[1]).slice(0, 6).map(([pid, count]) => ({person: peopleById[pid], count})),
    activeDays: [...new Set(written.map((a) => a.day).filter(Boolean))].sort((x, y) => x - y),
    events: getPersonEvents(id).length,
    stories: getStoriesByPerson(id).length,
    relationships: relationshipsOf(id).length,
    letter: Boolean(getPersonRollingPaper(id)),
  };
}
// 기자가 쓴 기사 속 사진 (기사 순서대로, 최신 기사부터)
export function personMedia(id, n = 12) {
  const photos = [];
  let videos = 0;
  for (const a of getArticlesByReporter(id)) {
    videos += a._videos.length;
    for (const im of a._images) if (photos.length < n) photos.push({...im, articleId: a.id, articleTitle: a.title});
  }
  return {photos, videos};
}

// ── 사건 / 날짜 ───────────────────────
export const getEventsByDay = (day) => events.filter((e) => e.day === day && e.verified !== false);
export const personHref = (id) => (id && peopleById[id] ? `/bongnudo-2/people/${id}` : null);
export const dayStats = (day) => {
  const list = getArticlesByDay(day);
  return {
    articles: list.length,
    shinIbi: list.filter((a) => a.isShinIbiArticle).length,
    photos: list.reduce((n, a) => n + a._images.length, 0),
    videos: list.reduce((n, a) => n + a._videos.length, 0),
  };
};

// ── 롤링페이퍼 ────────────────────────
export const getLetters = () => [...rollingPapers].filter((r) => r.toPersonId === SHIN).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
