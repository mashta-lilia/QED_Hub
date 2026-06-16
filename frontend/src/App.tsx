import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AuthGateway } from './auth/AuthGateway';
import { GD, PAGES, LESSON_TRACK } from './data';
import type { QuizItem, AnswerState, PageDescriptor, TweakValues } from './types';
import type { AuthenticatedUser } from './auth/types';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor } from './components/Tweaks';
import { ChevL, ChevR } from './components/Icons';
import {
  Ring,
  PageHeader,
  AwakenIntro,
  AppHeader,
  HomeScreen,
  SubjectScreen,
  SUBJECTS,
  DISCRETE_TOPICS,
  GRAPH_SUBTOPICS,
  GraphSubtopicsScreen,
} from './components/Structure';
import {
  TheoryConcept,
  TheoryIso,
  TheoryDegrees,
  TheoryPaths,
  TheoryConnCheck,
  TheoryTrees,
  TheoryPlanar,
  TheoryColoring,
  TheoryTraversal,
  TheoryDigraph,
  TheoryApplications,
} from './components/Theory';
import { DegreeLab, ColorLab, EulerLab } from './components/Labs';
import { Quiz, WorkedSolution, Practicals } from './components/Practice';

/* ---- Налаштування за замовчуванням (Tweaks) ---- */
const TWEAK_DEFAULTS: TweakValues = {
  theoryStyle: 'card',
  accent: '#2f6fdb',
  headFont: 'Manrope',
};

const HEAD_FONTS: Record<string, string> = {
  Manrope: "'Manrope', sans-serif",
  Spectral: "'Spectral', Georgia, serif",
  Onest: "'Onest', sans-serif",
};

/* ---- Збереження прогресу ---- */
const LS_KEY = 'graphs_4_v1';
interface SavedProgress {
  answers?: Record<string, AnswerState>;
  workedDone?: boolean;
  visited?: Record<string, boolean>;
  streak?: number;
  lastDate?: string;
}
function loadProgress(): SavedProgress {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '') || {};
  } catch {
    return {};
  }
}
function saveProgress(p: SavedProgress) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/* ---- Метадані сторінок ---- */
const PAGE_META: Record<string, PageDescriptor> = {
  awaken: { id: 'awaken', kind: 'interactive', title: 'Вступ' },
};
PAGES.forEach((p) => {
  PAGE_META[p.id] = p;
});

type Screen = 'awaken' | 'home' | 'subject' | 'subtopics' |'lesson';

