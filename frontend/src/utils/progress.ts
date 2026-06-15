import type { GraphSubtopic, LessonSection, ProgressState } from "../types/course";

export const sections: LessonSection[] = ["theory", "practice", "questions"];

export const sectionLabels: Record<LessonSection, string> = {
  theory: "Теорія",
  practice: "Практика",
  questions: "Питання",
};

export function emptyProgress(): ProgressState {
  return { completed: {} };
}

export function isSectionDone(progress: ProgressState, topicId: string, section: LessonSection) {
  return progress.completed[topicId]?.includes(section) ?? false;
}

export function topicProgress(progress: ProgressState, topicId: string) {
  const done = progress.completed[topicId]?.length ?? 0;
  return Math.round((done / sections.length) * 100);
}

export function chapterProgress(progress: ProgressState, topics: GraphSubtopic[]) {
  if (topics.length === 0) return 0;
  const sum = topics.reduce((total, topic) => total + topicProgress(progress, topic.id), 0);
  return Math.round(sum / topics.length);
}

export function totalXp(progress: ProgressState) {
  return Object.values(progress.completed).reduce((total, values) => total + values.length * 10, 0);
}
