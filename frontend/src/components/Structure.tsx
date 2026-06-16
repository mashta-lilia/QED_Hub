import React, { useState, useMemo } from 'react';
import { ringLayout } from '../lib/graph';
import { RichText } from '../lib/math';
import { ChevL, ChevR, IconLock } from './Icons';
import type { PageDescriptor, PageKind } from '../types';

/* ============================ APP-LEVEL DATA ============================ */
export const APP_NAME = 'Аксіома';

export interface Subject {
  id: string;
  name: string;
  desc: string;
  icon: keyof typeof SUBJ_ICONS;
  color: string;
  status: 'active' | 'soon';
}
export const SUBJECTS: Subject[] = [
  { id: 'discrete', name: 'Дискретна математика', desc: 'Множини, логіка, відношення, комбінаторика та графи.', icon: 'sets', color: '#2f6fdb', status: 'active' },
  { id: 'programming', name: 'Програмування', desc: 'Алгоритми, структури даних і основи мов.', icon: 'code', color: '#1f8aa3', status: 'soon' },
  { id: 'calculus', name: 'Математичний аналіз', desc: 'Границі, похідні та інтеграли функцій.', icon: 'calc', color: '#1f9d6b', status: 'soon' },
];

export interface Topic {
  id: string;
  n: string;
  title: string;
  lessons: number;
  baseProgress: number;
  status: 'active' | 'soon';
}
export const DISCRETE_TOPICS: Topic[] = [
  { id: 'sets', n: '1', title: ' Елементи математичної логіки ', lessons: 8, baseProgress: 0, status: 'soon' },
  { id: 'logic', n: '2', title: 'Множини та відношення', lessons: 7, baseProgress: 0, status: 'soon' },
  { id: 'combinatorics', n: '3', title: 'Комбінаторика', lessons: 6, baseProgress: 0, status: 'soon' },
  { id: 'graphs', n: '4', title: 'Теорія графів', lessons: 17, baseProgress: 0, status: 'active' },
  { id: 'automata', n: '5', title: 'Теорія автоматів', lessons: 9, baseProgress: 0, status: 'soon' },
  { id: 'boolean', n: '6', title: 'Семантичні засади логіки предикатів', lessons: 6, baseProgress: 0, status: 'soon' },
];

export interface GraphSubtopic {
  id: string;
  n: string;
  title: string;
  lessons: number;
  page: string;
  progress: number;
}

export const GRAPH_SUBTOPICS: GraphSubtopic[] = [
  { id: 'g41', n: '4.1', title: 'Поняття графа. Способи задання графів', lessons: 3, page: 'с. 161', progress: 0 },
  { id: 'g42', n: '4.2', title: 'Підграфи. Ізоморфізм графів. Операції для графів', lessons: 3, page: 'с. 164', progress: 0 },
  { id: 'g43', n: '4.3', title: 'Графи та бінарні відношення', lessons: 2, page: 'с. 169', progress: 0 },
  { id: 'g44', n: '4.4', title: 'Степені вершин графа', lessons: 2, page: 'с. 169', progress: 0 },
  { id: 'g45', n: '4.5', title: "Шлях у графі. Зв'язність графів", lessons: 3, page: 'с. 171', progress: 0 },
  { id: 'g46', n: '4.6', title: "Перевірка зв'язності графів", lessons: 2, page: 'с. 176', progress: 0 },
  { id: 'g47', n: '4.7', title: 'Дерева та двочасткові графи', lessons: 3, page: 'с. 178', progress: 0 },
  { id: 'g48', n: '4.8', title: 'Плоскі та планарні графи', lessons: 2, page: 'с. 181', progress: 0 },
  { id: 'g49', n: '4.9', title: 'Розфарбування графів', lessons: 2, page: 'с. 186', progress: 0 },
  { id: 'g410', n: '4.10', title: 'Обходи графів', lessons: 2, page: 'с. 190', progress: 0 },
  { id: 'g411', n: '4.11', title: 'Орієнтовані графи', lessons: 2, page: 'с. 192', progress: 0 },
  { id: 'g412', n: '4.12', title: 'Граф як модель. Застосування теорії графів', lessons: 2, page: 'с. 195', progress: 0 },
];

