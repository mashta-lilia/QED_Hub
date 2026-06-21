// Dispatcher: pick the engine for a Task by its `type`. Adding a task type means
// adding an engine in ./engines.tsx and a case here — nothing else.

import { RichText } from '../../../../lib/math';
import type { Task } from '../../types';
import {
  ComputeEngine,
  DecisionEngine,
  EdgeClickEngine,
  EulerTraceEngine,
  GraphBuildEngine,
  HamiltonTraceEngine,
  MatrixFillEngine,
  NodeClickEngine,
  PathTraceEngine,
  ProofOrderEngine,
} from './engines';
import { MODULE_41_TASK_BANK, MODULE_41_TASK_SECTIONS } from '../../data/tasks/module41';
import { MODULE_42_TASK_BANK, MODULE_42_TASK_SECTIONS } from '../../data/tasks/module42';
import { MODULE_43_TASK_BANK, MODULE_43_TASK_SECTIONS } from '../../data/tasks/module43';

export function TaskCard({ task }: { task: Task }) {
  switch (task.type) {
    case 'graph-build':
    case 'repair':
      return <GraphBuildEngine task={task} />;
    case 'matrix-fill':
      return <MatrixFillEngine task={task} />;
    case 'node-click':
      return <NodeClickEngine task={task} />;
    case 'edge-click':
      return <EdgeClickEngine task={task} />;
    case 'compute':
      return <ComputeEngine task={task} />;
    case 'impossibility':
      return <DecisionEngine task={task} />;
    case 'order-steps':
      return <ProofOrderEngine task={task} />;
    case 'path-trace':
      return <PathTraceEngine task={task} />;
    case 'euler-trace':
      return <EulerTraceEngine task={task} />;
    case 'hamilton-trace':
      return <HamiltonTraceEngine task={task} />;
    default:
      return (
        <article className="rounded-[24px] border border-dashed border-line bg-white p-5 text-sm text-slate-500">
          Завдання «{task.title}» ({task.type}) ще не має візуального рушія.
        </article>
      );
  }
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <div className="grid gap-5">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}

interface TaskSection {
  label: string;
  note?: string;
  tasks: Task[];
}

function TaskBankPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: TaskSection[] }) {
  return (
    <article className="mx-auto grid max-w-4xl gap-8 px-1 py-4">
      <header className="rounded-[24px] border border-line bg-white p-6 shadow">
        <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
        <h1 className="mt-2 font-head text-4xl font-extrabold leading-tight text-navy">{title}</h1>
        <RichText tag="p" className="mt-3 max-w-2xl font-serif text-lg leading-8 text-slate-600" text={intro} />
      </header>

      {sections.map((section) => (
        <section key={section.label} className="grid gap-5">
          <div className="border-l-4 border-accent pl-3">
            <RichText tag="h2" className="font-head text-xl font-extrabold leading-tight text-navy" text={section.label} />
            {section.note && <RichText tag="p" className="mt-1 font-serif text-sm leading-6 text-slate-500" text={section.note} />}
          </div>
          <TaskList tasks={section.tasks} />
        </section>
      ))}
    </article>
  );
}

/* Practice-hub page for module 4.1. */
export function GT01TaskBank() {
  return (
    <TaskBankPage
      eyebrow="GT-01 · банк завдань"
      title="Практика 4.1: усі задачі підрозділу"
      intro={`Задачі з підручника у форматі дій: будуй графи, рахуй, обирай «Так/Ні», збирай доведення з кроків. Усього ${MODULE_41_TASK_BANK.length} завдань.`}
      sections={MODULE_41_TASK_SECTIONS}
    />
  );
}

/* Practice-hub page for module 4.2. */
export function GT02TaskBank() {
  return (
    <TaskBankPage
      eyebrow="GT-02 · банк завдань"
      title="Практика 4.2: маршрути та зв’язність"
      intro={`Прокладай найкоротші шляхи по ребрах, шукай мости й точки зчленування, рахуй відстані та збирай доведення. Усього ${MODULE_42_TASK_BANK.length} завдань.`}
      sections={MODULE_42_TASK_SECTIONS}
    />
  );
}

/* Practice-hub page for module 4.3. */
export function GT03TaskBank() {
  return (
    <TaskBankPage
      eyebrow="GT-03 · банк завдань"
      title="Практика 4.3: обходи та орграфи"
      intro={`Проходь ейлерові й гамільтонові обходи, працюй із напівстепенями та зв’язністю орграфів, доводь теореми про турніри. Усього ${MODULE_43_TASK_BANK.length} завдань.`}
      sections={MODULE_43_TASK_SECTIONS}
    />
  );
}
