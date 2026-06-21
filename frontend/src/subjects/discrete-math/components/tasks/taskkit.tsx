// Shared building blocks for the data-driven task engines.
// Every interactive task in a module is a `Task` (see ../../types) rendered by an
// engine in ./engines.tsx; the engines share the primitives and helpers below so
// that adding a task means adding DATA, not a new component.

import { useState } from 'react';
import type { ReactNode } from 'react';
import { RichText } from '../../../../lib/math';
import type { GraphData, GraphEdge, GraphNode, Task } from '../../types';
import { edgeKey } from '../GT01/GraphVisuals';

/* ── Feedback ─────────────────────────────────────────────── */

export type FeedbackKind = 'idle' | 'ok' | 'bad';
export interface FeedbackState {
  kind: FeedbackKind;
  message: string;
}
export const IDLE: FeedbackState = { kind: 'idle', message: '' };

export function StatusMark({ kind }: { kind: FeedbackKind }) {
  if (kind === 'idle') return null;
  const ok = kind === 'ok';
  return (
    <svg viewBox="0 0 24 24" className={ok ? 'h-5 w-5 text-green-700' : 'h-5 w-5 text-red-700'} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {ok ? <path d="M20 6 9 17l-5-5" /> : <path d="M6 6l12 12M18 6 6 18" />}
    </svg>
  );
}

export function Feedback({ state }: { state: FeedbackState }) {
  if (state.kind === 'idle') return null;
  return (
    <div className={['mt-4 flex items-start gap-3 rounded-2xl border p-4 text-sm leading-6', state.kind === 'ok' ? 'border-green-200 bg-green-50 text-green-900' : 'border-red-200 bg-red-50 text-red-900'].join(' ')}>
      <StatusMark kind={state.kind} />
      <RichText tag="span" text={state.message} />
    </div>
  );
}

/* ── Buttons & shell ──────────────────────────────────────── */

export function ActionButton({
  children,
  onClick,
  tone = 'primary',
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: 'primary' | 'quiet' | 'danger';
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'min-h-[42px] rounded-xl border px-4 py-2 font-head text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50',
        tone === 'primary' && 'border-accent bg-accent text-white shadow-sm hover:brightness-105',
        tone === 'quiet' && 'border-line bg-white text-navy hover:border-accent/50 hover:bg-accent/5',
        tone === 'danger' && 'border-red-200 bg-red-50 text-red-700 hover:border-red-300',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}

const DIFFICULTY_LABEL: Record<string, string> = { easy: 'легко', medium: 'середньо', hard: 'складно' };

export function TaskShell({ children, task }: { children: ReactNode; task: Task }) {
  return (
    <article className="rounded-[24px] border border-line bg-white p-5 shadow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] text-accent">
            {DIFFICULTY_LABEL[task.difficulty] || task.difficulty} · {task.type}
          </p>
          <h2 className="mt-2 font-head text-2xl font-extrabold leading-tight text-navy">{task.title}</h2>
        </div>
        <span className="shrink-0 rounded-full border border-accent/25 bg-accent/5 px-3 py-1 font-head text-xs font-extrabold text-accent">+{task.xp} XP</span>
      </div>
      <RichText tag="p" className="mt-3 font-serif text-base leading-7 text-slate-700" text={task.prompt} />
      <div className="mt-5">{children}</div>
    </article>
  );
}

export function HintRow({ hint, reveal }: { hint?: string; reveal?: string }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {hint && <Disclosure label="Підказка" text={hint} tone="amber" />}
      {reveal && <Disclosure label="Розв’язання" text={reveal} tone="slate" />}
    </div>
  );
}

