/* ============================================================
   Shared types for the Graph Theory lesson app.
   ============================================================ */

/* ---- Graph primitives ---- */
export interface GNode {
  id: string;
  x: number;
  y: number;
  r?: number;
  fill?: string;
  /** false hides the label entirely; string overrides the id */
  label?: string | false;
  sub?: string;
}

export type GEdgeTuple = [string, string];
export interface GEdgeObj {
  a: string;
  b: string;
  curve?: number;
  color?: string;
  w?: number;
}
export type GEdge = GEdgeTuple | GEdgeObj;

export interface GraphData {
  nodes: GNode[];
  edges: GEdge[];
}

/* ---- Quiz ---- */
export interface QuizMC {
  id: string;
  type: 'mc';
  prompt: string;
  options: string[];
  correct: number;
  hint: string;
}
export interface QuizTypeIn {
  id: string;
  type: 'typein';
  prompt: string;
  answers: string[];
  hint: string;
}
export type QuizItem = QuizMC | QuizTypeIn;

export interface AnswerState {
  done: boolean;
  ok: boolean;
  picked?: number;
  value?: string;
}

/* ---- Worked solution ---- */
export interface WorkedStep {
  label: string;
  tex: string;
  note: string;
}
export interface Worked {
  title: string;
  subtitle?: string;
  graph?: { nodes: GNode[]; edges: GEdgeTuple[] };
  steps: WorkedStep[];
}

/* ---- Practicals ---- */
export interface PracticalBlock {
  label: string;
  tasks: string[];
}
export interface Practical {
  n: string;
  title: string;
  topics: string[];
  blocks: PracticalBlock[];
}

/* ---- Lesson data (window.GD equivalent) ---- */
export interface LessonData {
  course: string;
  chapterLabel: string;
  chapterTitle: string;
  topicLabel: string;
  topicTitle: string;
  quiz: QuizItem[];
  worked: Worked;
  practicals: Practical[];
}

/* ---- Page descriptors ---- */
export type PageKind = 'theory' | 'theorem' | 'interactive' | 'practice';
export interface PageDescriptor {
  id: string;
  kind: PageKind;
  title: string;
  lead?: string;
}

/* ---- Tweaks ---- */
export interface TweakValues {
  theoryStyle: 'card' | 'panel';
  accent: string;
  headFont: 'Manrope' | 'Spectral' | 'Onest';
}
