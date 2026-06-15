import { useMemo, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { chapters, graphSubtopics, subjects } from "./data/course";
import { useProgress } from "./hooks/useProgress";
import { CoursePage } from "./pages/CoursePage";
import { GraphTopicsPage } from "./pages/GraphTopicsPage";
import { IntroPage } from "./pages/IntroPage";
import { LessonPage } from "./pages/LessonPage";
import { SubjectsPage } from "./pages/SubjectsPage";
import { chapterProgress, topicProgress, totalXp } from "./utils/progress";

type Screen = "intro" | "subjects" | "course" | "topics" | "lesson";

export default function App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [selectedTopicId, setSelectedTopicId] = useState(graphSubtopics[0].id);
  const { progress, complete, reset } = useProgress();

  const progressByTopic = useMemo(
    () =>
      Object.fromEntries(
        graphSubtopics.map((topic) => [topic.id, topicProgress(progress, topic.id)]),
      ) as Record<string, number>,
    [progress],
  );

  const graphProgress = chapterProgress(progress, graphSubtopics);
  const courseProgress = Math.round(graphProgress / chapters.length);
  const xp = totalXp(progress);

  const selectedTopic = graphSubtopics.find((topic) => topic.id === selectedTopicId) ?? graphSubtopics[0];

  function openTopic(topicId: string) {
    setSelectedTopicId(topicId);
    setScreen("lesson");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function continueLearning() {
    const nextTopic = graphSubtopics.find((topic) => progressByTopic[topic.id] < 100) ?? graphSubtopics[0];
    openTopic(nextTopic.id);
  }

  return (
    <div className="min-h-screen bg-mist text-ink">
      {screen === "intro" ? <IntroPage onContinue={() => setScreen("subjects")} /> : null}

      {screen !== "intro" ? (
        <AppHeader
          title={screen === "lesson" ? selectedTopic.title : "Аксіома"}
          subtitle={
            screen === "subjects"
              ? "Предмети"
              : screen === "course"
                ? "Дискретна математика"
                : screen === "topics"
                  ? "Розділ 4 · Теорія графів"
                  : `Підтема ${selectedTopic.number}`
          }
          xp={xp}
          onBack={
            screen === "subjects"
              ? undefined
              : () => setScreen(screen === "lesson" ? "topics" : screen === "topics" ? "course" : "subjects")
          }
          backLabel={screen === "lesson" ? "Підтеми" : screen === "topics" ? "Теми" : "Предмети"}
        />
      ) : null}

      {screen === "subjects" ? (
        <SubjectsPage subjects={subjects} discreteProgress={courseProgress} onOpenDiscrete={() => setScreen("course")} />
      ) : null}

      {screen === "course" ? (
        <CoursePage
          chapters={chapters}
          graphProgress={graphProgress}
          courseProgress={courseProgress}
          xp={xp}
          onOpenGraphs={() => setScreen("topics")}
        />
      ) : null}

      {screen === "topics" ? (
        <GraphTopicsPage
          topics={graphSubtopics}
          progressByTopic={progressByTopic}
          overallProgress={graphProgress}
          xp={xp}
          onOpenTopic={openTopic}
          onContinue={continueLearning}
          onReset={reset}
        />
      ) : null}

      {screen === "lesson" ? (
        <LessonPage topic={selectedTopic} progress={progress} onComplete={complete} />
      ) : null}
    </div>
  );
}
