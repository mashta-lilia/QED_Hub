import { useEffect, useMemo, useState } from "react";
import type { LessonSection, ProgressState } from "../types/course";
import { emptyProgress } from "../utils/progress";

const STORAGE_KEY = "graph-theory-react-progress";

function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressState) : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const actions = useMemo(
    () => ({
      complete(topicId: string, section: LessonSection) {
        setProgress((current) => {
          const existing = current.completed[topicId] ?? [];
          if (existing.includes(section)) return current;

          return {
            completed: {
              ...current.completed,
              [topicId]: [...existing, section],
            },
          };
        });
      },
      reset() {
        setProgress(emptyProgress());
      },
    }),
    [],
  );

  return { progress, ...actions };
}
