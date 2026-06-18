import { useMemo, useState } from 'react';
import { RichText } from '../../../../lib/math';
import { GT01 } from '../../data/topics/GT-01-foundations';
import type { GraphData } from '../../types';
import { GT01SectionTabs, type GT01Section } from './GT01SectionTabs';
import { computeDegrees, FormulaPill, GraphCanvas } from './GraphVisuals';

interface MatrixTaskData {
  graph: GraphData;
  nodeOrder: string[];
  expectedMatrix: number[][];
}

const matrixTask = GT01.tasks.find((task) => task.id === 'GT-01-T2');
const matrixData = matrixTask?.providedData as unknown as MatrixTaskData | undefined;

function TextBlock({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`grid gap-2 ${className}`}>
      {text.split('\n').map((line) => (
        <RichText key={line} tag="p" className="font-serif text-base leading-7 text-slate-700" text={line} />
      ))}
    </div>
  );
}

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

function TheoremCard({ theorem }: { theorem: (typeof GT01.theory.theorems)[number] }) {
  const [open, setOpen] = useState(theorem.id === 'thm-handshaking');

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
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="mt-4 rounded-xl border border-accent/30 bg-accent/5 px-4 py-2 font-head text-sm font-bold text-accent transition hover:border-accent hover:bg-accent/10"
          >
            {open ? 'Сховати доказ' : 'Показати доказ'}
          </button>
          {open && (
            <RichText
              tag="p"
              className="mt-4 rounded-2xl border border-line bg-slate-50 p-4 font-serif text-sm leading-7 text-slate-700"
              text={theorem.proof}
            />
          )}
        </>
      )}
    </article>
  );
}

function NotationPreview() {
  const graph = GT01.theory.workedExamples[0]?.graph;
  const degrees = useMemo(() => (graph ? computeDegrees(graph) : {}), [graph]);
  if (!graph) return null;

  const degreeSum = Object.values(degrees).reduce((sum, degree) => sum + degree.total, 0);
  const vertices = graph.nodes.map((node) => node.label || node.id).join(', ');
  const edges = graph.edges.map((edge) => `{${edge.source}, ${edge.target}}`).join(', ');

  return (
    <section className="grid gap-5 rounded-[22px] border border-line bg-white p-5 shadow md:grid-cols-[1.05fr_0.95fr] md:items-center">
      <div>
        <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] text-accent">Візуальна нотація</p>
        <h2 className="mt-2 font-head text-2xl font-extrabold leading-tight text-navy">Один і той самий граф у трьох формах</h2>
        <p className="mt-3 font-serif text-base leading-7 text-slate-700">
          Діаграма, множини $V,E$ і степені вершин мають говорити про той самий об’єкт. Це головна навичка першого
          підрозділу.
        </p>
        <div className="mt-4 grid gap-2 rounded-2xl border border-line bg-slate-50 p-4 font-mono text-xs leading-6 text-slate-700">
          <span>V = {'{'}{vertices}{'}'}</span>
          <span>E = {'{'}{edges}{'}'}</span>
          <span>∑deg(v) = {degreeSum} = 2×{graph.edges.length}</span>
        </div>
      </div>
      <div className="rounded-2xl border border-line bg-slate-50 p-3">
        <GraphCanvas graph={graph} height={300} showDegrees />
      </div>
    </section>
  );
}

function HandshakingViz() {
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
    <section className="rounded-[22px] border border-line bg-white p-5 shadow-sm">
      <div className="grid gap-5 md:grid-cols-[1fr_220px] md:items-center">
        <div>
          <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] text-accent">Лема в русі</p>
          <h2 className="mt-2 font-head text-2xl font-extrabold leading-tight text-navy">Кожне ребро додає рівно 2</h2>
          <p className="mt-3 font-serif text-base leading-7 text-slate-700">
            Посунь повзунок: ребра з’являються по одному, а сума степенів щоразу росте на два.
          </p>
          <input
            aria-label="Кількість ребер"
            type="range"
            min={0}
            max={graph.edges.length}
            value={edgeCount}
            onChange={(event) => setEdgeCount(Number(event.target.value))}
            className="mt-5 w-full accent-[var(--accent)]"
          />
        </div>
        <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4 text-center">
          <p className="font-head text-xs font-bold uppercase tracking-[0.14em] text-accent">Перевірка</p>
          <p className="mt-2 font-head text-3xl font-extrabold text-navy">{degreeSum}</p>
          <p className="font-mono text-sm text-slate-600">= 2×{edgeCount}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{degreeSum === 2 * edgeCount ? 'Лема виконується.' : 'Перевір ребра ще раз.'}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-slate-50 p-3">
        <GraphCanvas graph={graph} height={300} selectedEdgeIds={selectedIds} mutedEdgeIds={mutedIds} />
      </div>
    </section>
  );
}

