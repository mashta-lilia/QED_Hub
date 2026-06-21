import { useEffect } from 'react';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
  streak: number;
  xp: number;
  lessonsDone?: number;
  totalLessons?: number;
  overall?: number;
}

const IcFlag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 21V4M5 4h11l-1.5 4L16 12H5" />
  </svg>
);

const IcFlame = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c.5 3.5-2 5-3 6.5C7.5 10.8 7 12.3 7 14a5 5 0 0 0 10 0c0-2-1-3.8-2.3-5.2-.6.9-1.4 1.3-2 1.2.9-2.2.4-5.4-.7-8z" />
  </svg>
);

const IcStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3.5l2.6 5.3 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.5l1-5.8L3.5 9.6l5.9-.8z" />
  </svg>
);

const IcTrophy = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 19h6M10 19v-3M14 19v-3" />
  </svg>
);

export function ProfileModal({
  open,
  onClose,
  onLogout,
  darkMode,
  onToggleDark,
  streak,
  xp,
  lessonsDone = 0,
  totalLessons = 1,
  overall = 0,
}: ProfileModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const displayName = 'Студент';
  const role = 'Студент · Дискретна математика';
  const initials = 'С';
  const safeTotal = Math.max(1, totalLessons);
  const level = Math.floor(xp / 100) + 1;
  const levelProgress = xp % 100;
  const badges = [
    { on: lessonsDone > 0, label: 'Перший крок', icon: <IcFlag /> },
    { on: streak >= 3, label: 'Серія 3+ дні', icon: <IcFlame /> },
    { on: xp >= 50, label: '50 XP', icon: <IcStar /> },
    { on: lessonsDone >= safeTotal, label: 'Тему пройдено', icon: <IcTrophy /> },
  ];

  return (
    <div className="ov-backdrop" onClick={onClose}>
      <aside className="ov-card" onClick={(event) => event.stopPropagation()}>
        <div className="pf-top">
          <button className="ov-close" onClick={onClose} title="Закрити">✕</button>
          <div className="pf-av">{initials}</div>
          <div className="pf-id">
            <div className="pf-name">{displayName}</div>
            <div className="pf-sub">{role}</div>
          </div>
        </div>

        <div className="pf-lvl">
          <div className="pf-lvl-row">
            <span className="pf-lvl-tag">Рівень {level}</span>
            <span className="pf-lvl-xp">{levelProgress} / 100 XP до рівня {level + 1}</span>
          </div>
          <div className="pf-lvl-bar">
            <i style={{ width: `${levelProgress}%` }} />
          </div>
        </div>

        <div className="pf-grid">
          <div className="pf-stat">
            <b>{xp}</b>
            <span>усього XP</span>
          </div>
          <div className="pf-stat">
            <b>{streak}</b>
            <span>днів поспіль</span>
          </div>
          <div className="pf-stat">
            <b>{lessonsDone}/{safeTotal}</b>
            <span>пройдено</span>
          </div>
        </div>

        <div className="pf-sec">
          <div className="pf-sec-t">Досягнення · курс на {overall}%</div>
          <div className="pf-badges">
            {badges.map((badge) => (
              <div key={badge.label} className={`pf-badge ${badge.on ? 'on' : 'off'}`}>
                <div className="ic">{badge.icon}</div>
                <small>{badge.label}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="pf-setting">
          <span>Темна тема</span>
          <button className={`pf-toggle ${darkMode ? 'on' : ''}`} onClick={onToggleDark} aria-pressed={darkMode} title="Перемкнути тему">
            <span />
          </button>
        </div>

        <div className="pf-foot">
          <button className="pf-btn" onClick={onClose}>Повернутися до навчання</button>
          <button className="pf-logout" onClick={onLogout}>Вийти з акаунту</button>
        </div>
      </aside>
    </div>
  );
}
