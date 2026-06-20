// ─── Graph primitives ────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  directed?: boolean;
  weight?: number;
  label?: string;
  color?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
}

// ─── Theory building blocks ──────────────────────────────────────────────────

export interface Definition {
  id: string;
  term: string;
  body: string;
  formula?: string;
}

export interface Theorem {
  id: string;
  name: string;
  statement: string;
  formula?: string;
  proof?: string;
}

export interface WorkedExample {
  id: string;
  title: string;
  description: string;
  graph?: GraphData;
}

export interface TheorySection {
  definitions: Definition[];
  theorems: Theorem[];
  workedExamples: WorkedExample[];
  visualizationHints: {
    animations: string[];
    staticDiagrams: string[];
    hardConcepts: string[];
  };
}

// ─── Task types ───────────────────────────────────────────────────────────────

export type TaskType =
  | 'graph-build'    // student draws a graph
  | 'matrix-fill'    // student fills a matrix / table
  | 'node-click'     // student clicks specific nodes
  | 'edge-click'     // student clicks specific edges
  | 'repair'         // student fixes a broken graph
  | 'impossibility'  // student declares something impossible / answers exists?
  | 'order-steps'    // student reassembles an ordered proof
  | 'compute'        // student types a numeric / symbolic answer
  | 'path-trace'     // student walks edges to trace a (shortest) path
  | 'euler-trace'    // student traverses every edge exactly once
  | 'hamilton-trace' // student visits every vertex once and returns
  | 'color-assign';  // student assigns colors to nodes

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Task {
  id: string;
  type: TaskType;
  difficulty: Difficulty;
  title: string;
  prompt: string;
  providedData: Record<string, unknown>;
  validation: Record<string, unknown>;
  adversarial: string;
  xp: number;
}

// ─── Topic ────────────────────────────────────────────────────────────────────

export type Complexity = 'foundational' | 'intermediate' | 'advanced';

export interface Topic {
  id: string;
  number: string;
  title: string;
  complexity: Complexity;
  prerequisites: string[];
  estimatedHours: string;
  assessmentGate: boolean;
  theory: TheorySection;
  tasks: Task[];
}
