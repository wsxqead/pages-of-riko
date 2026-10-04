// "이번 브라우저 세션에서 기록관에 입장한 적이 있는가" (sessionStorage, 탭/세션 한정)
// 표지를 보고 있는지 여부(UI 상태)와는 별개로 관리한다.
export const OPENED_KEY = 'pagesOfRikoOpened';

export function readOpened() {
  try {
    return sessionStorage.getItem(OPENED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markOpened() {
  try {
    sessionStorage.setItem(OPENED_KEY, 'true');
  } catch {}
}

// 첫 페인트 전에 실행되는 인라인 스크립트.
// 서버는 세션 값을 모르므로 메인을 "auto" 상태로 렌더하고, 여기서 주입한 CSS가
// 하이드레이션 전까지 표지/앨범 중 맞는 쪽만 보이게 한다. (오프닝 깜빡임 방지)
export const OPENING_BOOT_SCRIPT = `try{if(sessionStorage.getItem('${OPENED_KEY}')==='true'){var s=document.createElement('style');s.textContent='.home.auto .cover{display:none}.home.auto .album{display:block;animation:none}.home.auto .al-entry{animation:none}';document.head.appendChild(s)}}catch(e){}`;