function Disclosure({ label, text, tone }: { label: string; text: string; tone: 'amber' | 'slate' }) {
  const [open, setOpen] = useState(false);
  const palette = tone === 'amber' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-line bg-slate-50 text-slate-700';
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-xl border border-line bg-white px-3 py-1.5 font-head text-xs font-bold text-slate-600 transition hover:border-accent/50 hover:text-accent"
      >
        {open ? `Сховати ${label.toLowerCase()}` : label}
      </button>
      {open && <RichText tag="p" className={`mt-2 rounded-2xl border p-4 font-serif text-sm leading-7 ${palette}`} text={text} />}
    </div>
  );
}

/* ── Degree chips ─────────────────────────────────────────── */

export function DegreeChips({ current, target, labels }: { current: number[]; target?: number[]; labels: string[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
      {labels.map((label, index) => {
        const ok = target ? current[index] === target[index] : true;
        return (
          <div key={label} className={['rounded-2xl border p-3 text-center font-head', ok ? 'border-green-200 bg-green-50 text-green-900' : 'border-amber-200 bg-amber-50 text-amber-900'].join(' ')}>
            <p className="text-xs font-bold uppercase tracking-[0.12em]">v{label}</p>
            <p className="mt-1 text-xl font-extrabold">
              {current[index]}
              {target && <span className="text-sm font-bold text-slate-500"> / {target[index]}</span>}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ── Graph helpers ────────────────────────────────────────── */

export function ringNodes(count: number, width = 520, height = 360, radius = 140): GraphNode[] {
  const cx = width / 2;
  const cy = height / 2;
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
    const id = String(index + 1);
    return { id, label: id, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
}

export function completeEdges(nodes: GraphNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      edges.push({ id: edgeKey(nodes[i].id, nodes[j].id), source: nodes[i].id, target: nodes[j].id });
    }
  }
  return edges;
}

export function selectedGraph(nodes: GraphNode[], slots: GraphEdge[], selected: string[], directed = false): GraphData {
  return { nodes, edges: slots.filter((edge) => selected.includes(edge.id)), directed, weighted: false };
}

export function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

// Deterministic shuffle (seeded) so a task's option order is stable across renders.
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[·*×]/g, '')
    .replace(/[’']/g, '')
    .trim();
}

/* ── Engine data shapes (providedData casts) ──────────────── */

export type BuildGoal =
  | { kind: 'degreeSequence'; sequence: number[] }
  | { kind: 'regular'; k: number }
  | { kind: 'edgeCount'; count: number }
  | { kind: 'targetDegreeSum'; sum: number; edgeCount?: number }
  | { kind: 'tree' }; // connected + acyclic over all vertices (|E| = n−1)

export interface GraphBuildData {
  nodes: GraphNode[];
  presetEdgeIds?: string[];
  goal: BuildGoal;
  impossible?: boolean;        // correct answer is "Неможливо"
  solutionEdgeIds?: string[];  // for "show one example"
  okMessage?: string;
  hint?: string;
  reveal?: string;
}

export interface MatrixFillData {
  graph: GraphData;
  nodeOrder: string[];
  expectedMatrix: number[][];
  symmetric?: boolean;
  hint?: string;
}

export interface NodeClickData {
  graph: GraphData;
  requiredCount: number;
  check: 'equal-degree' | 'pairwise-adjacent' | 'pairwise-nonadjacent' | 'cut-vertex';
  hint?: string;
}

export interface ComputePart {
  label?: string;
  prompt: string;
  answers: string[];
}
export interface ComputeData {
  graph?: GraphData;
  showDegrees?: boolean; // label vertices with their degree on the diagram
  parts: ComputePart[];
  hint?: string;
  reveal?: string;
}

export interface DecisionPart {
  label?: string;
  prompt: string;
  answer: 'yes' | 'no';
  why: string;
}
export interface DecisionData {
  graph?: GraphData;
  parts: DecisionPart[];
  hint?: string;
}

export interface OrderStepsData {
  claim: string;          // statement being proved (RichText)
  steps: string[];        // the proof, in correct order
  distractors?: string[]; // tempting-but-wrong lines to leave out
  graph?: GraphData;      // optional visual companion
  hint?: string;
}

export interface PathTraceData {
  graph: GraphData;
  start: string;
  end: string;
  requireShortest?: boolean; // path length must equal the BFS distance
  hint?: string;
  reveal?: string;
}

export interface EdgeClickData {
  graph: GraphData;
  check: 'bridge';
  hint?: string;
}

export interface EulerTraceData {
  graph: GraphData;
  start: string;
  requireCycle?: boolean; // must return to start (Euler cycle vs open trail)
  hint?: string;
  reveal?: string;
}

export interface HamiltonTraceData {
  graph: GraphData;
  start: string;
  hint?: string;
  reveal?: string;
}

/* ── Distance / connectivity primitives (BFS-based) ────────── */

export function adjacencyMap(graph: GraphData): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  graph.nodes.forEach((node) => map.set(node.id, new Set()));
  graph.edges.forEach((edge) => {
    map.get(edge.source)?.add(edge.target);
    if (!graph.directed) map.get(edge.target)?.add(edge.source);
  });
  return map;
}

export function edgeBetween(graph: GraphData, u: string, v: string): GraphEdge | undefined {
  return graph.edges.find(
    (e) => (e.source === u && e.target === v) || (!graph.directed && e.source === v && e.target === u),
  );
}

// BFS distances from `source`; unreachable vertices are simply absent.
export function bfsDistances(graph: GraphData, source: string): Map<string, number> {
  const adj = adjacencyMap(graph);
  const dist = new Map<string, number>([[source, 0]]);
  const queue: string[] = [source];
  while (queue.length) {
    const u = queue.shift() as string;
    for (const v of adj.get(u) ?? []) {
      if (!dist.has(v)) {
        dist.set(v, (dist.get(u) as number) + 1);
        queue.push(v);
      }
    }
  }
  return dist;
}

export function distance(graph: GraphData, u: string, v: string): number {
  return bfsDistances(graph, u).get(v) ?? Infinity;
}

export function eccentricity(graph: GraphData, v: string): number {
  const dist = bfsDistances(graph, v);
  if (dist.size < graph.nodes.length) return Infinity; // disconnected
  return Math.max(...dist.values());
}

export function radiusDiameterCenter(graph: GraphData): { radius: number; diameter: number; center: string[] } {
  const ecc = graph.nodes.map((n) => [n.id, eccentricity(graph, n.id)] as const);
  const finite = ecc.map(([, e]) => e).filter((e) => Number.isFinite(e));
  const radius = finite.length ? Math.min(...finite) : Infinity;
  const diameter = finite.length ? Math.max(...finite) : Infinity;
  const center = ecc.filter(([, e]) => e === radius).map(([id]) => id);
  return { radius, diameter, center };
}

export function components(graph: GraphData): string[][] {
  const adj = adjacencyMap(graph);
  const seen = new Set<string>();
  const out: string[][] = [];
  for (const node of graph.nodes) {
    if (seen.has(node.id)) continue;
    const comp: string[] = [];
    const stack = [node.id];
    seen.add(node.id);
    while (stack.length) {
      const u = stack.pop() as string;
      comp.push(u);
      for (const v of adj.get(u) ?? []) {
        if (!seen.has(v)) {
          seen.add(v);
          stack.push(v);
        }
      }
    }
    out.push(comp);
  }
  return out;
}

export function isConnected(graph: GraphData): boolean {
  return graph.nodes.length <= 1 || components(graph).length === 1;
}

export function isCutVertex(graph: GraphData, v: string): boolean {
  const sub: GraphData = {
    ...graph,
    nodes: graph.nodes.filter((n) => n.id !== v),
    edges: graph.edges.filter((e) => e.source !== v && e.target !== v),
  };
  return components(sub).length > components(graph).length;
}

export function isBridge(graph: GraphData, edge: GraphEdge): boolean {
  const sub: GraphData = { ...graph, edges: graph.edges.filter((e) => e.id !== edge.id) };
  return components(sub).length > components(graph).length;
}
