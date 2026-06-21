import { GT01 } from '../../data/topics/GT-01-foundations';
import type { GraphData } from '../../types';
import { computeDegrees, FormulaPill, GraphCanvas, edgeKey } from './GraphVisuals';
import { RichText } from '../../../../lib/math';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { GraphNode, GraphEdge, Task } from '../../types';

/* ── Shared helpers ────────────────────────────────────────── */



type FeedbackKind = 'idle' | 'ok' | 'bad';
interface FeedbackState { kind: FeedbackKind; message: string; }

function StatusMark({ kind }: { kind: FeedbackKind }) {
  if (kind === 'idle') return null;
  const ok = kind === 'ok';
  return (
    <svg viewBox="0 0 24 24" className={ok ? 'h-5 w-5 text-green-700' : 'h-5 w-5 text-red-700'} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {ok ? <path d="M20 6 9 17l-5-5" /> : <path d="M6 6l12 12M18 6 6 18" />}
    </svg>
  );
}

function Feedback({ state }: { state: FeedbackState }) {
  if (state.kind === 'idle') return null;
  return (
    <div className={['mt-4 flex items-start gap-3 rounded-2xl border p-4 text-sm leading-6', state.kind === 'ok' ? 'border-green-200 bg-green-50 text-green-900' : 'border-red-200 bg-red-50 text-red-900'].join(' ')}>
      <StatusMark kind={state.kind} />
      <span>{state.message}</span>
    </div>
  );
}

function ActionButton({ children, onClick, tone = 'primary' }: { children: ReactNode; onClick: () => void; tone?: 'primary' | 'quiet' | 'danger'; }) {
  return (
    <button type="button" onClick={onClick}
      className={['min-h-[42px] rounded-xl border px-4 py-2 font-head text-sm font-bold transition',
        tone === 'primary' && 'border-accent bg-accent text-white shadow-sm hover:brightness-105',
        tone === 'quiet' && 'border-line bg-white text-navy hover:border-accent/50 hover:bg-accent/5',
        tone === 'danger' && 'border-red-200 bg-red-50 text-red-700 hover:border-red-300',
      ].filter(Boolean).join(' ')}>
      {children}
    </button>
  );
}

function TaskShell({ children, task }: { children: ReactNode; task: Task }) {
  return (
    <article className="rounded-[24px] border border-line bg-white p-5 shadow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] text-accent">{task.type}</p>
          <h2 className="mt-2 font-head text-2xl font-extrabold leading-tight text-navy">{task.title}</h2>
        </div>
        <span className="rounded-full border border-accent/25 bg-accent/5 px-3 py-1 font-head text-xs font-extrabold text-accent">+{task.xp} XP</span>
      </div>
      <RichText tag="p" className="mt-3 font-serif text-base leading-7 text-slate-700" text={task.prompt} />
      <div className="mt-5">{children}</div>
    </article>
  );
}

function DegreeChips({ current, target, labels }: { current: number[]; target?: number[]; labels: string[]; }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
      {labels.map((label, index) => {
        const ok = target ? current[index] === target[index] : true;
        return (
          <div key={label} className={['rounded-2xl border p-3 text-center font-head', ok ? 'border-green-200 bg-green-50 text-green-900' : 'border-amber-200 bg-amber-50 text-amber-900'].join(' ')}>
            <p className="text-xs font-bold uppercase tracking-[0.12em]">v{label}</p>
            <p className="mt-1 text-xl font-extrabold">{current[index]}{target && <span className="text-sm font-bold text-slate-500"> / {target[index]}</span>}</p>
          </div>
        );
      })}
    </div>
  );
}

function ringNodes(count: number, width = 520, height = 360, radius = 130): GraphNode[] {
  const cx = width / 2;
  const cy = height / 2;
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
    const id = String(index + 1);
    return { id, label: id, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
}

function completeEdges(nodes: GraphNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      edges.push({ id: edgeKey(nodes[i].id, nodes[j].id), source: nodes[i].id, target: nodes[j].id });
    }
  }
  return edges;
}

