// 픽크타2 · 세션 상태
// 1) 첫 방문 환영 연출은 세션당 한 번
// 2) 이번 방문에서 열어 본 지역/주민/기억/사진 (LAST DAY 화면에 핀으로 남는다)
export const PCT2_WELCOME_KEY = 'pct2Welcomed';
const VISITS_KEY = 'pct2Visits';

export function readWelcomed() {
  try {
    return sessionStorage.getItem(PCT2_WELCOME_KEY) === 'true';
  } catch {
    return false;
  }
}
export function markWelcomed() {
  try {
    sessionStorage.setItem(PCT2_WELCOME_KEY, 'true');
  } catch {}
}

const EMPTY = {regions: [], residents: [], encounters: [], photos: []};
export function readVisits() {
  try {
    return {...EMPTY, ...JSON.parse(sessionStorage.getItem(VISITS_KEY) || '{}')};
  } catch {
    return {...EMPTY};
  }
}
export function addVisit(kind, id) {
  try {
    const v = readVisits();
    if (!v[kind].includes(id)) {
      v[kind] = [...v[kind], id];
      sessionStorage.setItem(VISITS_KEY, JSON.stringify(v));
    }
    return v;
  } catch {
    return readVisits();
  }
}

// 첫 페인트 전: 이미 환영받은 세션이면 환영 연출을 꺼 둔다 (새로고침 깜빡임 방지)
export const PCT2_BOOT_SCRIPT = `try{if(sessionStorage.getItem('${PCT2_WELCOME_KEY}')==='true'){var s=document.createElement('style');s.textContent='.pt-welcome.first,.pt-welcome.first *{animation:none!important}';document.head.appendChild(s)}}catch(e){}`;