function MatrixInteractive() {
  const data = matrixData;
  if (!data) return null;
  const graph = data.graph;

  const [activeEdgeId, setActiveEdgeId] = useState(graph.edges[0]?.id || '');
  const activeEdge = graph.edges.find((edge) => edge.id === activeEdgeId) || graph.edges[0];

  function isActiveCell(row: string, column: string) {
    if (!activeEdge) return false;
    return (
      (activeEdge.source === row && activeEdge.target === column) ||
      (!graph.directed && activeEdge.source === column && activeEdge.target === row)
    );
  }

  function selectCell(row: string, column: string) {
    const next = graph.edges.find(
      (edge) =>
        (edge.source === row && edge.target === column) ||
        (!graph.directed && edge.source === column && edge.target === row),
    );
    if (next) setActiveEdgeId(next.id);
  }

  return (
    <section className="grid gap-5 rounded-[22px] border border-line bg-white p-5 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] text-accent">Граф ↔ матриця</p>
        <h2 className="mt-2 font-head text-2xl font-extrabold leading-tight text-navy">Клікни ребро або клітинку</h2>
        <p className="mt-3 font-serif text-base leading-7 text-slate-700">
          У неорієнтованому графі ребро підсвічує дві симетричні клітинки матриці суміжності.
        </p>
        <div className="mt-4 rounded-2xl border border-line bg-slate-50 p-3">
          <GraphCanvas
            graph={graph}
            height={300}
            selectedEdgeIds={activeEdge ? [activeEdge.id] : []}
            onEdgeClick={(edge) => setActiveEdgeId(edge.id)}
          />
        </div>
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
          {data.expectedMatrix.map((row, rowIndex) => {
            const rowLabel = data.nodeOrder[rowIndex];
            return (
              <tr key={rowLabel}>
                <td className="h-9 w-9 pr-2 text-right font-bold text-accent">{rowLabel}</td>
                {row.map((value, columnIndex) => {
                  const columnLabel = data.nodeOrder[columnIndex];
                  const active = isActiveCell(rowLabel, columnLabel);
                  return (
                    <td key={`${rowLabel}-${columnLabel}`} className="h-9 w-9 border border-line p-0 text-center">
                      <button
                        type="button"
                        onClick={() => selectCell(rowLabel, columnLabel)}
                        className={[
                          'h-full w-full font-bold transition',
                          active
                            ? 'bg-accent text-white'
                            : value
                              ? 'bg-accent/10 text-navy hover:bg-accent/20'
                              : 'bg-slate-50 text-slate-400',
                        ].join(' ')}
                      >
                        {value}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function TheoryTab() {
  return (
    <div className="grid gap-5">
      <NotationPreview />
      <section className="grid gap-4 md:grid-cols-2">
        {GT01.theory.definitions.map((definition) => (
          <DefinitionCard key={definition.id} definition={definition} />
        ))}
      </section>
    </div>
  );
}

function TheoremsTab() {
  return (
    <div className="grid gap-5">
      <HandshakingViz />
      <div className="grid gap-4">
        {GT01.theory.theorems.map((theorem) => (
          <TheoremCard key={theorem.id} theorem={theorem} />
        ))}
      </div>
    </div>
  );
}

function PracticeTab() {
  return (
    <div className="grid gap-5">
      <MatrixInteractive />
      <section className="grid gap-4">
        {GT01.theory.workedExamples.map((example) => (
          <article key={example.id} className="grid gap-4 rounded-[20px] border border-line bg-white p-5 shadow-sm md:grid-cols-[0.95fr_1.05fr]">
            {example.graph && (
              <div className="rounded-2xl border border-line bg-slate-50 p-3">
                <GraphCanvas graph={example.graph} height={300} showDegrees />
              </div>
            )}
            <div>
              <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] text-accent">Розбір</p>
              <h3 className="mt-2 font-head text-xl font-extrabold leading-tight text-navy">{example.title}</h3>
              <TextBlock text={example.description} className="mt-3" />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

interface GT01TheoryProps {
  activeTab?: GT01Section;
  onTabChange?: (tab: GT01Section) => void;
}

export function GT01Theory({ activeTab, onTabChange }: GT01TheoryProps) {
  const [localActiveTab, setLocalActiveTab] = useState<GT01Section>(activeTab || 'theory');
  const selectedTab = activeTab || localActiveTab;

  function selectTab(tab: GT01Section) {
    if (onTabChange) {
      onTabChange(tab);
      return;
    }
    setLocalActiveTab(tab);
  }

  return (
    <article className="mx-auto grid max-w-4xl gap-6 px-1 py-4">
      <header className="rounded-[24px] border border-line bg-white p-6 shadow">
        <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] text-accent">GT-01 · Тема 4.1</p>
        <h1 className="mt-2 font-head text-4xl font-extrabold leading-tight text-navy">Основи: анатомія графа і нотація</h1>
        <p className="mt-3 max-w-2xl font-serif text-lg leading-8 text-slate-600">
          Тут залишився формальний конспект, але подача знову візуальна: граф, формула, матриця і перевірка стоять поруч.
        </p>
      </header>

      <GT01SectionTabs activeTab={selectedTab} onSelect={selectTab} />

      {selectedTab === 'theory' && <TheoryTab />}
      {selectedTab === 'theorems' && <TheoremsTab />}
      {selectedTab === 'practice' && <PracticeTab />}
    </article>
  );
}
