import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { RichText } from '../../../../lib/math';
import { GT01 } from '../../data/topics/GT-01-foundations';
import type { GraphData, GraphEdge, GraphNode, Task } from '../../types';
import { GT01SectionTabs, type GT01Section } from './GT01SectionTabs';
import { computeDegrees, edgeKey, GraphCanvas } from './GraphVisuals';

type FeedbackKind = 'idle' | 'ok' | 'bad';

interface FeedbackState {
  kind: FeedbackKind;
  message: string;
}

interface DegreeSequenceData {
  degreeSequence: number[];
  nodeCount: number;
}

interface MatrixFillData {
  graph: GraphData;
  nodeOrder: string[];
  expectedMatrix: number[][];
}

interface RepairData {
  graph: GraphData;
  claimedEdgeCount: number;
  targetDegreeSum: number;
}

interface RegularData {
  k: number;
  n: number;
  nodes: GraphNode[];
}

interface EqualDegreeData {
  graph: GraphData;
  expectedDegrees: Record<string, number>;
}

interface DirectedDegreeData {
  graph: GraphData;
  expectedOutDegrees: Record<string, number>;
  expectedInDegrees: Record<string, number>;
  edgeCount: number;
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

function ringNodes(count: number, width = 520, height = 360, radius = 130): GraphNode[] {
  const cx = width / 2;
  const cy = height / 2;
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
    const id = String(index + 1);
    return {
      id,
      label: id,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}

function completeEdges(nodes: GraphNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      edges.push({
        id: edgeKey(nodes[i].id, nodes[j].id),
        source: nodes[i].id,
        target: nodes[j].id,
      });
    }
  }
  return edges;
}

function selectedGraph(nodes: GraphNode[], slots: GraphEdge[], selected: string[], directed = false): GraphData {
  return {
    nodes,
    edges: slots.filter((edge) => selected.includes(edge.id)),
    directed,
    weighted: false,
  };
}

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function TextBlock({ text, className = '' }: { text: string; className?: string }) {
  return <RichText tag="p" className={`font-serif text-base leading-7 text-slate-700 ${className}`} text={text} />;
}

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
    <div
      className={[
        'mt-4 flex items-start gap-3 rounded-2xl border p-4 text-sm leading-6',
        state.kind === 'ok' ? 'border-green-200 bg-green-50 text-green-900' : 'border-red-200 bg-red-50 text-red-900',
      ].join(' ')}
    >
      <StatusMark kind={state.kind} />
      <span>{state.message}</span>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  tone = 'primary',
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: 'primary' | 'quiet' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'min-h-[42px] rounded-xl border px-4 py-2 font-head text-sm font-bold transition',
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

function TaskShell({ children, task }: { children: ReactNode; task: Task }) {
  return (
    <article className="rounded-[24px] border border-line bg-white p-5 shadow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] text-accent">{task.type}</p>
          <h2 className="mt-2 font-head text-2xl font-extrabold leading-tight text-navy">{task.title}</h2>
        </div>
        <span className="rounded-full border border-accent/25 bg-accent/5 px-3 py-1 font-head text-xs font-extrabold text-accent">
          +{task.xp} XP
        </span>
      </div>
      <TextBlock text={task.prompt} className="mt-3" />
      <div className="mt-5">{children}</div>
    </article>
  );
}

