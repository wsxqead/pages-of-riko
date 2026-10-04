// 공개 페이지 요청 — 재시도 · Retry-After · 지수 대기 · 중단(Ctrl+C) 지원.
// 쿠키 · 인증 헤더는 보내지도 저장하지도 않는다.
import {BBS} from './bbs-config.mjs';

export const stop = new AbortController(); // SIGINT 시 abort → 진행 중인 요청이 즉시 끊긴다
const sleep = (ms) =>
  new Promise((resolve, reject) => {
    if (stop.signal.aborted) return reject(stop.signal.reason);
    const t = setTimeout(resolve, ms);
    stop.signal.addEventListener('abort', () => (clearTimeout(t), reject(stop.signal.reason)), {once: true});
  });

// 시험(fixture)에서만 대기 시간을 줄이기 위한 배율. 실제 사이트에는 쓰지 않는다.
const SCALE = Number(process.env.BBS_BACKOFF_SCALE || 1);
let slowdown = 1; // 429 를 받으면 이후 모든 간격을 늘린다

export const politeDelay = () => {
  const [a, b] = BBS.articleDelayMs;
  return sleep((a + Math.random() * (b - a)) * slowdown * SCALE);
};

function retryAfterMs(h) {
  const v = h.get('retry-after');
  if (!v) return null;
  if (/^\d+$/.test(v)) return Number(v) * 1000;
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : Math.max(0, t - Date.now());
}

export class FetchError extends Error {
  constructor(msg, {status = null, attempts = 0, permanent = false} = {}) {
    super(msg);
    Object.assign(this, {status, attempts, permanent});
  }
}

// 요청 1건 (재시도 포함). 성공하면 Response(본문은 아직 읽지 않음)를 돌려준다.
export async function request(url, {accept = '*/*', onRetry = () => {}} = {}) {
  let attempts = 0;
  let lastStatus = null;
  let lastError = null;
  for (let i = 0; i <= BBS.backoffMs.length; i++) {
    attempts++;
    const timeout = AbortSignal.timeout(BBS.timeoutMs);
    try {
      const res = await fetch(url, {
        headers: {'user-agent': BBS.userAgent, accept},
        redirect: 'follow',
        credentials: 'omit',
        signal: AbortSignal.any([stop.signal, timeout]),
      });
      lastStatus = res.status;
      if (res.ok) return Object.assign(res, {attempts});
      if (!BBS.retryStatuses.includes(res.status)) {
        await res.body?.cancel();
        throw new FetchError(`HTTP ${res.status}`, {status: res.status, attempts, permanent: true});
      }
      if (res.status === 429) slowdown = Math.min(slowdown * 2, 8);
      const wait = retryAfterMs(res.headers) ?? BBS.backoffMs[i];
      await res.body?.cancel();
      lastError = `HTTP ${res.status}`;
      if (i === BBS.backoffMs.length) break;
      onRetry({attempt: attempts, status: res.status, waitMs: wait});
      await sleep(wait * SCALE);
    } catch (e) {
      if (stop.signal.aborted) throw stop.signal.reason;
      if (e instanceof FetchError) throw e;
      lastError = e.name === 'TimeoutError' ? 'timeout' : e.message;
      if (i === BBS.backoffMs.length) break;
      onRetry({attempt: attempts, status: null, waitMs: BBS.backoffMs[i], error: lastError});
      await sleep(BBS.backoffMs[i] * SCALE);
    }
  }
  throw new FetchError(lastError || 'request failed', {status: lastStatus, attempts});
}

// HTML 등 텍스트: 서버가 보낸 바이트 그대로 (Buffer) — 원본 저장용
export async function fetchRaw(url, opts) {
  const res = await request(url, {accept: 'text/html,application/xhtml+xml', ...opts});
  const buf = Buffer.from(await res.arrayBuffer());
  return {buf, status: res.status, finalUrl: res.url, contentType: res.headers.get('content-type'), attempts: res.attempts};
}
