import {reporter} from '@/data/bongnudo2/meta';
import {getLetters, getPerson, relationshipsOf} from '@/data/bongnudo2';
import Letters from '../_components/Letters';

export const metadata = {title: 'TO SHIN IBI — 봉누도 2'};

export default function RollingPaperPage() {
  const letters = getLetters().map((l) => {
    const p = getPerson(l.fromPersonId);
    return {
      ...l,
      fromName: p?.name || l.fromPersonId,
      fromStreamer: p?.streamer || null,
      // 사이트의 짧은 관계 설명 — 편지 원문과 섞지 않는다 (원문을 관계 설명에 복사하지도 않는다)
      relationship: relationshipsOf(l.fromPersonId).filter((r) => r.other === l.toPersonId).map((r) => r.summary).join(' ') || null,
    };
  });

  return (
    <main className="b2-main b2-letters">
      <header className="b2-letters-head">
        <p className="b2-kicker">TO {reporter.en}</p>
        <h1>Letters from the BBS Newsroom</h1>
        <p>마지막 기사 뒤에 남겨진 말들.</p>
      </header>

      <section className="b2-desk-scene" aria-label="신이비의 책상">
        <div className="b2-desk-top">
          <span className="b2-nameplate-desk">{reporter.name}<small>{reporter.finalPositionEn}</small></span>
          <span className="b2-lamp" aria-hidden="true" />
          {letters.length > 0 ? (
            <Letters letters={letters} />
          ) : (
            <p className="b2-desk-quiet">마지막 퇴근 뒤, 불이 하나 남은 보도국. 신이비의 자리.</p>
          )}
        </div>
      </section>
    </main>
  );
}
