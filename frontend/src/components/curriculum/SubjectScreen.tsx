import { ChevR, IconLock } from '../common/Icons';
import { Ring } from './ProgressTracker';
import type { Subject, Topic } from '../../data/subjects';

interface SubjectScreenProps {
  subject: Subject;
  topics: (Topic & { progress: number })[];
  overall: number;
  xp: number;
  streak: number;
  onOpenTopic: (id: string) => void;
  onContinue: () => void;
}

export function SubjectScreen({ subject, topics, overall, xp, streak, onOpenTopic, onContinue }: SubjectScreenProps) {
  const doneCount = topics.filter((topic) => topic.progress >= 100).length;

  return (
    <div className="subj-view">
      <div className="sv-main">
        <div className="sv-head">
          <div className="sv-kicker">{subject.name}</div>
          <h1 className="sv-title">Теми курсу</h1>
          <p className="sv-sub">Оберіть тему, щоб перейти до занять — теорія та практика в одному потоці.</p>
        </div>
        <div className="tp-list">
          {topics.map((topic) => {
            const active = topic.status === 'active';

            return (
              <button
                key={topic.id}
                className={'tp-row ' + (active ? 'active' : 'soon')}
                disabled={!active}
                onClick={() => active && onOpenTopic(topic.id)}
              >
                <span className="tp-num">{topic.n}</span>
                <span className="tp-info">
                  <span className="tp-name">{topic.title}</span>
                  <span className="tp-meta">
                    {topic.lessons} занять
                    {active && (
                      <span className="tp-mini">
                        <i style={{ width: topic.progress + '%' }} />
                      </span>
                    )}
                  </span>
                </span>
                {active ? (
                  <span className="tp-prog">{topic.progress}%</span>
                ) : (
                  <span className="tp-lock">
                    <IconLock />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <aside className="pp-card">
        <div className="pp-title">Ваш прогрес</div>
        <div className="pp-ring-wrap">
          <Ring pct={overall} accent="var(--accent)" size={124} sw={11} />
        </div>
        <p className="pp-caption">пройдено матеріалу курсу</p>
        <div className="pp-stats">
          <div className="pp-stat">
            <span>Завершено тем</span>
            <b>
              {doneCount} / {topics.length}
            </b>
          </div>
          <div className="pp-stat">
            <span>Зароблено XP</span>
            <b>{xp}</b>
          </div>
          <div className="pp-stat">
            <span>Серія</span>
            <b>{streak} дн.</b>
          </div>
        </div>
        <button className="pp-cta" onClick={onContinue}>
          Продовжити навчання <ChevR />
        </button>
      </aside>
    </div>
  );
}
