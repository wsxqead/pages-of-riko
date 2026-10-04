import './globals.css';
import {OPENING_BOOT_SCRIPT} from '@/lib/openingSession';
import {GOAON_BOOT_SCRIPT} from '@/lib/goaonSession';
import {PCT2_BOOT_SCRIPT} from '@/lib/pct2Session';
export const metadata={title:'PAGES OF RIKO',description:'함께였기에 이야기가 된, 리코의 소중한 페이지들.'};
export default function Layout({children}){return <html lang="ko"><head><script dangerouslySetInnerHTML={{__html:OPENING_BOOT_SCRIPT+GOAON_BOOT_SCRIPT+PCT2_BOOT_SCRIPT}}/></head><body>{children}</body></html>}
