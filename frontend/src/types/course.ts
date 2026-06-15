export type ChapterStatus = "open" | "locked";

export type LessonSection = "theory" | "practice" | "questions";

export interface Chapter {
  id: string;
  number: string;
  title: string;
  description: string;
  status: ChapterStatus;
}

export interface Subject {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  status: ChapterStatus;
  accent: string;
}

export interface Formula {
  label: string;
  value: string;
}

export interface Term {
  title: string;
  text: string;
}

export interface GraphSubtopic {
  id: string;
  number: string;
  title: string;
  page: string;
  summary: string;
  theory: string[];
  terms: Term[];
  formulas: Formula[];
  practice: string[];
  questions: string[];
}

export interface ProgressState {
  completed: Record<string, LessonSection[]>;
}
