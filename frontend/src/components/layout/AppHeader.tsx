import { APP_NAME } from '../../data/subjects';
import { ChevL } from '../common/Icons';
import { QedMark, QedMarkDark } from '../common/QedLogo';
import { StreakBadge } from '../common/StreakBadge';
import { ThemeToggle } from '../common/ThemeToggle';

interface AppHeaderProps {
  streak: number;
  onBack?: () => void;
  backLabel?: string;
  onProfileOpen: () => void;
  initials?: string;
  avatarDataUrl?: string;
  darkMode?: boolean;
  onToggleDark: () => void;
}

export function AppHeader({ streak, onBack, backLabel, onProfileOpen, initials = 'С', avatarDataUrl, darkMode, onToggleDark }: AppHeaderProps) {
  return (
    <div className="apphdr">
      <div className="ah-brand">
        {darkMode
          ? <QedMarkDark size="sm" bgColor="#0a1120" />
          : <QedMark size="sm" surfaceClassName="border-bg" />
        }
        <span className="ah-wordmark">{APP_NAME}</span>
        {onBack && (
          <button className="ah-back" onClick={onBack}>
            <ChevL /> {backLabel || 'Назад'}
          </button>
        )}
      </div>

      <div className="ah-right">
        <ThemeToggle darkMode={Boolean(darkMode)} onToggle={onToggleDark} />
        <StreakBadge days={streak} className="shrink-0" />

        <button className="ah-avatar" title="Профіль" onClick={onProfileOpen}>
          {avatarDataUrl ? <img src={avatarDataUrl} alt="Фото профілю" /> : initials}
        </button>
      </div>
    </div>
  );
}