export const SUBJ_ICONS = {
  sets: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="12" r="6" />
      <circle cx="15" cy="12" r="6" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  calc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h14l-7 8 7 8H5" />
    </svg>
  ),
};

/* ============================ PROGRESS RING ============================ */
interface RingProps {
  pct: number;
  accent: string;
  size?: number;
  sw?: number;
}
export function Ring({ pct, accent, size = 40, sw = 5 }: RingProps) {
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-bg" strokeWidth={sw} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        className="ring-fg"
        stroke={accent}
        strokeWidth={sw}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 4} className="ring-txt" fontSize={size * 0.3}>
        {Math.round(pct)}
      </text>
    </svg>
  );
}

/* ============================ PAGE HEADER ============================ */
const KIND_LABEL: Record<PageKind, string> = { theory: 'Теорія', interactive: 'Інтерактив', practice: 'Практика' };
interface PageHeaderProps {
  page: PageDescriptor;
  idx: number;
  total: number;
  modeLabel: string;
}
export function PageHeader({ page, idx, total, modeLabel }: PageHeaderProps) {
  return (
    <div className="ph">
      <div className="ph-row">
        <span className={'ph-kind k-' + page.kind}>{KIND_LABEL[page.kind]}</span>
        <span className="ph-step">
          {modeLabel} · {idx + 1} / {total}
        </span>
      </div>
      <h1 className="ph-title">{page.title}</h1>
      {page.lead && <p className="ph-lead">{page.lead}</p>}
    </div>
  );
}

