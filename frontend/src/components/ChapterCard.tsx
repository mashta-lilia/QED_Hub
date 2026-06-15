import { BookOpen, Lock, Unlock } from "lucide-react";
import type { Chapter } from "../types/course";

interface ChapterCardProps {
  chapter: Chapter;
  progress: number;
  onOpen: () => void;
}

export function ChapterCard({ chapter, progress, onOpen }: ChapterCardProps) {
  const isOpen = chapter.status === "open";

  return (
    <button
      type="button"
      disabled={!isOpen}
      onClick={onOpen}
      className="group flex w-full items-center gap-5 rounded-[22px] border border-line bg-white p-5 text-left shadow-soft transition enabled:hover:-translate-y-0.5 enabled:hover:border-accent enabled:hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-line bg-slate-50 font-mono text-base font-semibold text-slate-600 group-enabled:group-hover:border-accent group-enabled:group-hover:text-accent">
        {chapter.number}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-display text-xl font-extrabold text-navy">
          <BookOpen size={18} className={isOpen ? "text-accent" : "text-slate-400"} aria-hidden="true" />
          {chapter.title}
        </span>
        <span className="mt-2 block font-serif text-base leading-7 text-slate-600">{chapter.description}</span>
        <span className="mt-3 block h-2 overflow-hidden rounded-full bg-slate-100">
          <span className="block h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
        </span>
      </span>

      <span className="shrink-0 text-slate-400">
        {isOpen ? <Unlock size={20} aria-hidden="true" /> : <Lock size={20} aria-hidden="true" />}
      </span>
    </button>
  );
}