export default function App() {
  const data = GD;
  const [t, setTweak] = useTweaks<TweakValues>(TWEAK_DEFAULTS);
  const [authUser, setAuthUser] = useState<AuthenticatedUser | null>(null);
  const saved = useRef<SavedProgress>(loadProgress());
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(saved.current.answers || {});
  const [workedDone, setWorkedDone] = useState<boolean>(!!saved.current.workedDone);
  const [visited, setVisited] = useState<Record<string, boolean>>(saved.current.visited || {});
  const stageRef = useRef<HTMLDivElement | null>(null);

  // навігація застосунку: awaken → home → subject → lesson
  const [screen, setScreen] = useState<Screen>('awaken');
  const [topicId, setTopicId] = useState<string | null>(null);
  const [subtopicId, setSubtopicId] = useState<string>('g41');
  const [page, setPage] = useState(0); // індекс у LESSON_TRACK

  const streakRef = useRef<number | null>(null);
  if (streakRef.current === null) {
    const p = saved.current;
    let s = p.streak || 1;
    if (p.lastDate && p.lastDate !== todayStr()) {
      const gap = (+new Date(todayStr()) - +new Date(p.lastDate)) / 86400000;
      s = gap === 1 ? s + 1 : 1;
    } else if (!p.lastDate) {
      s = 4;
    }
    streakRef.current = s;
  }
  const streak = streakRef.current ?? 1;

  useEffect(() => {
    saveProgress({ answers, workedDone, visited, streak, lastDate: todayStr() });
  }, [answers, workedDone, visited, streak]);

  function gotoLesson(i: number) {
    const n = Math.max(0, Math.min(LESSON_TRACK.length - 1, i));
    setPage(n);
    setVisited((v) => ({ ...v, [LESSON_TRACK[n]]: true }));
    if (stageRef.current) stageRef.current.scrollTop = 0;
  }
  function openTopic(id: string) {
  if (id === 'graphs') {
    setTopicId(id);
    setScreen('subtopics');
    if (stageRef.current) stageRef.current.scrollTop = 0;
  }
}

function openSubtopic(id: string) {
  setSubtopicId(id);
  setTopicId('graphs');
  setScreen('lesson');
  setPage(0);
  setVisited((v) => ({ ...v, [LESSON_TRACK[0]]: true }));
  if (stageRef.current) stageRef.current.scrollTop = 0;
}
  function goScreen(s: Screen) {
    setScreen(s);
    if (stageRef.current) stageRef.current.scrollTop = 0;
  }

  useEffect(() => {
    if (screen !== 'lesson') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') gotoLesson(page + 1);
      else if (e.key === 'ArrowLeft') gotoLesson(page - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, screen]);

  function answer(q: QuizItem, res: Partial<AnswerState>) {
    setAnswers((a) => ({ ...a, [q.id]: { done: true, ok: false, ...res } }));
  }

  const xp = useMemo(() => {
    let x = 0;
    data.quiz.forEach((q) => {
      if (answers[q.id] && answers[q.id].ok) x += 10;
    });
    if (workedDone) x += 20;
    return x;
  }, [answers, workedDone, data.quiz]);

  const accent = t.accent;
  const rootStyle = {
    '--accent': accent,
    '--head-font': HEAD_FONTS[t.headFont] || HEAD_FONTS.Manrope,
  } as React.CSSProperties;

  // прогрес по дискретній математиці
  const lessonVisited = LESSON_TRACK.filter((id) => visited[id]).length;
  const setsProgress = Math.round((lessonVisited / LESSON_TRACK.length) * 100);
  const topics = DISCRETE_TOPICS.map((tp) => ({
    ...tp,
    progress: tp.id === 'graphs' ? setsProgress : tp.baseProgress,
  }));
  const discreteOverall = Math.round(topics.reduce((sum, tp) => sum + tp.progress, 0) / topics.length);
  const subject = SUBJECTS.find((s) => s.id === 'discrete')!;
  const topic = topics.find((tp) => tp.id === topicId) || topics[0];
  const subtopic = GRAPH_SUBTOPICS.find((tp) => tp.id === subtopicId) || GRAPH_SUBTOPICS[0];

  const curId = LESSON_TRACK[Math.min(page, LESSON_TRACK.length - 1)];
  const cur = PAGE_META[curId];
  const last = LESSON_TRACK.length - 1;
  const pct = (lessonVisited / LESSON_TRACK.length) * 100;

  function renderPage(id: string) {
    switch (id) {
      case 'concept':
        return <TheoryConcept />;
      case 'iso':
        return <TheoryIso />;
      case 'degrees':
        return <TheoryDegrees />;
      case 'degreelab':
        return <DegreeLab accent={accent} />;
      case 'paths':
        return <TheoryPaths />;
      case 'conncheck':
        return <TheoryConnCheck />;
      case 'trees':
        return <TheoryTrees />;
      case 'planar':
        return <TheoryPlanar />;
      case 'coloring':
        return <TheoryColoring />;
      case 'colorlab':
        return <ColorLab />;
      case 'traversal':
        return <TheoryTraversal />;
      case 'eulerlab':
        return <EulerLab />;
      case 'digraph':
        return <TheoryDigraph />;
      case 'applications':
        return <TheoryApplications />;
      case 'practice':
        return <Quiz quiz={data.quiz} answers={answers} onAnswer={answer} />;
      case 'worked':
        return <WorkedSolution worked={data.worked} completed={workedDone} onComplete={() => setWorkedDone(true)} />;
      case 'practicals':
        return <Practicals practicals={data.practicals} />;
      default:
        return null;
    }
  }

  const tweaksPanel = (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Оформлення" />
      <TweakColor label="Акцент" value={accent} options={['#2f6fdb', '#1f7a8c', '#6d4ad1', '#0e7a5f']} onChange={(v) => setTweak('accent', v as TweakValues['accent'])} />
      <TweakRadio label="Шрифт заголовків" value={t.headFont} options={['Manrope', 'Spectral', 'Onest']} onChange={(v) => setTweak('headFont', v as TweakValues['headFont'])} />
      <TweakSection label="Теорія" />
      <TweakRadio
        label="Стиль блоків"
        value={t.theoryStyle}
        options={[
          { value: 'card', label: 'Світлі' },
          { value: 'panel', label: 'Темні' },
        ]}
        onChange={(v) => setTweak('theoryStyle', v as TweakValues['theoryStyle'])}
      />
    </TweaksPanel>
  );

  if (!authUser) {
   return <AuthGateway onAuthenticated={setAuthUser} />;
  }

  /* ---------- екран: вступна анімація ---------- */
  if (screen === 'awaken') {
    return (
      <div className="app" style={rootStyle}>
        <div className="stage" ref={stageRef}>
          <div className="page">
            <AwakenIntro accent={accent} onContinue={() => goScreen('home')} />
          </div>
        </div>
        {tweaksPanel}
      </div>
    );
  }

  /* ---------- екран: головне вікно (предмети) ---------- */
  if (screen === 'home') {
    return (
      <div className="app" style={rootStyle}>
        <AppHeader streak={streak} />
        <div className="stage" ref={stageRef}>
          <HomeScreen
            subjects={SUBJECTS}
            discreteProgress={discreteOverall}
            onOpen={(id) => {
              if (id === 'discrete') goScreen('subject');
            }}
          />
        </div>
        {tweaksPanel}
      </div>
    );
  }

  /* ---------- екран: предмет (теми + прогрес) ---------- */
  if (screen === 'subject') {
    return (
      <div className="app" style={rootStyle}>
        <AppHeader streak={streak} onBack={() => goScreen('home')} backLabel="Предмети" />
        <div className="stage" ref={stageRef}>
          <SubjectScreen
            subject={subject}
            topics={topics}
            overall={discreteOverall}
            xp={xp}
            streak={streak}
            onOpenTopic={openTopic}
            onContinue={() => openTopic('graphs')}
          />
        </div>
        {tweaksPanel}
      </div>
    );
  }

  if (screen === 'subtopics') {
  const graphSubtopics = GRAPH_SUBTOPICS.map((st, index) => ({
    ...st,
    progress: index === 0 ? setsProgress : 0,
  }));

  return (
    <div className="app" style={rootStyle}>
      <AppHeader streak={streak} onBack={() => goScreen('subject')} backLabel="Теми" />

      <div className="stage" ref={stageRef}>
        <GraphSubtopicsScreen
          subtopics={graphSubtopics}
          overall={setsProgress}
          xp={xp}
          streak={streak}
          onOpenSubtopic={openSubtopic}
          onContinue={() => openSubtopic('g41')}
        />
      </div>

      {tweaksPanel}
    </div>
  );
}

  /* ---------- екран: урок (усе разом) ---------- */
  return (
    <div className={'app theory-' + t.theoryStyle} style={rootStyle}>
      <div className="topbar">
        <div className="tb-brand">
          <button className="tb-back" onClick={() => goScreen('subtopics')} title="До підтем">
            <ChevL />
          </button>
          <div className="tb-logo">
            <span />
          </div>
          <div>
            <div className="tb-course">{subject.name}</div>
            <div className="tb-sub">
              Тема {subtopic.n} · {subtopic.title}
            </div>
          </div>
        </div>
        <div className="tb-stats">
          <div className="tb-stat hide-sm">
            <div className="tb-statnum" style={{ color: accent }}>
              {xp}
            </div>
            <div className="tb-statlbl">
              XP
              <br />
              здобуто
            </div>
          </div>
          <div className="tb-divider hide-sm" />
          <div className="tb-stat hide-sm">
            <div className="tb-flame" />
            <div className="tb-statnum" style={{ color: 'var(--amber)' }}>
              {streak}
            </div>
            <div className="tb-statlbl">
              днів
              <br />
              поспіль
            </div>
          </div>
          <div className="tb-divider" />
          <div className="tb-stat">
            <Ring pct={pct} accent={accent} size={42} sw={5} />
            <div className="tb-statlbl">
              завершено
              <br />
              {Math.round(pct)}%
            </div>
          </div>
        </div>
      </div>

      <div className="stage" ref={stageRef}>
        <div className="page" key={curId}>
          <PageHeader page={cur} idx={page} total={LESSON_TRACK.length} modeLabel={'Тема ' + topic.n} />
          {renderPage(curId)}
          <div className="page-cta">
            {page < last ? (
              <button className="pc-btn" style={{ background: accent }} onClick={() => gotoLesson(page + 1)}>
                Далі <ChevR />
              </button>
            ) : (
              <button className="pc-btn ghost" onClick={() => goScreen('subject')}>
                Завершити тему
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="dotnav">
        <button className="dn-arrow" disabled={page === 0} onClick={() => gotoLesson(page - 1)}>
          <ChevL />
        </button>
        <div className="dn-dots">
          {LESSON_TRACK.map((id, i) => (
            <button
              key={id}
              className={'dn-dot' + (i === page ? ' on' : visited[id] ? ' done' : '')}
              title={PAGE_META[id].title}
              onClick={() => gotoLesson(i)}
            />
          ))}
        </div>
        <button className="dn-arrow" disabled={page === last} onClick={() => gotoLesson(page + 1)}>
          <ChevR />
        </button>
        <div className="dn-count">
          {String(page + 1).padStart(2, '0')} / {String(LESSON_TRACK.length).padStart(2, '0')}
        </div>
      </div>

      {tweaksPanel}
    </div>
  );
}