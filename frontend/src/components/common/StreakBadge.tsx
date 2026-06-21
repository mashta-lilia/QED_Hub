import { type FC } from 'react';

interface StreakBadgeProps {
  days: number;
  atRisk?: boolean;
  className?: string;
}

function dayWord(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;

  if (mod100 >= 11 && mod100 <= 14) return 'днів';
  if (mod10 === 1) return 'день';
  if (mod10 >= 2 && mod10 <= 4) return 'дні';
  return 'днів';
}

const Flame: FC<{ lit: boolean }> = ({ lit }) => (
  <span className={`streak-flame ${lit ? 'lit' : 'dim'}`} aria-hidden="true">
    <span className="streak-flame-shape" />
    {lit && <span className="streak-flame-core" />}
  </span>
);

export const StreakBadge: FC<StreakBadgeProps> = ({
  days,
  atRisk = false,
  className = '',
}) => {
  const lit = !atRisk;

  return (
    <div
      className={[
        'streak-badge',
        lit ? 'is-lit' : 'is-risk',
        className,
      ].join(' ')}
      role="status"
      aria-label={`Серія: ${days} ${dayWord(days)}${atRisk ? ', пригасає' : ''}`}
    >
      <Flame lit={lit} />
      <span className="streak-num">{days}</span>
      <span className="streak-word">{atRisk ? 'пригасає' : dayWord(days)}</span>
    </div>
  );
};

export default StreakBadge;
