import {peopleGroups} from '@/data/bongnudo2/people';
import {people, getCoreNewsroom, getNewsroomOthers} from '@/data/bongnudo2';
import {PersonCard} from '../_components/newsroom';
import PeopleHashRedirect from '../_components/PeopleHashRedirect';

export const metadata = {title: 'PEOPLE — 봉누도 2'};

// PEOPLE — 직급표가 아니라 같은 보도국에서 일했던 사람들. 카드를 열면 한 사람의 작은 Archive.
export default function PeoplePage() {
  const core = getCoreNewsroom();
  const others = getNewsroomOthers();
  // 보도국 밖의 사람들(경찰·갱단·시민 …)은 데이터가 생기면 그룹째 나타난다
  const outside = peopleGroups
    .filter((g) => g.id !== 'newsroom')
    .map((g) => ({...g, people: people.filter((p) => p.group === g.id)}))
    .filter((g) => g.people.length);

  return (
    <main className="b2-main b2-people-page">
      <PeopleHashRedirect ids={people.map((p) => p.id)} />
      <header className="b2-page-head">
        <p className="b2-kicker">PEOPLE · THE BBS NEWSROOM</p>
        <h1>같은 보도국에서 일했던 사람들</h1>
        <p className="b2-page-lead">
          취재하고, 기사를 쓰고, 같은 보도국에서 생활한 기자들. 각자 쓴 기사와 함께 등장한 장면, 서로 남긴 기록이 쌓일수록 한 사람의 기록도 함께 늘어난다.
        </p>
      </header>

      <section className="b2-people-group">
        <header>
          <h2>THE BBS NEWSROOM<small>보도국 기자단</small></h2>
          <span>{core.length}</span>
        </header>
        <div className="b2-pcards">
          {core.map((p) => (
            <PersonCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {others.length > 0 && (
        <section className="b2-people-group">
          <header>
            <h2>ALSO IN THE NEWSROOM<small>보도국 기록에 함께 등장하는 사람</small></h2>
            <span>{others.length}</span>
          </header>
          <div className="b2-pcards">
            {others.map((p) => (
              <PersonCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {outside.map((g) => (
        <section key={g.id} className="b2-people-group">
          <header>
            <h2>{g.label}<small>{g.ko}</small></h2>
            <span>{g.people.length}</span>
          </header>
          <div className="b2-pcards">
            {g.people.map((p) => (
              <PersonCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