/* ============================ AWAKEN INTRO (граф) ============================ */
interface AwakenProps {
  accent: string;
  onContinue: () => void;
}
export function AwakenIntro({ accent, onContinue }: AwakenProps) {
  const [live, setLive] = useState(false);
  const geo = useMemo(() => {
    const ids = ['1', '2', '3', '4', '5', '6', '7'];
    const p = ringLayout(ids, 330, 150, 120);
    const edges: [string, string][] = [];
    for (let i = 0; i < ids.length; i++) edges.push([ids[i], ids[(i + 1) % ids.length]]);
    ([['1', '4'], ['2', '5'], ['3', '6'], ['4', '7']] as [string, string][]).forEach((c) => edges.push(c));
    const cycPath = 'M' + ids.map((id) => p[id].x.toFixed(1) + ' ' + p[id].y.toFixed(1)).join(' L') + ' Z';
    return { ids, p, edges, cycPath };
  }, []);
  return (
    <div className="aw-wrap">
      
      <div className={'aw' + (live ? ' live' : '')}>
        <div className="aw-stage">
          <RichText
            tag="div"
            className="aw-poem aw-poem-top"
            text={'Сім мостів Кеніґсберга чекали відповіді:\nчи можна пройти кожен лиш раз?'}
          />
          <svg viewBox="0 0 660 300" className="aw-svg">
            {geo.edges.map((e, i) => {
              const a = geo.p[e[0]],
                b = geo.p[e[1]];
              const len = Math.hypot(b.x - a.x, b.y - a.y);
              return (
                <line
                  key={i}
                  className="aw-gedge"
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  style={{ '--l': len, strokeDasharray: len, animationDelay: 0.25 + i * 0.07 + 's' } as React.CSSProperties}
                />
              );
            })}
            {geo.ids.map((id, i) => {
              const n = geo.p[id];
              return (
                <g key={id} className="aw-gnode" style={{ animationDelay: 0.15 + i * 0.11 + 's' }}>
                  <circle cx={n.x} cy={n.y} r="16" fill={accent} stroke="#0a1322" strokeWidth="2.5" />
                  <text x={n.x} y={n.y} className="glabel">
                    {id}
                  </text>
                </g>
              );
            })}
            <circle className="aw-gtracer" r="7.5" fill="#ffffff" style={{ offsetPath: `path('${geo.cycPath}')` } as React.CSSProperties} />
            <circle className="aw-gtracer" r="5" fill={accent} style={{ offsetPath: `path('${geo.cycPath}')`, animationDelay: '0.25s' } as React.CSSProperties} />
          </svg>
          <RichText
            tag="div"
            className="aw-poem aw-poem-bot"
            text={'Звідси у $1736$ році народилась теорія графів —\nнаука про звʼязки між усіма речами.'}
          />
          <div className="aw-activate-wrap">
            <button className="aw-activate" onClick={() => setLive(true)}>
  Оживити граф
  <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
    <line x1="3" y1="11" x2="10" y2="3" stroke="currentColor" strokeWidth="1.6" />
    <line x1="10" y1="3" x2="17" y2="11" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="3" cy="11" r="2.6" fill="currentColor" />
    <circle cx="10" cy="3" r="2.6" fill="currentColor" />
    <circle cx="17" cy="11" r="2.6" fill="currentColor" />
  </svg>
</button>
          </div>
        </div>
        <div className="aw-continue">
          <button className="cover-cta" style={{ background: accent }} onClick={onContinue}>
            Перейти до теми <ChevR />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ APP HEADER ============================ */
interface AppHeaderProps {
  streak: number;
  onBack?: () => void;
  backLabel?: string;
}
export function AppHeader({ streak, onBack, backLabel }: AppHeaderProps) {
  return (
    <div className="apphdr">
      <div className="ah-brand">
        {onBack && (
          <button className="ah-back" onClick={onBack}>
            <ChevL /> {backLabel || 'Назад'}
          </button>
        )}
        <div className="tb-logo">
          <span />
        </div>
        <div className="ah-name">{APP_NAME}</div>
      </div>
      <div className="ah-right">
        <div className="ah-streak">
          <span className="tb-flame" />
          <b>{streak}</b>
          <em>днів поспіль</em>
        </div>
        <button className="ah-avatar" title="Профіль">
          S
        </button>
      </div>
    </div>
  );
}

/* ============================ HOME (subjects) ============================ */
interface HomeProps {
  subjects: Subject[];
  discreteProgress: number;
  onOpen: (id: string) => void;
}
export function HomeScreen({ subjects, discreteProgress, onOpen }: HomeProps) {
  return (
    <div className="home">
      <div className="home-hi">
        <div className="home-eyebrow">Вітаємо знову</div>
        <h1 className="home-title">Оберіть предмет</h1>
        <p className="home-sub">Продовжуйте навчання або почніть новий курс.</p>
      </div>
      <div className="subj-grid">
        {subjects.map((s) => {
          const active = s.status === 'active';
          const prog = s.id === 'discrete' ? discreteProgress : 0;
          return (
            <button
              key={s.id}
              className={'subj-card ' + (active ? 'active' : 'soon')}
              disabled={!active}
              onClick={() => active && onOpen(s.id)}
            >
              {!active && <span className="subj-soon-badge">Ще в розробці</span>}
              <div className="subj-top" style={{ background: 'color-mix(in oklab, ' + s.color + ', transparent 90%)' }}>
                <div className="subj-icon" style={{ color: s.color, background: 'color-mix(in oklab, ' + s.color + ', transparent 82%)' }}>
                  {SUBJ_ICONS[s.icon]}
                </div>
              </div>
              <div className="subj-body">
                <div className="subj-name">{s.name}</div>
                <div className="subj-desc">{s.desc}</div>
                {active ? (
                  <div className="subj-foot">
                    <div className="subj-bar">
                      <i style={{ width: prog + '%', background: s.color }} />
                    </div>
                    <b>{prog}%</b>
                  </div>
                ) : (
                  <div className="subj-foot">Незабаром</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ SUBJECT (topics + progress) ============================ */
interface SubjectScreenProps {
  subject: Subject;
  topics: (Topic & { progress: number })[];
  overall: number;
  xp: number;
  streak: number;
  onOpenTopic: (id: string) => void;
  onContinue: () => void;
}
export function SubjectScreen({ subject, topics, overall, xp, streak, onOpenTopic, onContinue }: SubjectScreenProps) {
  const doneCount = topics.filter((t) => t.progress >= 100).length;
  return (
    <div className="subj-view">
      <div className="sv-main">
        <div className="sv-head">
          <div className="sv-kicker">{subject.name}</div>
          <h1 className="sv-title">Теми курсу</h1>
          <p className="sv-sub">Оберіть тему, щоб перейти до занять — теорія та практика в одному потоці.</p>
        </div>
        <div className="tp-list">
          {topics.map((tp) => {
            const active = tp.status === 'active';
            return (
              <button
                key={tp.id}
                className={'tp-row ' + (active ? 'active' : 'soon')}
                disabled={!active}
                onClick={() => active && onOpenTopic(tp.id)}
              >
                <span className="tp-num">{tp.n}</span>
                <span className="tp-info">
                  <span className="tp-name">{tp.title}</span>
                  <span className="tp-meta">
                    {tp.lessons} занять
                    {active && (
                      <span className="tp-mini">
                        <i style={{ width: tp.progress + '%' }} />
                      </span>
                    )}
                  </span>
                </span>
                {active ? (
                  <span className="tp-prog">{tp.progress}%</span>
                ) : (
                  <span className="tp-lock">
                    <IconLock />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <aside className="pp-card">
        <div className="pp-title">Ваш прогрес</div>
        <div className="pp-ring-wrap">
          <Ring pct={overall} accent="var(--accent)" size={124} sw={11} />
        </div>
        <p className="pp-caption">пройдено матеріалу курсу</p>
        <div className="pp-stats">
          <div className="pp-stat">
            <span>Завершено тем</span>
            <b>
              {doneCount} / {topics.length}
            </b>
          </div>
          <div className="pp-stat">
            <span>Зароблено XP</span>
            <b>{xp}</b>
          </div>
          <div className="pp-stat">
            <span>Серія</span>
            <b>{streak} дн.</b>
          </div>
        </div>
        <button className="pp-cta" onClick={onContinue}>
          Продовжити навчання <ChevR />
        </button>
      </aside>
    </div>
  );

  
}
interface GraphSubtopicsScreenProps {
  subtopics: GraphSubtopic[];
  overall: number;
  xp: number;
  streak: number;
  onOpenSubtopic: (id: string) => void;
  onContinue: () => void;
}

export function GraphSubtopicsScreen({
  subtopics,
  overall,
  xp,
  streak,
  onOpenSubtopic,
  onContinue,
}: GraphSubtopicsScreenProps) {
  const doneCount = subtopics.filter((t) => t.progress >= 100).length;

  return (
    <div className="subj-view">
      <div className="sv-main">
        <div className="sv-head">
          <div className="sv-kicker">Розділ 4 · Теорія графів</div>
          <h1 className="sv-title">Підтеми розділу</h1>
          <p className="sv-sub">
            Оберіть підтему, щоб перейти до занять — теорія, практика та питання.
          </p>
        </div>

        <div className="tp-list">
          {subtopics.map((tp) => (
            <button
              key={tp.id}
              className="tp-row active"
              onClick={() => onOpenSubtopic(tp.id)}
            >
              <span className="tp-num">{tp.n}</span>

              <span className="tp-info">
                <span className="tp-name">{tp.title}</span>
                <span className="tp-meta">
                  {tp.page}
                  <span className="tp-mini">
                    <i style={{ width: `${tp.progress}%` }} />
                  </span>
                  теорія + практика + питання
                </span>
              </span>

              <span className="tp-prog">{tp.progress}%</span>
            </button>
          ))}
        </div>
      </div>

      <aside className="pp-card">
        <div className="pp-title">Прогрес розділу</div>
        <div className="pp-ring-wrap">
          <Ring pct={overall} accent="var(--accent)" size={124} sw={11} />
        </div>
        <p className="pp-caption">пройдено матеріалу розділу</p>

        <div className="pp-stats">
          <div className="pp-stat">
            <span>Завершено підтем</span>
            <b>{doneCount} / {subtopics.length}</b>
          </div>
          <div className="pp-stat">
            <span>Зароблено XP</span>
            <b>{xp}</b>
          </div>
          <div className="pp-stat">
            <span>Серія</span>
            <b>{streak} дн.</b>
          </div>
        </div>

        <button className="pp-cta" onClick={onContinue}>
          Продовжити навчання <ChevR />
        </button>
      </aside>
    </div>
  );
}
