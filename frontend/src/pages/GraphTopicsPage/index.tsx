import { ProgressCard } from "../../components/ProgressCard";
import { TopicRow } from "../../components/TopicRow";
import type { GraphSubtopic } from "../../types/course";

interface GraphTopicsPageProps {
  topics: GraphSubtopic[];
  progressByTopic: Record<string, number>;
  overallProgress: number;
  xp: number;
  onOpenTopic: (topicId: string) => void;
  onContinue: () => void;
  onReset: () => void;
}

export function GraphTopicsPage({
  topics,
  progressByTopic,
  overallProgress,
  xp,
  onOpenTopic,
  onContinue,
  onReset,
}: GraphTopicsPageProps) {
  const doneCount = topics.filter((topic) => progressByTopic[topic.id] === 100).length;

  return (
    <main className="page-reveal mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[1fr_380px]">
      <section>
        <div className="mb-8">
          <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-accent">Розділ 4 · Теорія графів</p>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-tight text-navy">Підтеми розділу</h1>
          <p className="mt-5 max-w-3xl font-serif text-2xl leading-9 text-slate-600">
            Кожна підтема має окрему теорію, практику та питання по теорії.
          </p>
        </div>

        <div className="grid gap-4">
          {topics.map((topic) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              progress={progressByTopic[topic.id] ?? 0}
              onOpen={() => onOpenTopic(topic.id)}
            />
          ))}
        </div>
      </section>

      <ProgressCard
        title="Прогрес розділу"
        progress={overallProgress}
        xp={xp}
        done={doneCount}
        total={topics.length}
        actionLabel="Продовжити"
        onAction={onContinue}
        onReset={onReset}
      />
    </main>
  );
}
