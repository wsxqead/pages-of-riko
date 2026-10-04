'use client';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {server, player} from '@/data/pixelTown2/meta';
import {regions} from '@/data/pixelTown2/regions';
import {residents, getResident} from '@/data/pixelTown2/residents';
import {encounters} from '@/data/pixelTown2/encounters';
import {photos, officialEdits} from '@/data/pixelTown2/media';
import {footprints} from '@/data/pixelTown2/journey';
import {readVisits} from '@/lib/pct2Session';
import TownMap from '../_components/TownMap';

// LAST DAY — 폐허가 아니라 VISIT COMPLETE. 이번 방문에서 열어 본 핀들이 지도 위에 남는다.
export default function LastDay() {
  const [v, setV] = useState({regions: [], residents: [], encounters: [], photos: []});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setV(readVisits());
    setReady(true);
  }, []);

  const visitedRegions = Array.from(new Set([player.homeRegion, ...v.regions]));
  const met = v.residents.map(getResident).filter(Boolean);
  const stats = [
    {label: 'REGIONS', ko: '둘러본 지역', value: visitedRegions.length, total: regions.length},
    {label: 'RESIDENTS', ko: '만난 주민', value: met.length, total: residents.length},
    {label: 'MEMORIES', ko: '열어 본 기억', value: v.encounters.length, total: encounters.length},
    {label: 'PHOTOS', ko: '사진', value: v.photos.length, total: photos.length},
  ].filter((s) => s.total > 0); // 아직 자료가 없는 항목은 숨긴다

  return (
    <main className="pt-main pt-ending">
      <header className="pt-page-head center">
        <small>LAST DAY · {server.endLabel}</small>
        <h1>VISIT COMPLETE</h1>
        <p>서버는 닫혔지만, 마을은 기록 속에 남아 있습니다. 이번 방문에서 들른 곳들이 지도 위에 그대로 표시됩니다.</p>
      </header>

      <div className={'pt-final' + (ready ? ' show' : '')}>
        <TownMap focus={null} rikoRegion={player.homeRegion} visitedRegions={visitedRegions} zoomable={false} showTrails={false} finale interactive={false} metResidents={v.residents} />
      </div>

      <ul className="pt-final-stats">
        {stats.map((s, i) => (
          <li key={s.label} style={{'--i': i}}>
            <b>{s.value}<small>/{s.total}</small></b>
            <span>{s.label}</span>
            <small>{s.ko}</small>
          </li>
        ))}
      </ul>

      {met.length > 0 && (
        <p className="pt-final-met">
          이번 방문에서 만난 사람 · {met.map((r) => r.name).join(', ')}
        </p>
      )}

      <p className="pt-final-archive">
        {server.participants}명이 살았던 {server.totalRegions}개의 마을 · 리코의 확인된 플레이 {footprints.filter((f) => f.type === 'session').length}일 · 공식 편집본 {officialEdits.length}편
      </p>

      <div className="pt-final-sign">
        <span>★</span>
        <b>세피아</b>
        <em>RIKO WAS HERE</em>
        <small>{server.startLabel} — {server.endLabel}</small>
      </div>

      <nav className="pt-final-actions">
        <Link href="/pixel-town-2" className="pt-btn">마을 다시 걷기</Link>
        <Link href="/pixel-town-2/residents" className="pt-btn">주민 안내판</Link>
        <Link href="/" className="pt-btn primary">← PAGES OF RIKO</Link>
      </nav>
    </main>
  );
}