function selectedGraph(nodes: GraphNode[], slots: GraphEdge[], selected: string[], directed = false): GraphData {
  return { nodes, edges: slots.filter((edge) => selected.includes(edge.id)), directed, weighted: false };
}

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function findTask(id: string): Task {
  const task = GT01.tasks.find((item) => item.id === id);
  if (!task) throw new Error(`Missing task ${id}`);
  return task;
}

const TASKS = {
  sequence: findTask('GT-01-T1'),
  matrix: findTask('GT-01-T2'),
  repair: findTask('GT-01-T3'),
  regular: findTask('GT-01-T4'),
  equal: findTask('GT-01-T5'),
  directed: findTask('GT-01-T6'),
};

/* ── Page 1: Intro ────────────────────────────────────────── */

export function GT01Intro() {
  return (
    <article className="mx-auto grid max-w-4xl gap-6 px-1 py-4">
      <header className="rounded-[24px] border border-line bg-white p-6 shadow">
        <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] text-accent">GT-01 · Тема 4.1</p>
        <h1 className="mt-2 font-head text-4xl font-extrabold leading-tight text-navy">Основи: анатомія графа і нотація</h1>
        <p className="mt-3 max-w-2xl font-serif text-lg leading-8 text-slate-600">
          Формальний конспект із візуальною подачею: граф, формула, матриця і перевірка стоять поруч.
          Пройдіть цей блок крок за кроком — означення, теореми, а потім інтерактивна практика.
        </p>
      </header>
    </article>
  );
}

/* ── Page 2: Anatomy (Theory + Viz) ───────────────────────── */

function DefinitionCard({ definition }: { definition: (typeof GT01.theory.definitions)[number] }) {
  return (
    <article className="rounded-[18px] border border-line bg-white p-5 shadow-sm">
      <p className="font-head text-xs font-extrabold uppercase tracking-[0.14em] text-accent">Означення</p>
      <h3 className="mt-2 font-head text-lg font-extrabold leading-tight text-navy">{definition.term}</h3>
      <RichText tag="p" className="mt-3 font-serif text-base leading-7 text-slate-700" text={definition.body} />
      {definition.formula && <FormulaPill tex={definition.formula} />}
    </article>
  );
}

/* ── 1. Theory: Digraphs ──────────────────────────────────── */

export function GT01TheoryDigraph() {
  const defs = GT01.theory.definitions.filter((d) => ['def-graph', 'def-digraph', 'def-simple', 'def-adjacency'].includes(d.id));
  const graph = GT01.theory.workedExamples[0]?.graph;
  if (!graph) return null;

  return (
    <article className="mx-auto grid max-w-4xl gap-8 px-1 py-4">
      <div className="grid gap-4 md:grid-cols-2">
        {defs.map((def) => <DefinitionCard key={def.id} definition={def} />)}
      </div>
      <section className="rounded-[22px] border border-line bg-white p-5 shadow-sm">
        <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] text-accent">Візуальна нотація</p>
        <h2 className="mt-2 font-head text-xl font-extrabold leading-tight text-navy">Множини та діаграма</h2>
        <div className="mt-5 rounded-2xl border border-line bg-slate-50 p-3">
          <GraphCanvas graph={graph} height={300} />
        </div>
      </section>
    </article>
  );
}

/* ── 2. Theory: Matrix ────────────────────────────────────── */

