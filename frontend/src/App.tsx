import React, { useState, useRef, useEffect } from 'react';
import { AuthGateway } from './auth/AuthGateway';
import { ChevL, ChevR } from './components/common/Icons';
import { TweakColor, TweakRadio, TweakSection, TweaksPanel, useTweaks } from './components/common/Tweaks';
import { HomeScreen } from './components/curriculum/HomeScreen';
import { Ring } from './components/curriculum/ProgressTracker';
import { SubjectScreen } from './components/curriculum/SubjectScreen';
import { AppHeader } from './components/layout/AppHeader';
import { PageHeader } from './components/layout/PageHeader';
import { DISCRETE_TOPICS, SUBJECTS } from './data/subjects';
import { useLessonProgress } from './hooks/useLessonProgress';
import {
  GT01Intro, GT01TheoryDigraph, GT01TheoryMatrix, GT01TheoryDegree,
  GT01TheorySequence, GT01TheoryHandshaking, GT01TheoryPigeonhole,
  GT01TaskSequence, GT01TaskMatrix,
  GT01TaskRepair, GT01TaskRegular, GT01TaskEqual, GT01TaskDirected,
} from './subjects/discrete-math/components/GT01';
import { AwakenIntro } from './subjects/discrete-math/components/AwakenIntro';
import { GT01TaskBank, GT02TaskBank, GT03TaskBank } from './subjects/discrete-math/components/tasks/TaskCard';
import { GraphSubtopicsScreen } from './subjects/discrete-math/components/GraphSubtopicsScreen';
import type { AuthenticatedUser } from './auth/types';
import { restoreSession, logout as logoutRequest } from './auth/session';
import type { PageDescriptor, TweakValues } from './types';
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
} from './subjects/discrete-math/components/Theory';
import { GD } from './subjects/discrete-math/data/course';
import { GRAPH_SUBTOPICS } from './subjects/discrete-math/data/graphSubtopics';
import { getLessonTrackForSubtopic, LESSON_TRACK, PAGES } from './subjects/discrete-math/data/lessonTrack';
import { ColorLab, DegreeLab, EulerLab } from './subjects/discrete-math/tasks/Labs';
import { Practicals, Quiz, WorkedSolution } from './subjects/discrete-math/tasks/Practice';

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

/* ---- Метадані сторінок ---- */
const PAGE_META: Record<string, PageDescriptor> = {
  awaken: { id: 'awaken', kind: 'interactive', title: 'Вступ' },
};
PAGES.forEach((p) => {
  PAGE_META[p.id] = p;
});

type Screen = 'awaken' | 'home' | 'subject' | 'subtopics' | 'lesson';

