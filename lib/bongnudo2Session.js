// 봉누도 2 · 첫 방문 연출(신문 1면이 책상 위에 놓이는 짧은 움직임)은 세션당 한 번만.
export const BB2_KEY = 'bb2Edition';

export function readBb2Seen() {
  try {
    return sessionStorage.getItem(BB2_KEY) === 'true';
  } catch {
    return false;
  }
}
export function markBb2Seen() {
  try {
    sessionStorage.setItem(BB2_KEY, 'true');
  } catch {}
}

// 첫 페인트 전: 이미 본 세션이면 연출을 꺼 둔다 (새로고침 깜빡임 방지)
export const BB2_BOOT_SCRIPT = `try{if(sessionStorage.getItem('${BB2_KEY}')==='true'){var s=document.createElement('style');s.textContent='.b2-edition.first,.b2-edition.first *{animation:none!important}';document.head.appendChild(s)}}catch(e){}`;