function DegreeChips({
  current,
  target,
  labels,
}: {
  current: number[];
  target?: number[];
  labels: string[];
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
      {labels.map((label, index) => {
        const ok = target ? current[index] === target[index] : true;
        return (
          <div
            key={label}
            className={[
              'rounded-2xl border p-3 text-center font-head',
              ok ? 'border-green-200 bg-green-50 text-green-900' : 'border-amber-200 bg-amber-50 text-amber-900',
            ].join(' ')}
          >
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

function DegreeSequenceTask() {
  const data = TASKS.sequence.providedData as unknown as DegreeSequenceData;
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
    setFeedback(
      ok
        ? { kind: 'ok', message: 'Так, степені збігаються з послідовністю. Це простий граф без петель і кратних ребер.' }
        : { kind: 'bad', message: 'Ще не збігається. Подивись на жовті степені: саме там треба додати або прибрати ребро.' },
    );
  }

  return (
    <TaskShell task={TASKS.sequence}>
      <div className="rounded-2xl border border-line bg-slate-50 p-3">
        <GraphCanvas
          graph={graph}
          height={360}
          selectedEdgeIds={selected}
          mutedEdgeIds={muted}
          onEdgeClick={(edge) => setSelected((value) => toggleValue(value, edge.id))}
        />
      </div>
      <DegreeChips current={current} target={data.degreeSequence} labels={nodes.map((node) => node.id)} />
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton onClick={check}>Перевірити</ActionButton>
        <ActionButton tone="quiet" onClick={() => setSelected(solution)}>
          Показати один приклад
        </ActionButton>
        <ActionButton tone="quiet" onClick={() => setSelected([])}>
          Очистити
        </ActionButton>
        <ActionButton tone="danger" onClick={() => setFeedback({ kind: 'bad', message: 'Для цієї послідовності граф існує, тому «Неможливо» тут не підходить.' })}>
          Неможливо
        </ActionButton>
      </div>
      <Feedback state={feedback} />
    </TaskShell>
  );
}

function MatrixFillTask() {
  const data = TASKS.matrix.providedData as unknown as MatrixFillData;
  const empty = () => data.expectedMatrix.map((row) => row.map(() => 0));
  const [matrix, setMatrix] = useState<number[][]>(() => empty());
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: 'idle', message: '' });

  function toggleCell(row: number, column: number) {
    setMatrix((value) => value.map((line, r) => line.map((cell, c) => (r === row && c === column ? 1 - cell : cell))));
  }

  function check() {
    const ok = data.expectedMatrix.every((row, rowIndex) => row.every((cell, columnIndex) => cell === matrix[rowIndex][columnIndex]));
    setFeedback(
      ok
        ? { kind: 'ok', message: 'Матриця правильна: вона симетрична, а діагональ нульова.' }
        : { kind: 'bad', message: 'Є помилка в клітинках. Пам’ятай: для ребра a-b мають стояти одиниці в (a,b) і (b,a).' },
    );
  }

  return (
    <TaskShell task={TASKS.matrix}>
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className="rounded-2xl border border-line bg-slate-50 p-3">
          <GraphCanvas graph={data.graph} height={300} />
        </div>
        <table className="mx-auto border-collapse font-mono text-sm">
          <thead>
            <tr>
              <th className="h-9 w-9" />
              {data.nodeOrder.map((label) => (
                <th key={label} className="h-9 w-9 text-center text-accent">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rowIndex) => (
              <tr key={data.nodeOrder[rowIndex]}>
                <td className="h-9 w-9 pr-2 text-right font-bold text-accent">{data.nodeOrder[rowIndex]}</td>
                {row.map((cell, columnIndex) => (
                  <td key={`${rowIndex}-${columnIndex}`} className="h-9 w-9 border border-line p-0 text-center">
                    <button
                      type="button"
                      onClick={() => toggleCell(rowIndex, columnIndex)}
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
        <ActionButton tone="quiet" onClick={() => setMatrix(empty())}>
          Очистити
        </ActionButton>
      </div>
      <Feedback state={feedback} />
    </TaskShell>
  );
}

function RepairTask() {
  const data = TASKS.repair.providedData as unknown as RepairData;
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
    setFeedback(
      ok
        ? { kind: 'ok', message: 'Граф полагоджено: кількість ребер і сума степенів тепер узгоджені.' }
        : { kind: 'bad', message: `Зараз |E|=${selected.length}, а сума степенів ${degreeSum}. Треба |E|=${data.claimedEdgeCount} і ∑deg(v)=${data.targetDegreeSum}.` },
    );
  }

  return (
    <TaskShell task={TASKS.repair}>
      <div className="grid gap-4 md:grid-cols-[1fr_190px] md:items-center">
        <div className="rounded-2xl border border-line bg-slate-50 p-3">
          <GraphCanvas
            graph={graph}
            height={360}
            selectedEdgeIds={selected}
            mutedEdgeIds={muted}
            onEdgeClick={(edge) => setSelected((value) => toggleValue(value, edge.id))}
          />
        </div>
        <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4 text-center">
          <p className="font-head text-xs font-bold uppercase tracking-[0.14em] text-accent">Стан</p>
          <p className="mt-2 font-head text-2xl font-extrabold text-navy">|E| = {selected.length}</p>
          <p className="font-mono text-sm text-slate-600">∑deg(v) = {degreeSum}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton onClick={check}>Перевірити</ActionButton>
        <ActionButton tone="quiet" onClick={() => setSelected(initial)}>
          Скинути
        </ActionButton>
      </div>
      <Feedback state={feedback} />
    </TaskShell>
  );
}

function RegularGraphTask() {
  const data = TASKS.regular.providedData as unknown as RegularData;
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
    setFeedback(
      ok
        ? { kind: 'ok', message: `${data.k}-регулярний граф на ${data.n} вершинах побудовано. Кількість ребер теж сходиться: ${data.n}×${data.k}/2 = ${(data.n * data.k) / 2}.` }
        : { kind: 'bad', message: 'Ще ні: у кожної вершини має бути однаковий степінь 3.' },
    );
  }

  return (
    <TaskShell task={TASKS.regular}>
      <div className="rounded-2xl border border-line bg-slate-50 p-3">
        <GraphCanvas
          graph={graph}
          height={440}
          selectedEdgeIds={selected}
          mutedEdgeIds={muted}
          onEdgeClick={(edge) => setSelected((value) => toggleValue(value, edge.id))}
        />
      </div>
      <DegreeChips current={current} target={data.nodes.map(() => data.k)} labels={data.nodes.map((node) => node.id)} />
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton onClick={check}>Перевірити</ActionButton>
        <ActionButton tone="quiet" onClick={() => setSelected(solution)}>
          Показати приклад
        </ActionButton>
        <ActionButton tone="quiet" onClick={() => setSelected([])}>
          Очистити
        </ActionButton>
      </div>
      <Feedback state={feedback} />
    </TaskShell>
  );
}

function EqualDegreeTask() {
  const data = TASKS.equal.providedData as unknown as EqualDegreeData;
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
    if (selectedNodes.length !== 2) {
      setFeedback({ kind: 'bad', message: 'Обери рівно дві вершини.' });
      return;
    }
    const [a, b] = selectedNodes;
    const ok = degrees[a].total === degrees[b].total;
    setFeedback(
      ok
        ? { kind: 'ok', message: `Так: deg(${a}) = deg(${b}) = ${degrees[a].total}.` }
        : { kind: 'bad', message: `Поки ні: deg(${a}) = ${degrees[a].total}, а deg(${b}) = ${degrees[b].total}.` },
    );
  }

  return (
    <TaskShell task={TASKS.equal}>
      <div className="rounded-2xl border border-line bg-slate-50 p-3">
        <GraphCanvas graph={data.graph} height={360} selectedNodeIds={selectedNodes} onNodeClick={choose} showDegrees={feedback.kind !== 'idle'} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton onClick={check}>Перевірити пару</ActionButton>
        <ActionButton tone="quiet" onClick={() => setSelectedNodes([])}>
          Очистити
        </ActionButton>
      </div>
      <Feedback state={feedback} />
    </TaskShell>
  );
}

function DirectedDegreesTask() {
  const data = TASKS.directed.providedData as unknown as DirectedDegreeData;
  const [values, setValues] = useState<Record<string, { out: string; in: string }>>(() =>
    Object.fromEntries(data.graph.nodes.map((node) => [node.id, { out: '', in: '' }])),
  );
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: 'idle', message: '' });

  function update(nodeId: string, field: 'out' | 'in', value: string) {
    setValues((current) => ({
      ...current,
      [nodeId]: {
        ...current[nodeId],
        [field]: value,
      },
    }));
  }

  function check() {
    const ok = data.graph.nodes.every((node) => {
      const row = values[node.id];
      return Number(row.out) === data.expectedOutDegrees[node.id] && Number(row.in) === data.expectedInDegrees[node.id];
    });
    const outSum = data.graph.nodes.reduce((sum, node) => sum + Number(values[node.id].out || 0), 0);
    const inSum = data.graph.nodes.reduce((sum, node) => sum + Number(values[node.id].in || 0), 0);
    setFeedback(
      ok
        ? { kind: 'ok', message: `Правильно: ∑deg⁺ = ${outSum}, ∑deg⁻ = ${inSum}, і обидві суми дорівнюють |E| = ${data.edgeCount}.` }
        : { kind: 'bad', message: `Перевір напрямки стрілок. Зараз ∑deg⁺=${outSum}, ∑deg⁻=${inSum}, а має бути ${data.edgeCount}.` },
    );
  }

  return (
    <TaskShell task={TASKS.directed}>
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-start">
        <div className="rounded-2xl border border-line bg-slate-50 p-3">
          <GraphCanvas graph={data.graph} height={340} showDirectedDegrees={feedback.kind === 'ok'} />
        </div>
        <div className="overflow-hidden rounded-2xl border border-line">
          <table className="min-w-[240px] border-collapse bg-white font-head text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Вершина</th>
                <th className="px-3 py-2 text-left">deg⁺</th>
                <th className="px-3 py-2 text-left">deg⁻</th>
              </tr>
            </thead>
            <tbody>
              {data.graph.nodes.map((node) => (
                <tr key={node.id} className="border-t border-line">
                  <td className="px-3 py-2 font-extrabold text-navy">{node.label || node.id}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      value={values[node.id].out}
                      onChange={(event) => update(node.id, 'out', event.target.value)}
                      className="h-10 w-16 rounded-lg border border-line px-2 text-center font-mono focus:border-accent focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      value={values[node.id].in}
                      onChange={(event) => update(node.id, 'in', event.target.value)}
                      className="h-10 w-16 rounded-lg border border-line px-2 text-center font-mono focus:border-accent focus:outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton onClick={check}>Перевірити напівстепені</ActionButton>
        <ActionButton tone="quiet" onClick={() => setValues(Object.fromEntries(data.graph.nodes.map((node) => [node.id, { out: '', in: '' }])))}>
          Очистити
        </ActionButton>
      </div>
      <Feedback state={feedback} />
    </TaskShell>
  );
}

interface GT01PracticeProps {
  onTabChange?: (tab: GT01Section) => void;
}

export function GT01Practice({ onTabChange }: GT01PracticeProps) {
  return (
    <div className="mx-auto grid max-w-4xl gap-6 px-1 py-4">
      <header className="rounded-[24px] border border-line bg-white p-6 shadow">
        <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] text-accent">GT-01 · інтерактивна практика</p>
        <h1 className="mt-2 font-head text-4xl font-extrabold leading-tight text-navy">Практика: побудуй, заповни, перевір</h1>
        <p className="mt-3 max-w-2xl font-serif text-lg leading-8 text-slate-600">
          Я повернув завдання у форматі дій: клікай ребра, заповнюй матрицю, вибирай вершини й перевіряй рівності прямо на екрані.
        </p>
      </header>

      {onTabChange && <GT01SectionTabs activeTab="practice" onSelect={onTabChange} />}

      <DegreeSequenceTask />
      <MatrixFillTask />
      <RepairTask />
      <RegularGraphTask />
      <EqualDegreeTask />
      <DirectedDegreesTask />
    </div>
  );
}
