import { CheckCircle2, ChevronRight } from "lucide-react";
import type { GraphSubtopic } from "../types/course";

interface TopicRowProps {
  topic: GraphSubtopic;
  progress: number;
  onOpen: () => void;
}

export function TopicRow({ topic, progress, onOpen }: TopicRowProps) {
  const complete = progress === 100;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-5 rounded-[22px] border border-line bg-white p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-accent hover:shadow-lift"
    >
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] border border-line bg-slate-50 font-mono text-base font-semibold text-accent">
        {topic.number}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-display text-xl font-extrabold text-navy">{topic.title}</span>
        <span className="mt-2 block font-serif text-base leading-7 text-slate-600">{topic.summary}</span>
        <span className="mt-3 flex items-center gap-3 text-xs font-extrabold uppercase tracking-wider text-slate-500">
          {topic.page}
          <span className="h-1 w-1 rounded-full bg-line" />
          теорія + практика + питання
        </span>
      </span>

      <span className="hidden w-24 shrink-0 items-center gap-2 sm:flex">
        <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <span className="block h-full rounded-full bg-green" style={{ width: `${progress}%` }} />
        </span>
        {complete ? <CheckCircle2 size={18} className="text-green" aria-hidden="true" /> : null}
      </span>

      <ChevronRight size={20} className="shrink-0 text-accent" aria-hidden="true" />
    </button>
  );
}
