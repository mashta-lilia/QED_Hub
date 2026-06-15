import { BookOpen, Code2, FunctionSquare } from "lucide-react";
import type { Subject } from "../../types/course";

interface SubjectsPageProps {
  subjects: Subject[];
  discreteProgress: number;
  onOpenDiscrete: () => void;
}

const icons = {
  discrete: BookOpen,
  programming: Code2,
  calculus: FunctionSquare,
};

export function SubjectsPage({ subjects, discreteProgress, onOpenDiscrete }: SubjectsPageProps) {
  return (
    <main className="page-reveal mx-auto max-w-7xl px-4 py-20 sm:px-8">
      <div className="mb-14 text-center">
        <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-accent">Вітаємо знову</p>
        <h1 className="mt-6 font-display text-5xl font-extrabold text-navy sm:text-6xl">Оберіть предмет</h1>
        <p className="mx-auto mt-4 max-w-2xl font-serif text-2xl leading-9 text-slate-600">
          Продовжуйте навчання або почніть новий курс.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {subjects.map((subject) => {
          const Icon = icons[subject.id as keyof typeof icons] ?? BookOpen;
          const isOpen = subject.status === "open";
          const progress = subject.id === "discrete" ? discreteProgress : 0;

          return (
            <button
              key={subject.id}
              type="button"
              disabled={!isOpen}
              onClick={isOpen ? onOpenDiscrete : undefined}
              className="group relative min-h-[305px] overflow-hidden rounded-[28px] border border-line bg-white text-left shadow-soft transition enabled:hover:-translate-y-1 enabled:hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-75"
            >
              {!isOpen ? (
                <span className="absolute right-5 top-5 rounded-full border border-line bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 shadow-sm">
                  Ще в розробці
                </span>
              ) : null}

              <div className="flex h-36 items-center justify-center border-b border-line bg-slate-50/80">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-[22px] text-white shadow-soft"
                  style={{ backgroundColor: `${subject.accent}22`, color: subject.accent }}
                >
                  <Icon size={34} aria-hidden="true" />
                </div>
              </div>

              <div className="p-6">
                <h2 className="font-display text-2xl font-extrabold text-navy disabled:text-slate-500">{subject.title}</h2>
                <p className="mt-4 min-h-16 font-serif text-lg leading-7 text-slate-600">{subject.description}</p>

                {isOpen ? (
                  <div className="mt-6 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="font-mono text-sm font-bold text-navy">{progress}%</span>
                  </div>
                ) : (
                  <div className="mt-6 font-serif text-base text-slate-400">Незабаром</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}
