import type { ReactNode } from 'react';
import type { Subject, SubjectIcon } from '../../data/subjects';

const SUBJECT_ICONS: Record<SubjectIcon, ReactNode> = {
  sets: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="12" r="6" />
      <circle cx="15" cy="12" r="6" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  calc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h14l-7 8 7 8H5" />
    </svg>
  ),
};

interface HomeScreenProps {
  subjects: Subject[];
  discreteProgress: number;
  onOpen: (id: string) => void;
}

export function HomeScreen({ subjects, discreteProgress, onOpen }: HomeScreenProps) {
  return (
    <div className="home">
      <div className="home-hi">
        <div className="home-eyebrow">Вітаємо знову</div>
        <h1 className="home-title">Оберіть предмет</h1>
        <p className="home-sub">Продовжуйте навчання або почніть новий курс.</p>
      </div>
      <div className="subj-grid">
        {subjects.map((subject) => {
          const active = subject.status === 'active';
          const progress = subject.id === 'discrete' ? discreteProgress : 0;

          return (
            <button
              key={subject.id}
              className={'subj-card ' + (active ? 'active' : 'soon')}
              disabled={!active}
              onClick={() => active && onOpen(subject.id)}
            >
              {!active && <span className="subj-soon-badge">Ще в розробці</span>}
              <div className="subj-top" style={{ background: 'color-mix(in oklab, ' + subject.color + ', transparent 90%)' }}>
                <div
                  className="subj-icon"
                  style={{ color: subject.color, background: 'color-mix(in oklab, ' + subject.color + ', transparent 82%)' }}
                >
                  {SUBJECT_ICONS[subject.icon]}
                </div>
              </div>
              <div className="subj-body">
                <div className="subj-name">{subject.name}</div>
                <div className="subj-desc">{subject.desc}</div>
                {active ? (
                  <div className="subj-foot">
                    <div className="subj-bar">
                      <i style={{ width: progress + '%', background: subject.color }} />
                    </div>
                    <b>{progress}%</b>
                  </div>
                ) : (
                  <div className="subj-foot">Незабаром</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
