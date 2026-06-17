import { useState, type FormEvent } from 'react';
import { ChevR } from '../../../components/common/Icons';
import { GraphDiagram, GFig } from '../../../lib/graph';
import { RichText, Tex } from '../../../lib/math';
import type { QuizItem, QuizMC, QuizTypeIn, AnswerState, Worked, Practical } from '../../../types';

function Hint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pr-hint">
      <button className="pr-hintbtn" onClick={() => setOpen((o) => !o)}>
        {open ? 'Сховати підказку' : 'Підказка'}
      </button>
      {open && <RichText tag="div" className="pr-hinttext" text={text} />}
    </div>
  );
}

interface QProps<Q> {
  q: Q;
  index: number;
  state?: AnswerState;
  onAnswer: (q: QuizItem, res: Partial<AnswerState>) => void;
}

function MCQuestion({ q, index, state, onAnswer }: QProps<QuizMC>) {
  const answered = !!(state && state.done);
  const picked = state ? state.picked : null;
  return (
    <div className="pr-q">
      <div className="pr-qhead">
        <span className="pr-qnum">{index + 1}</span>
        <RichText tag="div" className="pr-prompt" text={q.prompt} />
      </div>
      <div className="pr-options">
        {q.options.map((opt, i) => {
          let cls = 'pr-opt';
          if (answered) {
            if (i === q.correct) cls += ' correct';
            else if (i === picked) cls += ' wrong';
            else cls += ' muted';
          }
          return (
            <button key={i} className={cls} disabled={answered} onClick={() => onAnswer(q, { picked: i, ok: i === q.correct })}>
              <span className="pr-optmark" />
              <Tex tex={opt} />
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={'pr-verdict ' + (state!.ok ? 'ok' : 'no')}>
          {state!.ok ? 'Правильно — +10 XP' : 'Не зовсім. Правильну відповідь підсвічено.'}
        </div>
      )}
      {!answered && <Hint text={q.hint} />}
    </div>
  );
}

function TypeInQuestion({ q, index, state, onAnswer }: QProps<QuizTypeIn>) {
  const [val, setVal] = useState('');
  const answered = !!(state && state.done);
  function submit(e: FormEvent) {
    e.preventDefault();
    const norm = val.trim().replace(',', '.');
    const ok = q.answers.map(String).includes(norm);
    onAnswer(q, { ok, value: norm });
  }
  return (
    <div className="pr-q">
      <div className="pr-qhead">
        <span className="pr-qnum">{index + 1}</span>
        <RichText tag="div" className="pr-prompt" text={q.prompt} />
      </div>
      <form className="pr-typein" onSubmit={submit}>
        <input
          className={'pr-input' + (answered ? (state!.ok ? ' ok' : ' no') : '')}
          value={answered ? state!.value : val}
          disabled={answered}
          placeholder="Ваша відповідь…"
          onChange={(e) => setVal(e.target.value)}
        />
        {!answered && (
          <button className="pr-submit" type="submit">
            Перевірити
          </button>
        )}
      </form>
      {answered && (
        <div className={'pr-verdict ' + (state!.ok ? 'ok' : 'no')}>
          {state!.ok ? 'Правильно — +10 XP' : 'Правильна відповідь: ' + q.answers[0]}
        </div>
      )}
      {!answered && <Hint text={q.hint} />}
    </div>
  );
}

interface QuizProps {
  quiz: QuizItem[];
  answers: Record<string, AnswerState>;
  onAnswer: (q: QuizItem, res: Partial<AnswerState>) => void;
}
export function Quiz({ quiz, answers, onAnswer }: QuizProps) {
  return (
    <div className="pr-quiz">
      {quiz.map((q, i) =>
        q.type === 'mc' ? (
          <MCQuestion key={q.id} q={q} index={i} state={answers[q.id]} onAnswer={onAnswer} />
        ) : (
          <TypeInQuestion key={q.id} q={q} index={i} state={answers[q.id]} onAnswer={onAnswer} />
        ),
      )}
    </div>
  );
}

interface WorkedProps {
  worked: Worked;
  onComplete?: () => void;
  completed?: boolean;
}
export function WorkedSolution({ worked, onComplete, completed }: WorkedProps) {
  const total = worked.steps.length;
  const [shown, setShown] = useState(completed ? total : 0);
  function next() {
    const n = Math.min(total, shown + 1);
    setShown(n);
    if (n === total && !completed) onComplete && onComplete();
  }
  return (
    <div className="pr-worked">
      <div className="pr-worked-top">
        <div>
          <div className="pr-worked-kicker">Розбір задачі</div>
          <div className="pr-worked-title">{worked.title}</div>
          {worked.subtitle && (
            <RichText tag="div" className="th-lead2" style={{ margin: '6px 0 0', fontSize: '14px' }} text={worked.subtitle} />
          )}
        </div>
      </div>
      {worked.graph && (
        <GFig dark caption={'Граф $G$. Знайдемо ексцентриситет кожної вершини, далі — радіус, діаметр і центр.'}>
          <GraphDiagram dark w={560} h={235} nodeR={17} nodes={worked.graph.nodes} edges={worked.graph.edges} />
        </GFig>
      )}
      <ol className="pr-steps">
        {worked.steps.map((s, i) => (
          <li key={i} className={'pr-step' + (i < shown ? ' on' : '')}>
            <div className="pr-step-dot">{i + 1}</div>
            <div className="pr-step-body">
              <RichText tag="div" className="pr-step-label" text={s.label} />
              {i < shown && (
                <>
                  <div className="pr-step-math">
                    <Tex tex={s.tex} display />
                  </div>
                  <RichText tag="div" className="pr-step-note" text={s.note} />
                </>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div className="pr-worked-foot">
        {shown < total ? (
          <button className="pr-reveal" onClick={next}>
            {shown === 0 ? 'Показати перший крок' : 'Наступний крок'}
            <span className="pr-reveal-count">
              {shown}/{total}
            </span>
          </button>
        ) : (
          <div className="pr-done-line">Розв'язок повністю розкрито — +20 XP</div>
        )}
      </div>
    </div>
  );
}

function PracticalCard({ p }: { p: Practical }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={'pl-card' + (open ? ' open' : '')}>
      <button className="pl-head" onClick={() => setOpen((o) => !o)}>
        <span className="pl-num">№{p.n}</span>
        <span className="pl-h-main">
          <span className="pl-h-title">{p.title}</span>
          <span className="pl-h-topics">{p.topics.join(' · ')}</span>
        </span>
        <span className="pl-chev">
          <ChevR />
        </span>
      </button>
      {open && (
        <div className="pl-body">
          {p.blocks.map((b, bi) => (
            <div key={bi} className="pl-block">
              <div className="pl-block-lbl">{b.label}</div>
              <ol className="pl-tasks">
                {b.tasks.map((t, ti) => (
                  <RichText key={ti} tag="li" text={t} />
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Practicals({ practicals }: { practicals: Practical[] }) {
  return (
    <>
      <RichText
        tag="p"
        className="th-lead2"
        text={'Шість практичних занять (12–18) повністю охоплюють розділ. Натисніть на заняття, щоб розгорнути перелік завдань.'}
      />
      <div className="pl-list">
        {practicals.map((p) => (
          <PracticalCard key={p.n} p={p} />
        ))}
      </div>
    </>
  );
}
