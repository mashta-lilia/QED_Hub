import { APP_NAME } from '../../data/subjects';
import { ChevL } from '../common/Icons';

interface AppHeaderProps {
  streak: number;
  onBack?: () => void;
  backLabel?: string;
  onLogout?: () => void;
}

export function AppHeader({ streak, onBack, backLabel, onLogout }: AppHeaderProps) {
  return (
    <div className="apphdr">
      <div className="ah-brand">
        {onBack && (
          <button className="ah-back" onClick={onBack}>
            <ChevL /> {backLabel || 'Назад'}
          </button>
        )}
        <div className="tb-logo">
          <span />
        </div>
        <div className="ah-name">{APP_NAME}</div>
      </div>
      <div className="ah-right">
        <div className="ah-streak">
          <span className="tb-flame" />
          <b>{streak}</b>
          <em>днів поспіль</em>
        </div>
        <button className="ah-avatar" title="Профіль">
          S
        </button>
        {onLogout && (
          <button className="ah-logout" onClick={onLogout} title="Вийти">
            Вийти
          </button>
        )}
      </div>
    </div>
  );
}
