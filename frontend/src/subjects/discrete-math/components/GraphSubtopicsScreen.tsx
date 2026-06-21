import { ChevR } from '../../../components/common/Icons';
import { Ring } from '../../../components/curriculum/ProgressTracker';
import type { GraphSubtopic } from '../data/graphSubtopics';

interface GraphSubtopicsScreenProps {
  subtopics: GraphSubtopic[];
  overall: number;
  xp: number;
  onOpenSubtopic: (id: string) => void;
  onContinue: () => void;
}

export function GraphSubtopicsScreen({
  subtopics,
  overall,
  xp,
  onOpenSubtopic,
  onContinue,
}: GraphSubtopicsScreenProps) {
  const doneCount = subtopics.filter((subtopic) => subtopic.progress >= 100).length;

  return (
    <div className="subj-view">
      <div className="sv-main">
        <div className="sv-head">
          <div className="sv-kicker">Розділ 4 · Теорія графів</div>
          <h1 className="sv-title">Підтеми розділу</h1>
          <p className="sv-sub">Оберіть підтему, щоб перейти до занять — теорія, практика та питання.</p>
        </div>

        <div className="tp-list">
          {subtopics.map((subtopic) => (
            <button key={subtopic.id} className="tp-row active" onClick={() => onOpenSubtopic(subtopic.id)}>
              <span className="tp-num">{subtopic.n}</span>

              <span className="tp-info">
                <span className="tp-name">{subtopic.title}</span>
                <span className="tp-meta">
                  <span className="tp-mini">
                    <i style={{ width: `${subtopic.progress}%` }} />
                  </span>
                </span>
              </span>

              <span className="tp-prog">{subtopic.progress}%</span>
            </button>
          ))}
        </div>
      </div>

      <aside className="pp-card">
        <div className="pp-title">Прогрес розділу</div>
        <div className="pp-ring-wrap">
          <Ring pct={overall} accent="var(--accent)" size={124} sw={11} />
        </div>
        <p className="pp-caption">пройдено матеріалу розділу</p>

        <div className="pp-stats">
          <div className="pp-stat">
            <span>Завершено підтем</span>
            <b>
              {doneCount} / {subtopics.length}
            </b>
          </div>
          <div className="pp-stat">
            <span>Зароблено XP</span>
            <b>{xp}</b>
          </div>
        </div>

        <button className="pp-cta" onClick={onContinue}>
          Продовжити навчання <ChevR />
        </button>
      </aside>
    </div>
  );
}
