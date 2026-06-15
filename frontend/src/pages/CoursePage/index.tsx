import { ChapterCard } from "../../components/ChapterCard";
import { ProgressCard } from "../../components/ProgressCard";
import type { Chapter } from "../../types/course";

interface CoursePageProps {
  chapters: Chapter[];
  graphProgress: number;
  courseProgress: number;
  xp: number;
  onOpenGraphs: () => void;
}

export function CoursePage({ chapters, graphProgress, courseProgress, xp, onOpenGraphs }: CoursePageProps) {
  return (
    <main className="page-reveal mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[1fr_380px]">
      <section>
        <div className="mb-8">
          <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-accent">Дискретна математика</p>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-tight text-navy">Теми курсу</h1>
          <p className="mt-5 max-w-3xl font-serif text-2xl leading-9 text-slate-600">
            Оберіть тему, щоб перейти до занять — теорія та практика в одному потоці.
          </p>
        </div>

        <div className="grid gap-4">
          {chapters.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              progress={chapter.id === "graphs" ? graphProgress : 0}
              onOpen={chapter.id === "graphs" ? onOpenGraphs : () => undefined}
            />
          ))}
        </div>
      </section>

      <ProgressCard
        title="Ваш прогрес"
        progress={courseProgress}
        xp={xp}
        done={graphProgress === 100 ? 1 : 0}
        total={chapters.length}
        actionLabel="Продовжити"
        onAction={onOpenGraphs}
      />
    </main>
  );
}