export default function App() {
  const data = GD;
  const [t, setTweak] = useTweaks<TweakValues>(TWEAK_DEFAULTS);
  const [authUser, setAuthUser] = useState<AuthenticatedUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const {
    answers,
    answer,
    completeWorked,
    lessonProgress,
    lessonProgressPct,
    markVisited,
    streak,
    visited,
    workedDone,
    xp,
  } = useLessonProgress({ quiz: data.quiz, lessonTrack: LESSON_TRACK });
  const stageRef = useRef<HTMLDivElement | null>(null);

  // навігація застосунку: awaken → home → subject → lesson
  const [screen, setScreen] = useState<Screen>('awaken');
  const [topicId, setTopicId] = useState<string | null>(null);
  const [subtopicId, setSubtopicId] = useState<string>('g41');
  const [page, setPage] = useState(0); // індекс у LESSON_TRACK
  const currentLessonTrack = getLessonTrackForSubtopic(subtopicId);

  function gotoLesson(i: number) {
    const n = Math.max(0, Math.min(currentLessonTrack.length - 1, i));
    setPage(n);
    markVisited(currentLessonTrack[n]);
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
    markVisited(getLessonTrackForSubtopic(id)[0]);
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

  // On boot, try to restore an existing session from the refresh cookie.
  useEffect(() => {
    let active = true;
    restoreSession().then((user) => {
      if (!active) return;
      if (user) {
        setAuthUser(user);
        setScreen('home');
      }
      setAuthChecked(true);
    });
    return () => {
      active = false;
    };
  }, []);

  function handleAuthenticated(user: AuthenticatedUser) {
    setAuthUser(user);
    setScreen('home');
  }

  async function handleLogout() {
    await logoutRequest();
    setAuthUser(null);
    setScreen('home');
  }

  const accent = t.accent;
  const rootStyle = {
    '--accent': accent,
    '--head-font': HEAD_FONTS[t.headFont] || HEAD_FONTS.Manrope,
  } as React.CSSProperties;

  // прогрес по дискретній математиці
  const setsProgress = lessonProgress;
  const topics = DISCRETE_TOPICS.map((tp) => ({
    ...tp,
    progress: tp.id === 'graphs' ? setsProgress : tp.baseProgress,
  }));
  const discreteOverall = Math.round(topics.reduce((sum, tp) => sum + tp.progress, 0) / topics.length);
  const subject = SUBJECTS.find((s) => s.id === 'discrete')!;
  const topic = topics.find((tp) => tp.id === topicId) || topics[0];
  const subtopic = GRAPH_SUBTOPICS.find((tp) => tp.id === subtopicId) || GRAPH_SUBTOPICS[0];

  const curId = currentLessonTrack[Math.min(page, currentLessonTrack.length - 1)];
  const cur = PAGE_META[curId];
  const last = currentLessonTrack.length - 1;
  const pct = lessonProgressPct;

  function renderPage(id: string) {
    switch (id) {
      case 'gt01-intro':
        return <GT01Intro />;
      case 'gt01-theory-digraph':
        return <GT01TheoryDigraph />;
      case 'gt01-theory-matrix':
        return <GT01TheoryMatrix />;
      case 'gt01-theory-degree':
        return <GT01TheoryDegree />;
      case 'gt01-theory-sequence':
        return <GT01TheorySequence />;
      case 'gt01-theory-handshaking':
        return <GT01TheoryHandshaking />;
      case 'gt01-theory-pigeonhole':
        return <GT01TheoryPigeonhole />;
      case 'gt01-task-sequence':
        return <GT01TaskSequence />;
      case 'gt01-task-matrix':
        return <GT01TaskMatrix />;
      case 'gt01-task-repair':
        return <GT01TaskRepair />;
      case 'gt01-task-regular':
        return <GT01TaskRegular />;
      case 'gt01-task-equal':
        return <GT01TaskEqual />;
      case 'gt01-task-directed':
        return <GT01TaskDirected />;
      case 'gt01-taskbank':
        return <GT01TaskBank />;
      case 'gt02-taskbank':
        return <GT02TaskBank />;
      case 'gt03-taskbank':
        return <GT03TaskBank />;
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
        return <WorkedSolution worked={data.worked} completed={workedDone} onComplete={completeWorked} />;
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

  if (!authChecked) {
    return (
      <div className="app" style={rootStyle}>
        <div className="stage" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
          <div className="auth-loading">Завантаження…</div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <AuthGateway onAuthenticated={handleAuthenticated} />;
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
        <AppHeader streak={streak} onLogout={handleLogout} />
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
        <AppHeader streak={streak} onBack={() => goScreen('home')} backLabel="Предмети" onLogout={handleLogout} />
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
        <AppHeader streak={streak} onBack={() => goScreen('subject')} backLabel="Теми" onLogout={handleLogout} />

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
          <PageHeader page={cur} idx={page} total={currentLessonTrack.length} modeLabel={'Тема ' + topic.n} />
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
          {currentLessonTrack.map((id, i) => (
            <button
              key={id}
              className={'dn-dot' + (i === page ? ' on' : visited[id] ? ' done' : '') + ' kind-' + (PAGE_META[id]?.kind || 'theory')}
              title={PAGE_META[id].title}
              onClick={() => gotoLesson(i)}
            />
          ))}
        </div>
        <button className="dn-arrow" disabled={page === last} onClick={() => gotoLesson(page + 1)}>
          <ChevR />
        </button>
        <div className="dn-count">
          {String(page + 1).padStart(2, '0')} / {String(currentLessonTrack.length).padStart(2, '0')}
        </div>
      </div>

      {tweaksPanel}
    </div>
  );
}
