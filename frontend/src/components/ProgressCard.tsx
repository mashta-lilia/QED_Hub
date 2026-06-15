import { ArrowRight, RotateCcw, Trophy } from "lucide-react";

interface ProgressCardProps {
  title: string;
  progress: number;
  xp: number;
  done: number;
  total: number;
  actionLabel: string;
  onAction: () => void;
  onReset?: () => void;
}

export function ProgressCard({
  title,
  progress,
  xp,
  done,
  total,
  actionLabel,
  onAction,
  onReset,
}: ProgressCardProps) {
  const circleStyle = {
    background: `conic-gradient(#2f6fdb ${progress * 3.6}deg, #e8eff8 0deg)`,
  };

  return (
  <aside className="rounded-[28px] border border-line bg-white p-8 shadow-float lg:sticky lg:top-28 lg:self-start">
      <div className="text-center font-display text-2xl font-extrabold text-navy">{title}</div>

      <div className="mt-7 flex justify-center">
        <div className="flex h-40 w-40 items-center justify-center rounded-full" style={circleStyle}>
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
            <span className="font-display text-5xl font-extrabold text-navy">{progress}</span>
            <span className="text-xs font-semibold text-slate-500">%</span>
          </div>
        </div>
      </div>

      <div className="mt-7 divide-y divide-line border-y border-line">
        <div className="flex items-center justify-between py-4 text-lg">
          <span className="text-slate-600">Завершено</span>
          <strong className="text-navy">
            {done} / {total}
          </strong>
        </div>
        <div className="flex items-center justify-between py-4 text-lg">
          <span className="text-slate-600">Досвід</span>
          <strong className="flex items-center gap-1 text-navy">
            <Trophy size={16} className="text-amber" aria-hidden="true" />
            {xp} XP
          </strong>
        </div>
      </div>

      <button
        type="button"
        onClick={onAction}
        className="mt-7 flex w-full items-center justify-center gap-3 rounded-[18px] bg-accent px-5 py-4 font-display text-lg font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:brightness-105"
      >
        {actionLabel}
        <ArrowRight size={17} aria-hidden="true" />
      </button>

      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[16px] border border-line bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-accent hover:text-accent"
        >
          <RotateCcw size={16} aria-hidden="true" />
          Скинути прогрес
        </button>
      ) : null}
    </aside>
  );
}
