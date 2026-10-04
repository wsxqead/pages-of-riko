// manifest · 로그 · 실패 목록 — JSON 은 항상 .tmp 에 쓴 뒤 rename (중간에 꺼져도 깨지지 않게)
import fs from 'node:fs';
import path from 'node:path';

export function writeJsonAtomic(file, data) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
  fs.renameSync(tmp, file);
}
export function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

export const STATUSES = ['pending', 'fetching', 'raw-saved', 'parsing', 'media-downloading', 'complete', 'partial', 'failed'];

export class Archive {
  constructor(dir, source) {
    this.dir = dir;
    this.p = {
      manifest: path.join(dir, 'manifest.json'),
      links: path.join(dir, 'source/article-links.json'),
      articles: path.join(dir, 'source/articles.json'),
      log: path.join(dir, 'logs/backup.log'),
      failedArticles: path.join(dir, 'logs/failed-articles.json'),
      failedMedia: path.join(dir, 'logs/failed-media.json'),
      skipped: path.join(dir, 'logs/skipped.json'),
    };
    const now = new Date().toISOString();
    this.m = readJson(this.p.manifest, null) || {version: 1, source, startedAt: now, updatedAt: now, mode: 'test', stats: {}, access: null, pagination: null, articles: {}};
    this.records = new Map(readJson(this.p.articles, []).map((r) => [r.id, r]));
    this.failedArticles = readJson(this.p.failedArticles, []);
    this.failedMedia = readJson(this.p.failedMedia, []);
    this.skipped = readJson(this.p.skipped, []);
  }
  rel(abs) {
    return path.relative(this.dir, abs).split(path.sep).join('/');
  }
  abs(rel) {
    return path.join(this.dir, rel);
  }
  log(line) {
    fs.mkdirSync(path.dirname(this.p.log), {recursive: true});
    fs.appendFileSync(this.p.log, `${new Date().toISOString()} ${line}\n`);
  }
  article(id) {
    return (this.m.articles[id] ||= {status: 'pending', rawSaved: false});
  }
  set(id, patch) {
    Object.assign(this.article(id), patch, {updatedAt: new Date().toISOString()});
  }
  record(id) {
    return this.records.get(id) || null;
  }
  putRecord(rec) {
    this.records.set(rec.id, rec);
  }
  // 실패 목록: 같은 항목은 갱신, 성공하면 지운다
  markFailedArticle(entry) {
    this.failedArticles = [...this.failedArticles.filter((x) => x.id !== entry.id), entry];
  }
  clearFailedArticle(id) {
    this.failedArticles = this.failedArticles.filter((x) => x.id !== id);
  }
  syncMediaLogs(articleId, assets) {
    const key = (x) => `${x.articleId}|${x.sourceUrl}`;
    const failed = assets.filter((a) => a.downloadStatus === 'failed');
    const skipped = assets.filter((a) => /^(skipped|unresolved|embed)/.test(a.downloadStatus));
    this.failedMedia = [
      ...this.failedMedia.filter((x) => x.articleId !== articleId),
      ...failed.map((a) => ({articleId, assetId: a.assetId, type: a.type, sourceUrl: a.sourceUrl, resolvedUrl: a.resolvedUrl, attempts: a.attempts, lastStatus: a.lastStatus ?? null, error: a.error, lastAttemptAt: a.lastAttemptAt})),
    ];
    const seen = new Set();
    this.skipped = [
      ...this.skipped.filter((x) => x.articleId !== articleId),
      ...skipped.map((a) => ({articleId, assetId: a.assetId, type: a.type, sourceUrl: a.sourceUrl, status: a.downloadStatus, reason: a.error ?? null})),
    ].filter((x) => !seen.has(key(x)) && seen.add(key(x)));
  }
  save() {
    const arts = Object.values(this.m.articles);
    const sel = arts.filter((a) => a.selected);
    this.m.stats = {
      ...this.m.stats,
      selected: sel.length,
      complete: sel.filter((a) => a.status === 'complete').length,
      partial: sel.filter((a) => a.status === 'partial' || a.status === 'media-downloading').length,
      failed: sel.filter((a) => a.status === 'failed').length,
      pending: sel.filter((a) => ['pending', 'fetching', 'raw-saved', 'parsing'].includes(a.status)).length,
    };
    this.m.updatedAt = new Date().toISOString();
    writeJsonAtomic(this.p.manifest, this.m);
    writeJsonAtomic(this.p.articles, [...this.records.values()]);
    writeJsonAtomic(this.p.failedArticles, this.failedArticles);
    writeJsonAtomic(this.p.failedMedia, this.failedMedia);
    writeJsonAtomic(this.p.skipped, this.skipped);
  }
}

export function dirSize(dir) {
  let n = 0;
  if (!fs.existsSync(dir)) return 0;
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, e.name);
    n += e.isDirectory() ? dirSize(p) : fs.statSync(p).size;
  }
  return n;
}
