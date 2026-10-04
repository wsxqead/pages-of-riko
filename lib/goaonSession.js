// 고아온 SAVE 화면의 "세이브 불러오기" 연출은 세션당 한 번만.
export const GOAON_LOADED_KEY = 'goaonLoaded';

export function readGoaonLoaded() {
  try {
    return sessionStorage.getItem(GOAON_LOADED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markGoaonLoaded() {
  try {
    sessionStorage.setItem(GOAON_LOADED_KEY, 'true');
  } catch {}
}

// 첫 페인트 전에 실행: 이미 불러온 세션이면 로딩 연출을 CSS로 미리 꺼 둔다. (새로고침 시 깜빡임 방지)
export const GOAON_BOOT_SCRIPT = `try{if(sessionStorage.getItem('${GOAON_LOADED_KEY}')==='true'){var s=document.createElement('style');s.textContent='.ga-save.boot .ga-load{display:none}.ga-save.boot .ga-anim{animation:none!important}';document.head.appendChild(s)}}catch(e){}`;
