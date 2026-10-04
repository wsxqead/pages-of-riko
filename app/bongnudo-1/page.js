'use client';
import Link from 'next/link';
import {useState} from 'react';
import {server, yuja, profileRows, sections} from '@/data/bongnudo1/meta';
import {useSide, LensSwitch} from './_components/Shell';
import {Photo} from './_components/Media';
import GroupPhotos, {hasGroupPhotos} from './_components/GroupPhotos';
import {getPage} from '@/data/pages';

const logo = getPage('bongnudo-1')?.logo;

const SECTION_NOTES = {
  '/bongnudo-1/story': '칠쌍파의 공주에서 마지막 밤까지, 8개의 챕터',
  '/bongnudo-1/people': '정유자를 중심으로 시간에 따라 변하는 관계도',
  '/bongnudo-1/timeline': '정유자에게 중요했던 날들의 기록',
  '/bongnudo-1/incidents': '하나의 사건을 깊게 들여다보는 6개의 파일',
  '/bongnudo-1/ending': '웃음, 장난, 눈물, 작별, 그리고 재회',
};

export default function CaseFile() {
  const {side} = useSide();
  const [curseOpen, setCurseOpen] = useState(false);

  return (
    <main className="b1-main b1-case">
      {/* ── 첫 화면: 두 소속 사이의 정유자 ── */}
      <section className="b1-hero">
        <p className="b1-hero-meta">
          {logo && <img className="b1-hero-mark" src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} />}
          <span>CASE FILE B1</span>
          <span>{server.en} · {server.game}</span>
          <span>{server.startLabel} — {server.endLabel}</span>
        </p>

        <div className="b1-hero-stage">
          <article className="b1-id police" data-group="police">
            <header>
              <b>BONGNUDO POLICE DEPT.</b>
              <small>PERSONNEL RECORD</small>
            </header>
            <div className="b1-id-body">
              <Photo photo={yuja.photo} variant="cctv" cam="ID · 03" className="b1-id-photo" />
              <dl>
                <div><dt>성명</dt><dd>{yuja.name}</dd></div>
                <div><dt>나이</dt><dd>{yuja.age}</dd></div>
                <div><dt>기수</dt><dd>{yuja.police.sub}</dd></div>
                <div><dt>비고</dt><dd>자칭 3기 에이스</dd></div>
              </dl>
            </div>
            <span className="b1-stamp blue">교육생</span>
          </article>

          <div className="b1-hero-center">
            <svg className="b1-hero-lines" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
              <line className="l-police" x1="0" y1="10" x2="38" y2="10" />
              <line className="l-chilssang" x1="62" y1="10" x2="100" y2="10" />
            </svg>
            <p className="b1-hero-kicker">POLICE · {yuja.age}세 · CHILSSANG</p>
            <h1>{yuja.name}</h1>
            <p className="b1-hero-en">{yuja.en}</p>
            <p className="b1-hero-line">
              칠쌍파의 막내딸로 시작해,<br />
              스파이로 경찰 3기가 되었다.
            </p>
            <LensSwitch />
          </div>

          <article className="b1-id chilssang" data-group="chilssang">
            <span className="b1-tape" aria-hidden="true" />
            {/* 단체사진이 있으면 아래 사진 묶음이 이 자리를 대신한다 */}
            {!hasGroupPhotos && <Photo photo={null} variant="polaroid" className="b1-id-photo" />}
            <p className="b1-memo-title">칠쌍파 · {yuja.chilssang.sub}</p>
            <ul className="b1-memo-list">
              {yuja.chilssang.titles.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <span className="b1-stamp pink">우리 집 막내</span>
          </article>
        </div>

        {hasGroupPhotos && <GroupPhotos />}
      </section>

      {/* ── 같은 사람, 두 개의 기록 (렌즈에 따라 문서가 바뀜) ── */}
      <section className="b1-records">
        <header className="b1-sec-head">
          <small>RECORD COMPARISON</small>
          <h2>두 조직이 남긴 정유자</h2>
          <p>위의 렌즈를 바꾸면 기록하는 쪽이 바뀝니다.</p>
        </header>
        <div className={'b1-compare lens-' + side}>
          <div className="b1-compare-doc police" data-group="police">
            <h3><span>경찰 인사기록</span><small>BONGNUDO POLICE</small></h3>
            <dl>
              {profileRows.map((r) => (
                <div key={r.key}><dt>{r.key}</dt><dd>{r.police}</dd></div>
              ))}
            </dl>
          </div>
          <div className="b1-compare-doc chilssang" data-group="chilssang">
            <h3><span>칠쌍파 가족 메모</span><small>CHILSSANG</small></h3>
            <dl>
              {profileRows.map((r) => (
                <div key={r.key}><dt>{r.key}</dt><dd>{r.chilssang}</dd></div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── 교육생의 저주 (작은 이스터에그) ── */}
      <aside className={'b1-curse' + (curseOpen ? ' open' : '')}>
        <button onClick={() => setCurseOpen((v) => !v)} aria-expanded={curseOpen}>
          <span className="lbl">EDUCATION STATUS</span>
          <b>교육생</b>
          <span className="warn">⚠ MAJOR INCIDENT DETECTED</span>
        </button>
        <div className="b1-curse-log" hidden={!curseOpen}>
          <p>교육생 정유자가 근무할 때 기록된 대형 사건</p>
          <ol>
            <li><time>12.05</time>첫 출근 직후 — 불춘원샷 갱단 점거</li>
            <li><time>12.13</time>교육생 재강등 → 경찰청 습격</li>
            <li><time>12.14</time>여전히 교육생 → 남북전쟁</li>
          </ol>
          <Link href="/bongnudo-1/incidents#curse">CASE 01 열기 →</Link>
        </div>
      </aside>

      {/* ── 전시 구성: 파일 폴더 ── */}
      <section className="b1-index">
        <header className="b1-sec-head">
          <small>CONTENTS OF THIS FILE</small>
          <h2>파일 안의 기록들</h2>
        </header>
        <ol className="b1-folders">
          {sections.slice(1).map((s, i) => (
            <li key={s.href} style={{'--i': i}}>
              <Link href={s.href}>
                <span className="tab">{String(i + 1).padStart(2, '0')} · {s.label}</span>
                <b>{s.ko}</b>
                <small>{SECTION_NOTES[s.href]}</small>
                <em aria-hidden="true">→</em>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
