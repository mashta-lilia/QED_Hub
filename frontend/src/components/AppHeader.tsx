import { ChevronLeft, Flame } from "lucide-react";

interface AppHeaderProps {
  title: string;
  subtitle: string;
  xp: number;
  onBack?: () => void;
  backLabel?: string;
}

export function AppHeader({ title, subtitle, xp, onBack, backLabel }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-mist/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-line bg-white px-3 text-sm font-extrabold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:text-accent sm:px-4"
            >
              <ChevronLeft size={19} aria-hidden="true" />
              <span className="hidden sm:inline">{backLabel ?? "Назад"}</span>
            </button>
          ) : null}

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-navy text-white shadow-soft">
            <span className="brand-ring" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <div className="truncate font-display text-xl font-extrabold text-navy sm:text-2xl">{title}</div>
            <div className="truncate text-sm font-medium text-slate-500">{subtitle}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          
          <div className="flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 shadow-soft">
            <Flame size={18} className="fill-amber text-amber" aria-hidden="true" />
            <span className="text-lg font-extrabold text-amber">4</span>
            <span className="hidden text-sm font-semibold text-slate-500 sm:inline">днів поспіль</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-base font-extrabold text-white shadow-soft">
            S
          </div>
        </div>
      </div>
    </header>
  );
}
