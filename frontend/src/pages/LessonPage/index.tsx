import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, HelpCircle, ListChecks } from "lucide-react";
import { useState } from "react";
import type { GraphSubtopic, LessonSection } from "../../types/course";
import { isSectionDone, sectionLabels } from "../../utils/progress";
import type { ProgressState } from "../../types/course";

interface LessonPageProps {
  topic: GraphSubtopic;
  progress: ProgressState;
  onComplete: (topicId: string, section: LessonSection) => void;
}

const sectionIcons = {
  theory: BookOpen,
  practice: ListChecks,
  questions: HelpCircle,
};

const lessonSections: LessonSection[] = ["theory", "practice", "questions"];

export function LessonPage({ topic, progress, onComplete }: LessonPageProps) {
  const [activeSection, setActiveSection] = useState<LessonSection>("theory");
  const activeIndex = lessonSections.indexOf(activeSection);
  const ActiveIcon = sectionIcons[activeSection];

  function goToSection(index: number) {
    const next = lessonSections[Math.max(0, Math.min(lessonSections.length - 1, index))];
    setActiveSection(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="page-reveal mx-auto max-w-6xl px-4 pb-32 pt-10 sm:px-8">
      <div className="rounded-[28px] border border-line bg-white p-7 shadow-soft">
        <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-accent">
          Підтема {topic.number} · {topic.page}
        </p>
        <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-navy">{topic.title}</h1>
        <p className="mt-4 max-w-4xl font-serif text-xl leading-8 text-slate-600">{topic.summary}</p>
      </div>

      <section className="mt-6 rounded-[28px] border border-line bg-white p-7 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <ActiveIcon size={20} className="text-accent" aria-hidden="true" />
          <h2 className="font-display text-2xl font-extrabold text-navy">{sectionLabels[activeSection]}</h2>
        </div>

        {activeSection === "theory" ? <TheoryContent topic={topic} /> : null}
        {activeSection === "practice" ? <ListContent items={topic.practice} /> : null}
        {activeSection === "questions" ? <ListContent items={topic.questions} ordered /> : null}

        <button
          type="button"
          onClick={() => onComplete(topic.id, activeSection)}
          className="mt-8 inline-flex items-center gap-2 rounded-[16px] bg-green px-5 py-3 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:brightness-105"
        >
          <CheckCircle2 size={18} aria-hidden="true" />
          Позначити як пройдено
        </button>
      </section>

      <nav className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-line bg-white/95 px-5 py-3 shadow-float backdrop-blur-xl">
        <button
          type="button"
          disabled={activeIndex === 0}
          onClick={() => goToSection(activeIndex - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-accent transition hover:bg-blue-50 disabled:text-slate-300"
          aria-label="Попередня сторінка"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2">
          {lessonSections.map((section, index) => {
            const isActive = section === activeSection;
            const isDone = isSectionDone(progress, topic.id, section);

            return (
              <button
                key={section}
                type="button"
                onClick={() => goToSection(index)}
                title={sectionLabels[section]}
                className={[
                  "h-3 rounded-full transition",
                  isActive ? "w-9 bg-accent" : isDone ? "w-3 bg-green" : "w-3 bg-slate-300 hover:bg-accent",
                ].join(" ")}
                aria-label={sectionLabels[section]}
              />
            );
          })}
        </div>

        <button
          type="button"
          disabled={activeIndex === lessonSections.length - 1}
          onClick={() => goToSection(activeIndex + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-accent transition hover:bg-blue-50 disabled:text-slate-300"
          aria-label="Наступна сторінка"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>

        <div className="min-w-16 border-l border-line pl-3 text-center font-mono text-sm font-semibold text-slate-500">
          {String(activeIndex + 1).padStart(2, "0")} / {String(lessonSections.length).padStart(2, "0")}
        </div>
      </nav>
    </main>
  );
}

function TheoryContent({ topic }: { topic: GraphSubtopic }) {
  return (
    <div className="grid gap-5">
      <LessonGraphFigure />

      <div className="prose-block">
        {topic.theory.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {topic.terms.map((term) => (
          <article key={term.title} className="rounded-[20px] border border-line bg-slate-50 p-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-accent">{term.title}</h3>
            <p className="mt-2 font-serif text-base leading-7 text-slate-600">{term.text}</p>
          </article>
        ))}
      </div>

      {topic.formulas.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {topic.formulas.map((formula) => (
            <div key={formula.label} className="rounded-[20px] border border-line bg-navy p-5 text-white">
              <div className="text-xs font-extrabold uppercase tracking-wider text-sky-200">{formula.label}</div>
              <div className="mt-2 font-mono text-lg">{formula.value}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ListContent({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";

  return (
    <Tag className="grid gap-3">
      {items.map((item, index) => (
        <li key={item} className="flex gap-3 rounded-[20px] border border-line bg-slate-50 p-5 font-serif text-base leading-7 text-slate-700">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white font-mono text-xs font-bold text-accent shadow-sm">
            {ordered ? index + 1 : "✓"}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </Tag>
  );
}

function LessonGraphFigure() {
  return (
    <figure className="lesson-figure">
      <svg viewBox="0 0 720 520" role="img" aria-label="Діаграма простого графа">
        <g className="lesson-lines">
          <line x1="220" y1="140" x2="220" y2="370" />
          <line x1="220" y1="140" x2="500" y2="370" />
          <line x1="220" y1="370" x2="500" y2="370" />
          <line x1="500" y1="140" x2="500" y2="370" />
          <line x1="500" y1="140" x2="220" y2="370" />
        </g>
        {[
          { id: "1", x: 220, y: 140 },
          { id: "2", x: 500, y: 140 },
          { id: "3", x: 220, y: 370 },
          { id: "4", x: 500, y: 370 },
        ].map((node) => (
          <g key={node.id} className="lesson-node">
            <circle cx={node.x} cy={node.y} r="34" />
            <text x={node.x} y={node.y + 12} textAnchor="middle">
              {node.id}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>Діаграма графа G1 — точки (вершини) та лінії (ребра).</figcaption>
    </figure>
  );
}
