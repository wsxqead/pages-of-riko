// 고아온 공용 UI 조각 (서버/클라이언트 어디서든 사용 가능 — 훅 없음)
import Link from 'next/link';
import {getMember} from '@/data/goaon/party';
import {questStatus} from '@/data/goaon/quests';

// 초상 자리: 실제 이미지가 없으면 이름 첫 글자를 블록 타일에 (캐릭터 그림을 지어내지 않는다)
export function Portrait({member, size = 'md'}) {
  const src = member.portrait?.src;
  return (
    <span className={`ga-portrait ${size}`} aria-hidden={!src}>
      {src ? <img src={src} alt={`${member.name} 초상`} loading="lazy" /> : <b>{member.name[0]}</b>}
    </span>
  );
}

// 참여자 표시. 'guild' 는 개별 명단이 확인되지 않은 "길드원들"
export function PartyChips({people, link = true}) {
  return (
    <ul className="ga-chips">
      {people.map((id) => {
        if (id === 'guild') return <li key={id} className="guild">길드원들</li>;
        const m = getMember(id);
        if (!m) return null;
        const inner = (
          <>
            {m.player && <i aria-label="플레이어">▶</i>}
            {m.name}
          </>
        );
        return (
          <li key={id} className={m.player ? 'player' : ''}>
            {link ? <Link href={`/goaon/party#${id}`}>{inner}</Link> : inner}
          </li>
        );
      })}
    </ul>
  );
}

export function Status({status}) {
  const s = questStatus[status];
  return (
    <span className={`ga-status s-${status}`}>
      <b>{s.label}</b>
      <small>{s.ko}</small>
    </span>
  );
}

// url 이 있는 클립만. 없으면 렌더하지 않음.
export function Clips({items, title = 'CLIPS'}) {
  if (!items?.length) return null;
  return (
    <section className="ga-clips">
      <h4>{title}</h4>
      <ul>
        {items.map((m) => (
          <li key={m.id}>
            <a href={m.url} target="_blank" rel="noreferrer">
              {m.thumbnail && <img src={m.thumbnail} alt="" loading="lazy" />}
              <span>{m.title}</span>
              <small>{m.date}</small>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

// 쉬어 가는 자리: CSS 도형으로만 그린 모닥불
export function Campfire({label, children}) {
  return (
    <div className="ga-camp">
      <div className="ga-fire" aria-hidden="true">
        <i className="f1" /><i className="f2" /><i className="f3" />
        <span className="log l1" /><span className="log l2" />
      </div>
      <div className="ga-camp-text">
        <small>REST POINT</small>
        <p>{label}</p>
        {children}
      </div>
    </div>
  );
}