export function GT01TheoryMatrix() {
  const matrixDef = GT01.theory.definitions.find((d) => d.id === 'def-adj-matrix');
  const task = GT01.tasks.find((t) => t.id === 'GT-01-T2');
  const data = task?.providedData as any;
  if (!data || !matrixDef) return null;

  const graph = data.graph;
  const [activeEdgeId, setActiveEdgeId] = useState(graph.edges[0]?.id || '');
  const activeEdge = graph.edges.find((edge: any) => edge.id === activeEdgeId) || graph.edges[0];

  function isActiveCell(row: string, column: string) {
    if (!activeEdge) return false;
    return (activeEdge.source === row && activeEdge.target === column) || (!graph.directed && activeEdge.source === column && activeEdge.target === row);
  }

  return (
    <article className="mx-auto grid max-w-4xl gap-8 px-1 py-4">
      <DefinitionCard definition={matrixDef} />
      <section className="grid gap-5 rounded-[22px] border border-line bg-white p-5 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] text-accent">Інтерактив</p>
          <h2 className="mt-2 font-head text-xl font-extrabold leading-tight text-navy">Граф ↔ Матриця</h2>
          <p className="mt-3 font-serif text-sm leading-6 text-slate-700">Клікни на ребро, щоб побачити відповідні клітинки.</p>
          <div className="mt-4 rounded-2xl border border-line bg-slate-50 p-3">
            <GraphCanvas graph={graph} height={250} selectedEdgeIds={activeEdge ? [activeEdge.id] : []} onEdgeClick={(e) => setActiveEdgeId(e.id)} />
          </div>
        </div>
        <table className="mx-auto border-collapse font-mono text-sm">
          <thead><tr><th className="h-9 w-9" />{data.nodeOrder.map((l: string) => <th key={l} className="h-9 w-9 text-center text-accent">{l}</th>)}</tr></thead>
          <tbody>
            {data.expectedMatrix.map((row: number[], rIdx: number) => {
              const rLabel = data.nodeOrder[rIdx];
              return (
                <tr key={rLabel}>
                  <td className="h-9 w-9 pr-2 text-right font-bold text-accent">{rLabel}</td>
                  {row.map((val: number, cIdx: number) => {
                    const cLabel = data.nodeOrder[cIdx];
                    const active = isActiveCell(rLabel, cLabel);
                    return (
                      <td key={`${rLabel}-${cLabel}`} className="h-9 w-9 border border-line p-0 text-center">
                        <div className={['flex h-full w-full items-center justify-center font-bold transition', active ? 'bg-accent text-white' : val ? 'bg-accent/10 text-navy' : 'bg-slate-50 text-slate-400'].join(' ')}>
                          {val}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </article>
  );
}

/* ── 3. Theory: Degree ────────────────────────────────────── */

export function GT01TheoryDegree() {
  const defs = GT01.theory.definitions.filter((d) => ['def-degree', 'def-isolated'].includes(d.id));
  const graph = GT01.theory.workedExamples[0]?.graph;
  if (!graph) return null;

  return (
    <article className="mx-auto grid max-w-4xl gap-8 px-1 py-4">
      <div className="grid gap-4 md:grid-cols-2">
        {defs.map((def) => <DefinitionCard key={def.id} definition={def} />)}
      </div>
      <section className="rounded-[22px] border border-line bg-white p-5 shadow-sm">
        <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] text-accent">Візуалізація</p>
        <h2 className="mt-2 font-head text-xl font-extrabold leading-tight text-navy">Степені вершин</h2>
        <div className="mt-5 rounded-2xl border border-line bg-slate-50 p-3">
          <GraphCanvas graph={graph} height={300} showDegrees />
        </div>
      </section>
    </article>
  );
}

const seqGraph = {
  nodes: [
    { id: '1', label: '1', x: 200, y: 150 },
    { id: '2', label: '2', x: 320, y: 150 },
    { id: '3', label: '3', x: 260, y: 250 },
    { id: '4', label: '4', x: 150, y: 250 },
  ],
  edges: [
    { source: '1', target: '2', id: 'e1' },
    { source: '1', target: '3', id: 'e2' },
    { source: '1', target: '4', id: 'e3' },
    { source: '2', target: '3', id: 'e4' },
  ],
  directed: false,
  weighted: false
};

export function GT01TheorySequence() {
  const seqDef = {
    id: 'def-seq',
    term: 'Послідовність степенів',
    body: 'Впорядкований за незростанням набір степенів усіх вершин графа. Наприклад, якщо граф має вершини зі степенями 1, 3, 2, 2, то його послідовність — (3, 2, 2, 1).',
  };
  const current = [3, 2, 2, 1];
  const labels = ['1', '2', '3', '4'];
  return (
    <article className="mx-auto grid max-w-4xl gap-8 px-1 py-4">
      <DefinitionCard definition={seqDef} />
      <section className="rounded-[22px] border border-line bg-white p-5 shadow-sm">
        <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] text-accent">Візуалізація</p>
        <h2 className="mt-2 font-head text-xl font-extrabold leading-tight text-navy">Приклад послідовності</h2>
        <div className="mt-5 rounded-2xl border border-line bg-slate-50 p-3">
          <GraphCanvas graph={seqGraph} height={300} showDegrees />
        </div>
        <DegreeChips current={current} target={undefined} labels={labels} />
      </section>
    </article>
  );
}

/* ── 5. Theory: Handshaking ───────────────────────────────── */

function TheoremCard({ theorem }: { theorem: (typeof GT01.theory.theorems)[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="rounded-[20px] border border-accent/25 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-head text-xs font-extrabold uppercase tracking-[0.14em] text-accent">Теорема</p>
          <h3 className="mt-2 font-head text-xl font-extrabold leading-tight text-navy">{theorem.name}</h3>
        </div>
        {theorem.formula && <FormulaPill tex={theorem.formula} />}
      </div>
      <RichText tag="p" className="mt-4 font-serif text-base leading-7 text-slate-700" text={theorem.statement} />
      {theorem.proof && (
        <>
          <button type="button" onClick={() => setOpen((value) => !value)}
            className="mt-4 rounded-xl border border-accent/30 bg-accent/5 px-4 py-2 font-head text-sm font-bold text-accent transition hover:border-accent hover:bg-accent/10">
            {open ? 'Сховати доказ' : 'Показати доказ'}
          </button>
          {open && <RichText tag="p" className="mt-4 rounded-2xl border border-line bg-slate-50 p-4 font-serif text-sm leading-7 text-slate-700" text={theorem.proof} />}
        </>
      )}
    </article>
  );
}

export function GT01TheoryHandshaking() {
  const theorems = GT01.theory.theorems.filter((t) => t.id === 'thm-handshaking' || t.id === 'thm-parity');
  const graph = GT01.theory.workedExamples[0]?.graph;
  const [edgeCount, setEdgeCount] = useState(graph?.edges.length || 0);
  if (!graph) return null;

  const visibleEdges = graph.edges.slice(0, edgeCount);
  const partialGraph = { ...graph, edges: visibleEdges };
  const degrees = computeDegrees(partialGraph);
  const degreeSum = Object.values(degrees).reduce((sum, degree) => sum + degree.total, 0);
  const selectedIds = visibleEdges.map((edge) => edge.id);
  const mutedIds = graph.edges.slice(edgeCount).map((edge) => edge.id);

  return (
    <article className="mx-auto grid max-w-4xl gap-8 px-1 py-4">
      <div className="grid gap-4">
        {theorems.map((t) => <TheoremCard key={t.id} theorem={t} />)}
      </div>
      <section className="rounded-[22px] border border-line bg-white p-5 shadow-sm">
        <div className="grid gap-5 md:grid-cols-[1fr_220px] md:items-center">
          <div>
            <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] text-accent">Лема в русі</p>
            <h2 className="mt-2 font-head text-2xl font-extrabold leading-tight text-navy">Кожне ребро додає рівно 2</h2>
            <p className="mt-3 font-serif text-base leading-7 text-slate-700">Посунь повзунок: ребра з'являються по одному, а сума степенів щоразу росте на два.</p>
            <input aria-label="Кількість ребер" type="range" min={0} max={graph.edges.length} value={edgeCount} onChange={(e) => setEdgeCount(Number(e.target.value))} className="mt-5 w-full accent-[var(--accent)]" />
          </div>
          <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4 text-center">
            <p className="font-head text-xs font-bold uppercase tracking-[0.14em] text-accent">Перевірка</p>
            <p className="mt-2 font-head text-3xl font-extrabold text-navy">{degreeSum}</p>
            <p className="font-mono text-sm text-slate-600">= 2×{edgeCount}</p>
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-line bg-slate-50 p-3">
          <GraphCanvas graph={graph} height={300} selectedEdgeIds={selectedIds} mutedEdgeIds={mutedIds} />
        </div>
      </section>
    </article>
  );
}

/* ── 6. Theory: Pigeonhole ────────────────────────────────── */

export function GT01TheoryPigeonhole() {
  const theorem = GT01.theory.theorems.find((t) => t.id === 'thm-pigeonhole');
  const [graph, setGraph] = useState(() => {
    const nodes = ringNodes(6, 520, 300, 100);
    const edges: GraphEdge[] = [];
    for (let i = 0; i < 6; i++) {
      for (let j = i + 1; j < 6; j++) {
        if (Math.random() > 0.5) edges.push({ id: `e${i}-${j}`, source: nodes[i].id, target: nodes[j].id });
      }
    }
    return { nodes, edges, directed: false, weighted: false };
  });

  const degrees = useMemo(() => computeDegrees(graph), [graph]);
  const duplicateNodeIds = useMemo(() => {
    const counts: Record<number, string[]> = {};
    Object.entries(degrees).forEach(([id, d]) => {
      counts[d.total] = counts[d.total] || [];
      counts[d.total].push(id);
    });
    const dup = Object.values(counts).find((list) => list.length >= 2);
    return dup ? [dup[0], dup[1]] : [];
  }, [degrees]);

  if (!theorem) return null;

  return (
    <article className="mx-auto grid max-w-4xl gap-8 px-1 py-4">
      <TheoremCard theorem={theorem} />
      <section className="rounded-[22px] border border-line bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] text-accent">Візуалізація</p>
            <h2 className="mt-2 font-head text-xl font-extrabold leading-tight text-navy">Завжди знайдеться пара</h2>
          </div>
          <ActionButton onClick={() => {
            const nodes = ringNodes(6, 520, 300, 100);
            const edges: GraphEdge[] = [];
            for (let i = 0; i < 6; i++) {
              for (let j = i + 1; j < 6; j++) {
                if (Math.random() > 0.5) edges.push({ id: `e${i}-${j}`, source: nodes[i].id, target: nodes[j].id });
              }
            }
            setGraph({ nodes, edges, directed: false, weighted: false });
          }} tone="quiet">Згенерувати випадковий</ActionButton>
        </div>
        <p className="mt-3 font-serif text-sm leading-6 text-slate-700">
          Скільки б разів ви не генерували новий граф, завжди будуть принаймні дві вершини (зелені) з однаковим степенем.
        </p>
        <div className="mt-5 rounded-2xl border border-line bg-slate-50 p-3">
          <GraphCanvas graph={graph} height={300} showDegrees selectedNodeIds={duplicateNodeIds} />
        </div>
      </section>
    </article>
  );
}


/* ── Page 7: Task — Degree Sequence ───────────────────────── */

export function GT01TaskSequence() {
  const data = TASKS.sequence.providedData as unknown as { degreeSequence: number[]; nodeCount: number };
  const nodes = useMemo(() => ringNodes(data.nodeCount), [data.nodeCount]);
  const slots = useMemo(() => completeEdges(nodes), [nodes]);
  const solution = ['1--2', '1--3', '1--4', '2--3', '4--5'];
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: 'idle', message: '' });

  const graph = { nodes, edges: slots, directed: false, weighted: false };
  const drawnGraph = selectedGraph(nodes, slots, selected);
  const degrees = computeDegrees(drawnGraph);
  const current = nodes.map((node) => degrees[node.id]?.total || 0);
  const muted = slots.map((edge) => edge.id).filter((id) => !selected.includes(id));

  function check() {
    const ok = current.every((degree, index) => degree === data.degreeSequence[index]);
    setFeedback(ok
      ? { kind: 'ok', message: 'Так, степені збігаються з послідовністю. Це простий граф без петель і кратних ребер.' }
      : { kind: 'bad', message: 'Ще не збігається. Подивись на жовті степені: саме там треба додати або прибрати ребро.' });
  }

  return (
    <article className="mx-auto grid max-w-4xl gap-6 px-1 py-4">
      <TaskShell task={TASKS.sequence}>
        <div className="rounded-2xl border border-line bg-slate-50 p-3">
          <GraphCanvas graph={graph} height={360} selectedEdgeIds={selected} mutedEdgeIds={muted}
            onEdgeClick={(edge) => setSelected((value) => toggleValue(value, edge.id))} />
        </div>
        <DegreeChips current={current} target={data.degreeSequence} labels={nodes.map((node) => node.id)} />
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton onClick={check}>Перевірити</ActionButton>
          <ActionButton tone="quiet" onClick={() => setSelected(solution)}>Показати один приклад</ActionButton>
          <ActionButton tone="quiet" onClick={() => setSelected([])}>Очистити</ActionButton>
          <ActionButton tone="danger" onClick={() => setFeedback({ kind: 'bad', message: 'Для цієї послідовності граф існує, тому «Неможливо» тут не підходить.' })}>Неможливо</ActionButton>
        </div>
        <Feedback state={feedback} />
      </TaskShell>
    </article>
  );
}

/* ── Page 8: Task — Matrix Fill ───────────────────────────── */

interface MatrixTaskData {
  graph: any;
  nodeOrder: string[];
  expectedMatrix: number[][];
}

export function GT01TaskMatrix() {
  const data = TASKS.matrix.providedData as unknown as MatrixTaskData;
  const empty = () => data.expectedMatrix.map((row: number[]) => row.map(() => 0));
  const [matrix, setMatrix] = useState<number[][]>(() => empty());
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: 'idle', message: '' });

  function toggleCell(row: number, column: number) {
    setMatrix((value) => value.map((line, r) => line.map((cell, c) => (r === row && c === column ? 1 - cell : cell))));
  }
  function check() {
    const ok = data.expectedMatrix.every((row: number[], rowIndex: number) => row.every((cell: number, columnIndex: number) => cell === matrix[rowIndex][columnIndex]));
    setFeedback(ok
      ? { kind: 'ok', message: 'Матриця правильна: вона симетрична, а діагональ нульова.' }
      : { kind: 'bad', message: 'Є помилка в клітинках. Пам\'ятай: для ребра a-b мають стояти одиниці в (a,b) і (b,a).' });
  }

  return (
    <article className="mx-auto grid max-w-4xl gap-6 px-1 py-4">
      <TaskShell task={TASKS.matrix}>
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div className="rounded-2xl border border-line bg-slate-50 p-3">
            <GraphCanvas graph={data.graph} height={300} />
          </div>
          <table className="mx-auto border-collapse font-mono text-sm">
            <thead><tr><th className="h-9 w-9" />{data.nodeOrder.map((label: string) => (<th key={label} className="h-9 w-9 text-center text-accent">{label}</th>))}</tr></thead>
            <tbody>
              {matrix.map((row: number[], rowIndex: number) => (
                <tr key={data.nodeOrder[rowIndex]}>
                  <td className="h-9 w-9 pr-2 text-right font-bold text-accent">{data.nodeOrder[rowIndex]}</td>
                  {row.map((cell: number, columnIndex: number) => (
                    <td key={`${rowIndex}-${columnIndex}`} className="h-9 w-9 border border-line p-0 text-center">
                      <button type="button" onClick={() => toggleCell(rowIndex, columnIndex)}
                        className={cell ? 'h-full w-full bg-accent font-bold text-white' : 'h-full w-full bg-slate-50 font-bold text-slate-400 hover:bg-accent/10'}>
                        {cell}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton onClick={check}>Перевірити матрицю</ActionButton>
          <ActionButton tone="quiet" onClick={() => setMatrix(empty())}>Очистити</ActionButton>
        </div>
        <Feedback state={feedback} />
      </TaskShell>
    </article>
  );
}

/* ── Page 9: Task — Repair ────────────────────────────────── */

export function GT01TaskRepair() {
  const data = TASKS.repair.providedData as unknown as { graph: GraphData; claimedEdgeCount: number; targetDegreeSum: number };
  const slots = useMemo(() => completeEdges(data.graph.nodes), [data.graph.nodes]);
  const initial = data.graph.edges.map((edge) => edgeKey(edge.source, edge.target));
  const [selected, setSelected] = useState<string[]>(initial);
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: 'idle', message: '' });

  const graph = { ...data.graph, edges: slots };
  const drawnGraph = selectedGraph(data.graph.nodes, slots, selected);
  const degrees = computeDegrees(drawnGraph);
  const degreeSum = Object.values(degrees).reduce((sum, degree) => sum + degree.total, 0);
  const muted = slots.map((edge) => edge.id).filter((id) => !selected.includes(id));

  function check() {
    const ok = selected.length === data.claimedEdgeCount && degreeSum === data.targetDegreeSum;
    setFeedback(ok
      ? { kind: 'ok', message: 'Граф полагоджено: кількість ребер і сума степенів тепер узгоджені.' }
      : { kind: 'bad', message: `Зараз |E|=${selected.length}, а сума степенів ${degreeSum}. Треба |E|=${data.claimedEdgeCount} і ∑deg(v)=${data.targetDegreeSum}.` });
  }

  return (
    <article className="mx-auto grid max-w-4xl gap-6 px-1 py-4">
      <TaskShell task={TASKS.repair}>
        <div className="grid gap-4 md:grid-cols-[1fr_190px] md:items-center">
          <div className="rounded-2xl border border-line bg-slate-50 p-3">
            <GraphCanvas graph={graph} height={360} selectedEdgeIds={selected} mutedEdgeIds={muted}
              onEdgeClick={(edge) => setSelected((value) => toggleValue(value, edge.id))} />
          </div>
          <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4 text-center">
            <p className="font-head text-xs font-bold uppercase tracking-[0.14em] text-accent">Стан</p>
            <p className="mt-2 font-head text-2xl font-extrabold text-navy">|E| = {selected.length}</p>
            <p className="font-mono text-sm text-slate-600">∑deg(v) = {degreeSum}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton onClick={check}>Перевірити</ActionButton>
          <ActionButton tone="quiet" onClick={() => setSelected(initial)}>Скинути</ActionButton>
        </div>
        <Feedback state={feedback} />
      </TaskShell>
    </article>
  );
}

/* ── Page 10: Task — Regular Graph ────────────────────────── */

export function GT01TaskRegular() {
  const data = TASKS.regular.providedData as unknown as { k: number; n: number; nodes: GraphNode[] };
  const slots = useMemo(() => completeEdges(data.nodes), [data.nodes]);
  const solution = ['1--2', '2--3', '3--4', '4--5', '5--6', '1--6', '1--4', '2--5', '3--6'];
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: 'idle', message: '' });

  const graph = { nodes: data.nodes, edges: slots, directed: false, weighted: false };
  const drawnGraph = selectedGraph(data.nodes, slots, selected);
  const degrees = computeDegrees(drawnGraph);
  const current = data.nodes.map((node) => degrees[node.id]?.total || 0);
  const muted = slots.map((edge) => edge.id).filter((id) => !selected.includes(id));

  function check() {
    const ok = current.every((degree) => degree === data.k);
    setFeedback(ok
      ? { kind: 'ok', message: `${data.k}-регулярний граф на ${data.n} вершинах побудовано. Кількість ребер теж сходиться: ${data.n}×${data.k}/2 = ${(data.n * data.k) / 2}.` }
      : { kind: 'bad', message: 'Ще ні: у кожної вершини має бути однаковий степінь 3.' });
  }

  return (
    <article className="mx-auto grid max-w-4xl gap-6 px-1 py-4">
      <TaskShell task={TASKS.regular}>
        <div className="rounded-2xl border border-line bg-slate-50 p-3">
          <GraphCanvas graph={graph} height={440} selectedEdgeIds={selected} mutedEdgeIds={muted}
            onEdgeClick={(edge) => setSelected((value) => toggleValue(value, edge.id))} />
        </div>
        <DegreeChips current={current} target={data.nodes.map(() => data.k)} labels={data.nodes.map((node) => node.id)} />
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton onClick={check}>Перевірити</ActionButton>
          <ActionButton tone="quiet" onClick={() => setSelected(solution)}>Показати приклад</ActionButton>
          <ActionButton tone="quiet" onClick={() => setSelected([])}>Очистити</ActionButton>
        </div>
        <Feedback state={feedback} />
      </TaskShell>
    </article>
  );
}

/* ── Page 11: Task — Equal Degrees ────────────────────────── */

export function GT01TaskEqual() {
  const data = TASKS.equal.providedData as unknown as { graph: GraphData; expectedDegrees: Record<string, number> };
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: 'idle', message: '' });
  const degrees = computeDegrees(data.graph);

  function choose(nodeId: string) {
    setSelectedNodes((value) => {
      if (value.includes(nodeId)) return value.filter((id) => id !== nodeId);
      return [...value.slice(-1), nodeId];
    });
  }
  function check() {
    if (selectedNodes.length !== 2) { setFeedback({ kind: 'bad', message: 'Обери рівно дві вершини.' }); return; }
    const [a, b] = selectedNodes;
    const ok = degrees[a].total === degrees[b].total;
    setFeedback(ok
      ? { kind: 'ok', message: `Так: deg(${a}) = deg(${b}) = ${degrees[a].total}.` }
      : { kind: 'bad', message: `Поки ні: deg(${a}) = ${degrees[a].total}, а deg(${b}) = ${degrees[b].total}.` });
  }

  return (
    <article className="mx-auto grid max-w-4xl gap-6 px-1 py-4">
      <TaskShell task={TASKS.equal}>
        <div className="rounded-2xl border border-line bg-slate-50 p-3">
          <GraphCanvas graph={data.graph} height={360} selectedNodeIds={selectedNodes} onNodeClick={choose} showDegrees={feedback.kind !== 'idle'} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton onClick={check}>Перевірити пару</ActionButton>
          <ActionButton tone="quiet" onClick={() => setSelectedNodes([])}>Очистити</ActionButton>
        </div>
        <Feedback state={feedback} />
      </TaskShell>
    </article>
  );
}

/* ── Page 12: Task — Directed Degrees ─────────────────────── */

export function GT01TaskDirected() {
  const data = TASKS.directed.providedData as unknown as { graph: GraphData; expectedOutDegrees: Record<string, number>; expectedInDegrees: Record<string, number>; edgeCount: number };
  const [values, setValues] = useState<Record<string, { out: string; in: string }>>(() =>
    Object.fromEntries(data.graph.nodes.map((node) => [node.id, { out: '', in: '' }])));
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: 'idle', message: '' });

  function update(nodeId: string, field: 'out' | 'in', value: string) {
    setValues((current) => ({ ...current, [nodeId]: { ...current[nodeId], [field]: value } }));
  }
  function check() {
    const ok = data.graph.nodes.every((node) => {
      const row = values[node.id];
      return Number(row.out) === data.expectedOutDegrees[node.id] && Number(row.in) === data.expectedInDegrees[node.id];
    });
    const outSum = data.graph.nodes.reduce((sum, node) => sum + Number(values[node.id].out || 0), 0);
    const inSum = data.graph.nodes.reduce((sum, node) => sum + Number(values[node.id].in || 0), 0);
    setFeedback(ok
      ? { kind: 'ok', message: `Правильно: ∑deg⁺ = ${outSum}, ∑deg⁻ = ${inSum}, і обидві суми дорівнюють |E| = ${data.edgeCount}.` }
      : { kind: 'bad', message: `Перевір напрямки стрілок. Зараз ∑deg⁺=${outSum}, ∑deg⁻=${inSum}, а має бути ${data.edgeCount}.` });
  }

  return (
    <article className="mx-auto grid max-w-4xl gap-6 px-1 py-4">
      <TaskShell task={TASKS.directed}>
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-start">
          <div className="rounded-2xl border border-line bg-slate-50 p-3">
            <GraphCanvas graph={data.graph} height={340} showDirectedDegrees={feedback.kind === 'ok'} />
          </div>
          <div className="overflow-hidden rounded-2xl border border-line">
            <table className="min-w-[240px] border-collapse bg-white font-head text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr><th className="px-3 py-2 text-left">Вершина</th><th className="px-3 py-2 text-left">deg⁺</th><th className="px-3 py-2 text-left">deg⁻</th></tr>
              </thead>
              <tbody>
                {data.graph.nodes.map((node) => (
                  <tr key={node.id} className="border-t border-line">
                    <td className="px-3 py-2 font-extrabold text-navy">{node.label || node.id}</td>
                    <td className="px-3 py-2"><input type="number" min="0" value={values[node.id].out} onChange={(event) => update(node.id, 'out', event.target.value)} className="h-10 w-16 rounded-lg border border-line px-2 text-center font-mono focus:border-accent focus:outline-none" /></td>
                    <td className="px-3 py-2"><input type="number" min="0" value={values[node.id].in} onChange={(event) => update(node.id, 'in', event.target.value)} className="h-10 w-16 rounded-lg border border-line px-2 text-center font-mono focus:border-accent focus:outline-none" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton onClick={check}>Перевірити напівстепені</ActionButton>
          <ActionButton tone="quiet" onClick={() => setValues(Object.fromEntries(data.graph.nodes.map((node) => [node.id, { out: '', in: '' }])))}>Очистити</ActionButton>
        </div>
        <Feedback state={feedback} />
      </TaskShell>
    </article>
  );
}
