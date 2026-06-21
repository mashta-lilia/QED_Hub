import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AnswerState, QuizItem } from '../types';

const DEFAULT_STORAGE_KEY = 'graphs_4_v1';

interface SavedProgress {
  answers?: Record<string, AnswerState>;
  workedDone?: boolean;
  visited?: Record<string, boolean>;
}

interface UseLessonProgressOptions {
  quiz: QuizItem[];
  lessonTrack: string[];
  storageKey?: string;
}

function loadProgress(storageKey: string): SavedProgress {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '') || {};
  } catch {
    return {};
  }
}

function saveProgress(storageKey: string, progress: SavedProgress) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  } catch {
    /* ignore */
  }
}

export function useLessonProgress({ quiz, lessonTrack, storageKey = DEFAULT_STORAGE_KEY }: UseLessonProgressOptions) {
  const saved = useRef<SavedProgress>(loadProgress(storageKey));
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(saved.current.answers || {});
  const [workedDone, setWorkedDone] = useState<boolean>(!!saved.current.workedDone);
  const [visited, setVisited] = useState<Record<string, boolean>>(saved.current.visited || {});

  useEffect(() => {
    saveProgress(storageKey, { answers, workedDone, visited });
  }, [answers, workedDone, storageKey, visited]);

  const answer = useCallback((question: QuizItem, result: Partial<AnswerState>) => {
    setAnswers((current) => ({
      ...current,
      [question.id]: { done: true, ok: false, ...result },
    }));
  }, []);

  const completeWorked = useCallback(() => {
    setWorkedDone(true);
  }, []);

  const markVisited = useCallback((pageId: string) => {
    setVisited((current) => ({ ...current, [pageId]: true }));
  }, []);

  const xp = useMemo(() => {
    let value = 0;

    quiz.forEach((question) => {
      if (answers[question.id]?.ok) value += 10;
    });

    if (workedDone) value += 20;

    return value;
  }, [answers, quiz, workedDone]);

  const lessonVisited = useMemo(() => lessonTrack.filter((id) => visited[id]).length, [lessonTrack, visited]);
  const lessonProgressPct = lessonTrack.length === 0 ? 0 : (lessonVisited / lessonTrack.length) * 100;
  const lessonProgress = Math.round(lessonProgressPct);

  return {
    answers,
    answer,
    completeWorked,
    lessonProgress,
    lessonProgressPct,
    lessonVisited,
    markVisited,
    visited,
    workedDone,
    xp,
  };
}
