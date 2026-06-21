// One renderer per task type. Each engine reads its shape off `task.providedData`
// and validates locally. Register new engines in ./TaskCard.tsx.

import { useMemo, useState } from 'react';
import { RichText } from '../../../../lib/math';
import type { Task } from '../../types';
import { computeDegrees, GraphCanvas } from '../GT01/GraphVisuals';
import {
  ActionButton,
  DegreeChips,
  Feedback,
  HintRow,
  IDLE,
  TaskShell,
  completeEdges,
  distance,
  edgeBetween,
  isBridge,
  isCutVertex,
  normalizeAnswer,
  seededShuffle,
  selectedGraph,
  toggleValue,
  type ComputeData,
  type DecisionData,
  type EdgeClickData,
  type EulerTraceData,
  type FeedbackState,
  type GraphBuildData,
  type HamiltonTraceData,
  type MatrixFillData,
  type NodeClickData,
  type OrderStepsData,
  type PathTraceData,
} from './taskkit';

const PANEL = 'rounded-2xl border border-line bg-slate-50 p-3';

function sortedDesc(values: number[]): number[] {
  return [...values].sort((a, b) => b - a);
}
function sameMultiset(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const x = sortedDesc(a);
  const y = sortedDesc(b);
  return x.every((v, i) => v === y[i]);
}
function seedFrom(task: Task): number {
  return [...task.id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

/* ── graph-build ──────────────────────────────────────────── */

export function GraphBuildEngine({ task }: { task: Task }) {
  const data = task.providedData as unknown as GraphBuildData;
  const nodes = data.nodes;
  const slots = useMemo(() => completeEdges(nodes), [nodes]);
  const [selected, setSelected] = useState<string[]>(data.presetEdgeIds ?? []);
  const [feedback, setFeedback] = useState<FeedbackState>(IDLE);

  const baseGraph = { nodes, edges: slots, directed: false, weighted: false };
  const drawn = selectedGraph(nodes, slots, selected);
  const degrees = computeDegrees(drawn);
  const current = nodes.map((node) => degrees[node.id]?.total || 0);
  const degreeSum = current.reduce((sum, d) => sum + d, 0);
  const muted = slots.map((edge) => edge.id).filter((id) => !selected.includes(id));

  const regularK = data.goal.kind === 'regular' ? data.goal.k : null;
  const showDegreeTarget =
    data.goal.kind === 'degreeSequence'
      ? sortedDesc(data.goal.sequence)
      : regularK !== null
        ? nodes.map(() => regularK)
        : undefined;

  function goalMet(): boolean {
    const g = data.goal;
    if (g.kind === 'degreeSequence') return sameMultiset(current, g.sequence);
    if (g.kind === 'regular') return current.every((d) => d === g.k) && current.length > 0;
    if (g.kind === 'edgeCount') return selected.length === g.count;
    if (g.kind === 'targetDegreeSum') return degreeSum === g.sum && (g.edgeCount === undefined || selected.length === g.edgeCount);
    return false;
  }

  function check() {
    if (data.impossible) {
      setFeedback({ kind: 'bad', message: 'Для цих умов граф усе ж побудувати не можна — натисни «Неможливо».' });
      return;
    }
    setFeedback(
      goalMet()
        ? { kind: 'ok', message: data.okMessage || 'Граф задовольняє умову. ✓' }
        : { kind: 'bad', message: 'Ще не збігається — дивись на підсвічені степені й додавай або прибирай ребра.' },
    );
  }

  function declareImpossible() {
    setFeedback(
      data.impossible
        ? { kind: 'ok', message: data.okMessage || 'Правильно: такий граф не існує.' }
        : { kind: 'bad', message: 'Насправді граф існує — спробуй його побудувати.' },
    );
  }

  return (
    <TaskShell task={task}>
      <div className={PANEL}>
        <GraphCanvas
          graph={baseGraph}
          height={Math.max(320, 70 + nodes.length * 26)}
          selectedEdgeIds={selected}
          mutedEdgeIds={muted}
          onEdgeClick={(edge) => setSelected((value) => toggleValue(value, edge.id))}
        />
      </div>
      {showDegreeTarget && <DegreeChips current={current} target={showDegreeTarget} labels={nodes.map((n) => n.id)} />}
      {data.goal.kind === 'edgeCount' && (
        <p className="mt-3 font-mono text-sm text-slate-600">|E| = {selected.length} / {data.goal.count}</p>
      )}
      {data.goal.kind === 'targetDegreeSum' && (
        <p className="mt-3 font-mono text-sm text-slate-600">|E| = {selected.length} · ∑deg(v) = {degreeSum} / {data.goal.sum}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton onClick={check}>Перевірити</ActionButton>
        {data.solutionEdgeIds && <ActionButton tone="quiet" onClick={() => setSelected(data.solutionEdgeIds!)}>Показати приклад</ActionButton>}
        <ActionButton tone="quiet" onClick={() => setSelected(data.presetEdgeIds ?? [])}>Очистити</ActionButton>
        <ActionButton tone="danger" onClick={declareImpossible}>Неможливо</ActionButton>
      </div>
      <Feedback state={feedback} />
      <HintRow hint={data.hint} reveal={data.reveal} />
    </TaskShell>
  );
}

/* ── matrix-fill ──────────────────────────────────────────── */

export function MatrixFillEngine({ task }: { task: Task }) {
  const data = task.providedData as unknown as MatrixFillData;
  const empty = () => data.expectedMatrix.map((row) => row.map(() => 0));
  const [matrix, setMatrix] = useState<number[][]>(empty);
  const [feedback, setFeedback] = useState<FeedbackState>(IDLE);

  function toggleCell(row: number, column: number) {
    setMatrix((value) => value.map((line, r) => line.map((cell, c) => (r === row && c === column ? (cell ? 0 : 1) : cell))));
  }
  function check() {
    const ok = data.expectedMatrix.every((row, r) => row.every((cell, c) => cell === matrix[r][c]));
    setFeedback(
      ok
        ? { kind: 'ok', message: data.symmetric === false ? 'Матриця правильна.' : 'Матриця правильна: симетрична, діагональ нульова.' }
        : { kind: 'bad', message: 'Є помилка в клітинках. Для ребра $a$–$b$ ставимо 1 у $(a,b)$' + (data.symmetric === false ? '.' : ' і $(b,a)$.') },
    );
  }

  return (
    <TaskShell task={task}>
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className={PANEL}>
          <GraphCanvas graph={data.graph} height={300} />
        </div>
        <table className="mx-auto border-collapse font-mono text-sm">
          <thead>
            <tr>
              <th className="h-9 w-9" />
              {data.nodeOrder.map((label) => (
                <th key={label} className="h-9 w-9 text-center text-accent">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, r) => (
              <tr key={data.nodeOrder[r]}>
                <td className="h-9 w-9 pr-2 text-right font-bold text-accent">{data.nodeOrder[r]}</td>
                {row.map((cell, c) => (
                  <td key={`${r}-${c}`} className="h-9 w-9 border border-line p-0 text-center">
                    <button
                      type="button"
                      onClick={() => toggleCell(r, c)}
                      className={cell ? 'h-full w-full bg-accent font-bold text-white' : 'h-full w-full bg-slate-50 font-bold text-slate-400 hover:bg-accent/10'}
                    >
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
      <HintRow hint={data.hint} />
    </TaskShell>
  );
}

/* ── node-click ───────────────────────────────────────────── */

export function NodeClickEngine({ task }: { task: Task }) {
  const data = task.providedData as unknown as NodeClickData;
  const [picked, setPicked] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>(IDLE);
  const degrees = useMemo(() => computeDegrees(data.graph), [data.graph]);
  const adjacency = useMemo(() => {
    const set = new Set<string>();
    data.graph.edges.forEach((e) => {
      set.add(`${e.source}|${e.target}`);
      set.add(`${e.target}|${e.source}`);
    });
    return set;
  }, [data.graph]);

  function choose(nodeId: string) {
    setPicked((value) => {
      if (value.includes(nodeId)) return value.filter((id) => id !== nodeId);
      if (value.length >= data.requiredCount) return [...value.slice(1), nodeId];
      return [...value, nodeId];
    });
  }

  function check() {
    if (picked.length !== data.requiredCount) {
      setFeedback({ kind: 'bad', message: `Обери рівно ${data.requiredCount} вершини.` });
      return;
    }
    if (data.check === 'cut-vertex') {
      const allCut = picked.every((id) => isCutVertex(data.graph, id));
      setFeedback(
        allCut
          ? { kind: 'ok', message: `Так — без вершини ${picked.join(', ')} граф розпадається на кілька компонент.` }
          : { kind: 'bad', message: 'Ні: видалення цієї вершини не роз’єднує граф. Шукай «вузьке місце».' },
      );
      return;
    }
    let ok = false;
    if (data.check === 'equal-degree') {
      ok = picked.every((id) => degrees[id].total === degrees[picked[0]].total);
    } else if (data.check === 'pairwise-adjacent') {
      ok = picked.every((a, i) => picked.every((b, j) => i === j || adjacency.has(`${a}|${b}`)));
    } else {
      ok = picked.every((a, i) => picked.every((b, j) => i === j || !adjacency.has(`${a}|${b}`)));
    }
    const degText = picked.map((id) => `deg(${id})=${degrees[id].total}`).join(', ');
    setFeedback(ok ? { kind: 'ok', message: `Так. ${degText}.` } : { kind: 'bad', message: `Поки ні: ${degText}.` });
  }

  return (
    <TaskShell task={task}>
      <div className={PANEL}>
        <GraphCanvas graph={data.graph} height={360} selectedNodeIds={picked} onNodeClick={choose} showDegrees={feedback.kind !== 'idle'} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton onClick={check}>Перевірити</ActionButton>
        <ActionButton tone="quiet" onClick={() => setPicked([])}>Очистити</ActionButton>
      </div>
      <Feedback state={feedback} />
      <HintRow hint={data.hint} />
    </TaskShell>
  );
}

/* ── compute (typed answer, optionally multi-part) ────────── */

export function ComputeEngine({ task }: { task: Task }) {
  const data = task.providedData as unknown as ComputeData;
  const [values, setValues] = useState<string[]>(() => data.parts.map(() => ''));
  const [feedback, setFeedback] = useState<FeedbackState>(IDLE);
  const [marks, setMarks] = useState<(boolean | null)[]>(() => data.parts.map(() => null));

  function check() {
    const nextMarks = data.parts.map((part, i) => part.answers.map(normalizeAnswer).includes(normalizeAnswer(values[i])));
    setMarks(nextMarks);
    const allOk = nextMarks.every(Boolean);
    setFeedback(
      allOk
        ? { kind: 'ok', message: data.parts.length > 1 ? 'Усі відповіді правильні. ✓' : 'Правильно. ✓' }
        : { kind: 'bad', message: 'Не все збігається — перевір позначені пункти.' },
    );
  }

  return (
    <TaskShell task={task}>
      {data.graph && (
        <div className={`${PANEL} mb-4`}>
          <GraphCanvas graph={data.graph} height={280} showDegrees={Boolean(data.showDegrees)} />
        </div>
      )}
      <div className="grid gap-3">
        {data.parts.map((part, i) => (
          <div key={i} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-3">
            {part.label && <span className="font-head text-sm font-extrabold text-accent">{part.label}</span>}
            <span className="flex-1 font-serif text-sm leading-6 text-slate-700"><RichTextInline text={part.prompt} /></span>
            <input
              value={values[i]}
              onChange={(e) => setValues((v) => v.map((x, j) => (j === i ? e.target.value : x)))}
              className={[
                'h-10 w-40 rounded-lg border px-3 text-center font-mono focus:outline-none',
                marks[i] === null ? 'border-line focus:border-accent' : marks[i] ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50',
              ].join(' ')}
              placeholder="відповідь"
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton onClick={check}>Перевірити</ActionButton>
        <ActionButton tone="quiet" onClick={() => { setValues(data.parts.map(() => '')); setMarks(data.parts.map(() => null)); setFeedback(IDLE); }}>Очистити</ActionButton>
      </div>
      <Feedback state={feedback} />
      <HintRow hint={data.hint} reveal={data.reveal} />
    </TaskShell>
  );
}

/* ── impossibility / decision (Так / Ні, multi-part) ──────── */

export function DecisionEngine({ task }: { task: Task }) {
  const data = task.providedData as unknown as DecisionData;
  const [picks, setPicks] = useState<(('yes' | 'no') | null)[]>(() => data.parts.map(() => null));
  const [feedback, setFeedback] = useState<FeedbackState>(IDLE);
  const [revealed, setRevealed] = useState(false);

  function check() {
    const allAnswered = picks.every((p) => p !== null);
    if (!allAnswered) {
      setFeedback({ kind: 'bad', message: 'Дай відповідь у кожному пункті.' });
      return;
    }
    const ok = picks.every((p, i) => p === data.parts[i].answer);
    setRevealed(true);
    setFeedback(ok ? { kind: 'ok', message: 'Усі відповіді правильні. ✓' } : { kind: 'bad', message: 'Є помилки — дивись пояснення під пунктами.' });
  }

  return (
    <TaskShell task={task}>
      {data.graph && (
        <div className={`${PANEL} mb-4`}>
          <GraphCanvas graph={data.graph} height={280} />
        </div>
      )}
      <div className="grid gap-3">
        {data.parts.map((part, i) => {
          const correct = revealed && picks[i] === part.answer;
          const wrong = revealed && picks[i] !== null && picks[i] !== part.answer;
          return (
            <div key={i} className={['rounded-2xl border p-3', correct ? 'border-green-200 bg-green-50' : wrong ? 'border-red-200 bg-red-50' : 'border-line bg-white'].join(' ')}>
              <div className="flex flex-wrap items-center gap-3">
                {part.label && <span className="font-head text-sm font-extrabold text-accent">{part.label}</span>}
                <span className="flex-1 font-serif text-sm leading-6 text-slate-700"><RichTextInline text={part.prompt} /></span>
                <div className="flex gap-2">
                  {(['yes', 'no'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPicks((v) => v.map((x, j) => (j === i ? opt : x)))}
                      className={[
                        'min-w-[64px] rounded-lg border px-3 py-1.5 font-head text-sm font-bold transition',
                        picks[i] === opt ? 'border-accent bg-accent text-white' : 'border-line bg-white text-navy hover:border-accent/50',
                      ].join(' ')}
                    >
                      {opt === 'yes' ? 'Так' : 'Ні'}
                    </button>
                  ))}
                </div>
              </div>
              {revealed && <RichTextInline className="mt-2 block font-serif text-xs leading-5 text-slate-600" text={part.why} />}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton onClick={check}>Перевірити</ActionButton>
        <ActionButton tone="quiet" onClick={() => { setPicks(data.parts.map(() => null)); setRevealed(false); setFeedback(IDLE); }}>Очистити</ActionButton>
      </div>
      <Feedback state={feedback} />
      <HintRow hint={data.hint} />
    </TaskShell>
  );
}

/* ── order-steps (interactive proof builder) ──────────────── */

export function ProofOrderEngine({ task }: { task: Task }) {
  const data = task.providedData as unknown as OrderStepsData;
  const pool = useMemo(() => {
    const labelled = [
      ...data.steps.map((text, i) => ({ text, correct: i })),
      ...(data.distractors ?? []).map((text) => ({ text, correct: -1 })),
    ];
    return seededShuffle(labelled, seedFrom(task));
  }, [data.steps, data.distractors, task]);

  const [order, setOrder] = useState<number[]>([]); // indices into pool
  const [feedback, setFeedback] = useState<FeedbackState>(IDLE);

  const used = new Set(order);
  function append(idx: number) {
    setOrder((o) => (o.includes(idx) ? o : [...o, idx]));
  }
  function removeAt(pos: number) {
    setOrder((o) => o.filter((_, i) => i !== pos));
  }

  function check() {
    const builtCorrectness = order.map((idx) => pool[idx].correct);
    const noDistractors = builtCorrectness.every((c) => c >= 0);
    const rightOrder = noDistractors && builtCorrectness.length === data.steps.length && builtCorrectness.every((c, i) => c === i);
    setFeedback(
      rightOrder
        ? { kind: 'ok', message: 'Доказ зібрано правильно — кроки стоять у логічному порядку. ✓' }
        : !noDistractors
          ? { kind: 'bad', message: 'У ланцюжку є зайвий крок, який не належить доказу. Прибери його.' }
          : { kind: 'bad', message: 'Порядок або повнота кроків ще не ті. Перевір логіку переходів.' },
    );
  }

  return (
    <TaskShell task={task}>
      <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4">
        <p className="font-head text-xs font-extrabold uppercase tracking-[0.14em] text-accent">Довести</p>
        <RichTextInline className="mt-1 block font-serif text-base leading-7 text-navy" text={data.claim} />
      </div>

      {data.graph && (
        <div className={`${PANEL} mt-4`}>
          <GraphCanvas graph={data.graph} height={280} />
        </div>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 font-head text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Доступні кроки</p>
          <div className="grid gap-2">
            {pool.map((item, idx) =>
              used.has(idx) ? null : (
                <button
                  key={idx}
                  type="button"
                  onClick={() => append(idx)}
                  className="rounded-xl border border-line bg-white p-3 text-left font-serif text-sm leading-6 text-slate-700 transition hover:border-accent/50 hover:bg-accent/5"
                >
                  <RichTextInline text={item.text} />
                </button>
              ),
            )}
            {pool.every((_, idx) => used.has(idx)) && <p className="rounded-xl border border-dashed border-line p-3 text-center text-sm text-slate-400">усі кроки використано</p>}
          </div>
        </div>
        <div>
          <p className="mb-2 font-head text-xs font-extrabold uppercase tracking-[0.14em] text-accent">Твій доказ</p>
          <div className="grid gap-2">
            {order.length === 0 && <p className="rounded-xl border border-dashed border-line p-3 text-center text-sm text-slate-400">Клацай кроки зліва, щоб вибудувати доказ по порядку</p>}
            {order.map((idx, pos) => (
              <div key={idx} className="flex items-start gap-2 rounded-xl border border-accent/30 bg-white p-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-extrabold text-white">{pos + 1}</span>
                <span className="flex-1 font-serif text-sm leading-6 text-slate-700"><RichTextInline text={pool[idx].text} /></span>
                <button type="button" onClick={() => removeAt(pos)} className="text-slate-400 hover:text-red-600" aria-label="Прибрати крок">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton onClick={check}>Перевірити доказ</ActionButton>
        <ActionButton tone="quiet" onClick={() => { setOrder([]); setFeedback(IDLE); }}>Скинути</ActionButton>
      </div>
      <Feedback state={feedback} />
      <HintRow hint={data.hint} />
    </TaskShell>
  );
}

/* ── path-trace (walk along edges to build a shortest path) ── */

export function PathTraceEngine({ task }: { task: Task }) {
  const data = task.providedData as unknown as PathTraceData;
  const graph = data.graph;
  const [path, setPath] = useState<string[]>([data.start]);
  const [feedback, setFeedback] = useState<FeedbackState>(IDLE);

  const target = useMemo(() => distance(graph, data.start, data.end), [graph, data.start, data.end]);

  function clickNode(id: string) {
    setFeedback(IDLE);
    setPath((p) => {
      const tail = p[p.length - 1];
      if (id === tail) return p;
      if (p.length >= 2 && id === p[p.length - 2]) return p.slice(0, -1); // step back
      if (p.includes(id)) return p;                                       // keep it simple
      return edgeBetween(graph, tail, id) ? [...p, id] : p;               // only along an edge
    });
  }

  const tracedEdgeIds = useMemo(() => {
    const ids: string[] = [];
    for (let i = 0; i < path.length - 1; i += 1) {
      const e = edgeBetween(graph, path[i], path[i + 1]);
      if (e) ids.push(e.id);
    }
    return ids;
  }, [graph, path]);

  const length = path.length - 1;
  const atEnd = path[path.length - 1] === data.end;

  function check() {
    if (!atEnd) {
      setFeedback({ kind: 'bad', message: `Шлях ще не доходить до фінішу ${data.end}. Клікай сусідні вершини вздовж ребер.` });
      return;
    }
    if (data.requireShortest && length > target) {
      setFeedback({ kind: 'bad', message: `Це коректний шлях довжини ${length}, але найкоротша відстань $d(${data.start},${data.end})=${target}$. Спробуй коротше.` });
      return;
    }
    setFeedback({ kind: 'ok', message: `Шлях ${path.join('–')} завдовжки ${length}${data.requireShortest ? ` — це найкоротша відстань $d=${target}$.` : '.'} ✓` });
  }

  const shownGraph = {
    ...graph,
    nodes: graph.nodes.map((n) =>
      n.id === data.start ? { ...n, color: '#1f9d6b' } : n.id === data.end ? { ...n, color: '#e0922f' } : n,
    ),
  };

  return (
    <TaskShell task={task}>
      <div className={PANEL}>
        <GraphCanvas
          graph={shownGraph}
          height={Math.max(300, 60 + graph.nodes.length * 16)}
          selectedNodeIds={path}
          selectedEdgeIds={tracedEdgeIds}
          onNodeClick={clickNode}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-sm text-slate-600">
        <span>старт <b className="text-[var(--accent)]">{data.start}</b> → фініш <b className="text-amber-600">{data.end}</b></span>
        <span>шлях: {path.join(' → ')}</span>
        <span>довжина: {length}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton onClick={check}>Перевірити</ActionButton>
        <ActionButton tone="quiet" onClick={() => { setPath([data.start]); setFeedback(IDLE); }}>Очистити</ActionButton>
      </div>
      <Feedback state={feedback} />
      <HintRow hint={data.hint} reveal={data.reveal} />
    </TaskShell>
  );
}

/* ── edge-click (find a bridge) ───────────────────────────── */

export function EdgeClickEngine({ task }: { task: Task }) {
  const data = task.providedData as unknown as EdgeClickData;
  const [selected, setSelected] = useState<string>('');
  const [feedback, setFeedback] = useState<FeedbackState>(IDLE);

  function check() {
    if (!selected) {
      setFeedback({ kind: 'bad', message: 'Спершу клікни ребро.' });
      return;
    }
    const edge = data.graph.edges.find((e) => e.id === selected);
    const ok = edge ? isBridge(data.graph, edge) : false;
    setFeedback(
      ok
        ? { kind: 'ok', message: 'Так — це міст: без цього ребра граф розпадається на дві компоненти.' }
        : { kind: 'bad', message: 'Ні: це ребро лежить на циклі, тож його вилучення не роз’єднує граф.' },
    );
  }

  return (
    <TaskShell task={task}>
      <div className={PANEL}>
        <GraphCanvas graph={data.graph} height={340} selectedEdgeIds={selected ? [selected] : []} onEdgeClick={(e) => { setSelected(e.id); setFeedback(IDLE); }} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton onClick={check}>Перевірити</ActionButton>
        <ActionButton tone="quiet" onClick={() => { setSelected(''); setFeedback(IDLE); }}>Очистити</ActionButton>
      </div>
      <Feedback state={feedback} />
      <HintRow hint={data.hint} />
    </TaskShell>
  );
}

/* ── euler-trace (traverse every edge exactly once) ───────── */

export function EulerTraceEngine({ task }: { task: Task }) {
  const data = task.providedData as unknown as EulerTraceData;
  const graph = data.graph;
  const [trail, setTrail] = useState<string[]>([]);
  const [current, setCurrent] = useState<string>(data.start);
  const [feedback, setFeedback] = useState<FeedbackState>(IDLE);

  function clickEdge(edge: typeof graph.edges[number]) {
    if (trail.includes(edge.id)) return;
    if (edge.source !== current && edge.target !== current) {
      setFeedback({ kind: 'bad', message: `Це ребро не виходить із поточної вершини ${current}.` });
      return;
    }
    setTrail((t) => [...t, edge.id]);
    setCurrent(edge.source === current ? edge.target : edge.source);
    setFeedback(IDLE);
  }

  function check() {
    if (trail.length < graph.edges.length) {
      setFeedback({ kind: 'bad', message: `Пройдено ${trail.length} із ${graph.edges.length} ребер — обхід має використати кожне ребро рівно раз.` });
      return;
    }
    if (data.requireCycle && current !== data.start) {
      setFeedback({ kind: 'bad', message: `Усі ребра пройдено, але обхід не повернувся у старт ${data.start} — це ланцюг, а не цикл.` });
      return;
    }
    setFeedback({ kind: 'ok', message: `Ейлерів ${data.requireCycle ? 'цикл' : 'обхід'} побудовано: кожне з ${graph.edges.length} ребер пройдено рівно раз. ✓` });
  }

  return (
    <TaskShell task={task}>
      <div className={PANEL}>
        <GraphCanvas graph={graph} height={Math.max(320, 60 + graph.nodes.length * 30)} selectedEdgeIds={trail} selectedNodeIds={[current]} onEdgeClick={clickEdge} />
      </div>
      <div className="mt-3 font-mono text-sm text-slate-600">
        поточна вершина: <b className="text-[var(--accent)]">{current}</b> · пройдено ребер: {trail.length}/{graph.edges.length}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton onClick={check}>Перевірити</ActionButton>
        <ActionButton tone="quiet" onClick={() => { setTrail([]); setCurrent(data.start); setFeedback(IDLE); }}>Очистити</ActionButton>
      </div>
      <Feedback state={feedback} />
      <HintRow hint={data.hint} reveal={data.reveal} />
    </TaskShell>
  );
}

/* ── hamilton-trace (visit every vertex once, return to start) ── */

export function HamiltonTraceEngine({ task }: { task: Task }) {
  const data = task.providedData as unknown as HamiltonTraceData;
  const graph = data.graph;
  const n = graph.nodes.length;
  const [path, setPath] = useState<string[]>([data.start]);
  const [feedback, setFeedback] = useState<FeedbackState>(IDLE);

  function clickNode(id: string) {
    setFeedback(IDLE);
    setPath((p) => {
      const tail = p[p.length - 1];
      if (id === tail) return p;
      if (p.length >= 2 && id === p[p.length - 2]) return p.slice(0, -1); // step back
      if (!edgeBetween(graph, tail, id)) return p; // only along an edge
      if (id === data.start && p.length === n) return [...p, id]; // close the cycle
      if (p.includes(id)) return p; // each vertex once
      return [...p, id];
    });
  }

  const tracedEdgeIds = useMemo(() => {
    const ids: string[] = [];
    for (let i = 0; i < path.length - 1; i += 1) {
      const e = edgeBetween(graph, path[i], path[i + 1]);
      if (e) ids.push(e.id);
    }
    return ids;
  }, [graph, path]);

  function check() {
    const visitedAll = new Set(path).size === n;
    const closed = path.length === n + 1 && path[path.length - 1] === data.start;
    if (!visitedAll) {
      setFeedback({ kind: 'bad', message: `Відвідано ${new Set(path).size} із ${n} вершин — гамільтонів цикл проходить через кожну.` });
      return;
    }
    if (!closed) {
      setFeedback({ kind: 'bad', message: `Усі вершини відвідано — тепер поверни цикл у старт ${data.start}.` });
      return;
    }
    setFeedback({ kind: 'ok', message: `Гамільтонів цикл ${path.join('–')}: усі ${n} вершин рівно раз і повернення в старт. ✓` });
  }

  return (
    <TaskShell task={task}>
      <div className={PANEL}>
        <GraphCanvas graph={graph} height={Math.max(340, 60 + n * 30)} selectedNodeIds={path} selectedEdgeIds={tracedEdgeIds} onNodeClick={clickNode} />
      </div>
      <div className="mt-3 font-mono text-sm text-slate-600">
        маршрут: {path.join(' → ')} · {new Set(path).size}/{n} вершин
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton onClick={check}>Перевірити</ActionButton>
        <ActionButton tone="quiet" onClick={() => { setPath([data.start]); setFeedback(IDLE); }}>Очистити</ActionButton>
      </div>
      <Feedback state={feedback} />
      <HintRow hint={data.hint} reveal={data.reveal} />
    </TaskShell>
  );
}

/* Inline RichText helper (KaTeX) used by several engines. */
function RichTextInline({ text, className }: { text: string; className?: string }) {
  return <RichText tag="span" className={className} text={text} />;
}
