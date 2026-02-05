import { useEffect, useMemo, useState } from "react";
import courses from "./data/courses";
import type { DisciplineKey } from "./data/courses";
import {
  DEFAULT_COUNTS_FINAL,
  DEFAULT_COUNTS_MID,
  DISCIPLINES,
  OBJECTIVE_DISCIPLINES,
} from "./data/disciplines";
import SetupOverlay from "./components/SetupOverlay";
import HeroSection from "./components/HeroSection";
import ControlsPanel from "./components/ControlsPanel";
import CoursePanel from "./components/CoursePanel";
import FreeQuestions from "./components/FreeQuestions";
import FooterSection from "./components/FooterSection";
import { getCourseScoreStats, type TargetMode } from "./data/scoreHistory";
import type {
  DisciplineState,
  ExamMode,
  Question,
  Summary,
} from "./types/exam";
import {
  buildDisciplineState,
  buildQuestions,
  createQuestion,
} from "./utils/builders";
import { clampFloat, clampInt, parseMaxProp } from "./utils/format";
import { computeQuestionScore } from "./utils/scoring";
import "./App.css";

const SCORE_LIMIT = 10;

function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem("ufsc-theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });
  const [setupOpen, setSetupOpen] = useState(true);
  const [setupMode, setSetupMode] = useState<ExamMode>("final");
  const [examMode, setExamMode] = useState<ExamMode>("final");
  const [freeQuestionCount, setFreeQuestionCount] = useState(10);
  const [questionCount, setQuestionCount] = useState(10);
  const [objectiveTotal, setObjectiveTotal] = useState(80);
  const [targetMode, setTargetMode] = useState<TargetMode>("max");
  const [customTargetScore, setCustomTargetScore] = useState(0);
  const [discursivePoints, setDiscursivePoints] = useState(10);
  const [essayPoints, setEssayPoints] = useState(10);
  const [essayEnabled, setEssayEnabled] = useState(true);
  const [discursiveEnabled, setDiscursiveEnabled] = useState(true);
  const [questions, setQuestions] = useState<Question[]>(() =>
    buildQuestions(10),
  );
  const [disciplineState, setDisciplineState] = useState<
    Record<DisciplineKey, DisciplineState>
  >(() => buildDisciplineState(DEFAULT_COUNTS_FINAL));

  const [selectedCourseCode, setSelectedCourseCode] = useState(
    courses[0]?.code ?? "",
  );
  const selectedCourse = useMemo(
    () => courses.find((course) => course.code === selectedCourseCode) ?? null,
    [selectedCourseCode],
  );
  const [useEqualWeights, setUseEqualWeights] = useState(false);

  const isFreeMode = examMode === "free";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("ufsc-theme", theme);
  }, [theme]);

  useEffect(() => {
    const { body, documentElement } = document;
    if (setupOpen) {
      body.style.overflow = "hidden";
      documentElement.style.overflow = "hidden";
    } else {
      body.style.overflow = "";
      documentElement.style.overflow = "";
    }

    return () => {
      body.style.overflow = "";
      documentElement.style.overflow = "";
    };
  }, [setupOpen]);

  const totalDisciplineQuestions = useMemo(() => {
    return OBJECTIVE_DISCIPLINES.reduce((acc, discipline) => {
      return acc + disciplineState[discipline.key].questions.length;
    }, 0);
  }, [disciplineState]);

  const totalObjectiveQuestions = isFreeMode
    ? questions.length
    : totalDisciplineQuestions;

  const questionValue = useMemo(() => {
    if (!totalObjectiveQuestions) return 0;
    return objectiveTotal / totalObjectiveQuestions;
  }, [objectiveTotal, totalObjectiveQuestions]);

  const disciplineTotals = useMemo(() => {
    const totals = {} as Record<DisciplineKey, number>;

    OBJECTIVE_DISCIPLINES.forEach((discipline) => {
      const state = disciplineState[discipline.key];
      const total = state.directScoreEnabled
        ? Math.max(0, state.directScore)
        : state.questions.reduce((acc, question) => {
            return acc + computeQuestionScore(question, questionValue).score;
          }, 0);
      totals[discipline.key] = total;
    });

    totals.RDC = essayEnabled ? essayPoints : 0;
    totals.DSC = discursiveEnabled ? discursivePoints : 0;

    return totals;
  }, [
    disciplineState,
    questionValue,
    essayEnabled,
    essayPoints,
    discursiveEnabled,
    discursivePoints,
  ]);

  const summary: Summary = useMemo(() => {
    const discursiveScore = discursiveEnabled ? discursivePoints : 0;
    const essayScore = essayEnabled ? essayPoints : 0;

    if (isFreeMode) {
      const scores = questions.map((question) =>
        computeQuestionScore(question, questionValue),
      );
      const objectiveScore = scores.reduce((acc, item) => acc + item.score, 0);
      const total = objectiveScore + discursiveScore + essayScore;
      return { scores, objectiveScore, total };
    }

    const objectiveScore = OBJECTIVE_DISCIPLINES.reduce((acc, discipline) => {
      return acc + disciplineTotals[discipline.key];
    }, 0);
    const total = objectiveScore + discursiveScore + essayScore;
    return { scores: [], objectiveScore, total };
  }, [
    isFreeMode,
    questions,
    questionValue,
    disciplineTotals,
    discursiveEnabled,
    discursivePoints,
    essayEnabled,
    essayPoints,
  ]);

  const weightedTotal = useMemo(() => {
    if (!selectedCourse) return 0;
    return DISCIPLINES.reduce((acc, discipline) => {
      const weight = useEqualWeights
        ? 1
        : selectedCourse.weights[discipline.key];
      return acc + disciplineTotals[discipline.key] * weight;
    }, 0);
  }, [selectedCourse, disciplineTotals, useEqualWeights]);

  const targetStats = useMemo(
    () => getCourseScoreStats(selectedCourseCode),
    [selectedCourseCode],
  );

  const targetScore = useMemo(() => {
    if (targetMode === "custom") {
      return customTargetScore > 0 ? customTargetScore : null;
    }
    if (targetMode === "latest") return targetStats.latest;
    if (targetMode === "average") return targetStats.average;
    return targetStats.max;
  }, [targetMode, targetStats, customTargetScore]);

  const updateDiscipline = (
    key: DisciplineKey,
    updater: (state: DisciplineState) => DisciplineState,
  ) => {
    setDisciplineState((prev) => ({
      ...prev,
      [key]: updater(prev[key]),
    }));
  };

  const regenerateQuestions = (count = questionCount) => {
    const safeCount = Math.max(1, count);
    setQuestions(buildQuestions(safeCount));
  };

  const resetFreeAnswers = () => {
    setQuestions((prev) =>
      prev.map((question) => ({
        ...question,
        candidato: 0,
        directScoreEnabled: false,
        directScore: 0,
      })),
    );
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string,
  ) => {
    setQuestions((prev) => {
      const next = [...prev];
      const current = next[index];
      if (!current) return prev;
      if (field === "maxProp") {
        next[index] = {
          ...current,
          maxProp: parseMaxProp(value, current.maxProp),
        };
      } else if (field === "directScore") {
        next[index] = {
          ...current,
          directScore: clampFloat(value, current.directScore),
        };
      } else {
        next[index] = {
          ...current,
          [field]: clampInt(value, current[field] as number),
        };
      }
      return next;
    });
  };

  const toggleFreeQuestionDirectScore = (index: number, checked: boolean) => {
    setQuestions((prev) => {
      const next = [...prev];
      const current = next[index];
      if (!current) return prev;
      next[index] = {
        ...current,
        directScoreEnabled: checked,
      };
      return next;
    });
  };

  const toggleDisciplineOpen = (key: DisciplineKey) => {
    updateDiscipline(key, (state) => ({ ...state, open: !state.open }));
  };

  const updateDisciplineQuestionCount = (key: DisciplineKey, value: string) => {
    updateDiscipline(key, (state) => {
      const nextCount = clampInt(value, state.questionCount);
      const nextQuestions = Array.from({ length: nextCount }, (_, index) => {
        return state.questions[index] ?? createQuestion();
      });
      return {
        ...state,
        questionCount: nextCount,
        questions: nextQuestions,
      };
    });
  };

  const handleDisciplineQuestionChange = (
    key: DisciplineKey,
    index: number,
    field: keyof Question,
    value: string,
  ) => {
    updateDiscipline(key, (state) => {
      const nextQuestions = [...state.questions];
      const currentQuestion = nextQuestions[index];
      if (!currentQuestion) return state;
      if (field === "maxProp") {
        nextQuestions[index] = {
          ...currentQuestion,
          maxProp: parseMaxProp(value, currentQuestion.maxProp),
        };
      } else if (field === "directScore") {
        nextQuestions[index] = {
          ...currentQuestion,
          directScore: clampFloat(value, currentQuestion.directScore),
        };
      } else {
        nextQuestions[index] = {
          ...currentQuestion,
          [field]: clampInt(value, currentQuestion[field] as number),
        };
      }
      return {
        ...state,
        questions: nextQuestions,
      };
    });
  };

  const toggleQuestionDirectScore = (
    key: DisciplineKey,
    index: number,
    checked: boolean,
  ) => {
    updateDiscipline(key, (state) => {
      const nextQuestions = [...state.questions];
      const currentQuestion = nextQuestions[index];
      if (!currentQuestion) return state;
      nextQuestions[index] = {
        ...currentQuestion,
        directScoreEnabled: checked,
      };
      return {
        ...state,
        questions: nextQuestions,
      };
    });
  };

  const resetDisciplineAnswers = (key?: DisciplineKey) => {
    setDisciplineState((prev) => {
      const next = { ...prev };
      const keys = key ? [key] : OBJECTIVE_DISCIPLINES.map((item) => item.key);
      keys.forEach((disciplineKey) => {
        const current = next[disciplineKey];
        next[disciplineKey] = {
          ...current,
          directScoreEnabled: false,
          directScore: 0,
          questions: current.questions.map((question) => ({
            ...question,
            candidato: 0,
            directScoreEnabled: false,
            directScore: 0,
          })),
        };
      });
      return next;
    });
  };

  const handleResetAnswers = () => {
    if (isFreeMode) {
      resetFreeAnswers();
      return;
    }
    resetDisciplineAnswers();
  };

  const applySetup = () => {
    setExamMode(setupMode);

    if (setupMode === "final") {
      setDiscursiveEnabled(true);
      setEssayEnabled(true);
      setDiscursivePoints(SCORE_LIMIT);
      setEssayPoints(SCORE_LIMIT);
      setObjectiveTotal(80);
      setDisciplineState(buildDisciplineState(DEFAULT_COUNTS_FINAL));
    }

    if (setupMode === "mid") {
      setDiscursiveEnabled(false);
      setEssayEnabled(true);
      setDiscursivePoints(0);
      setEssayPoints(SCORE_LIMIT);
      setObjectiveTotal(40);
      setDisciplineState(buildDisciplineState(DEFAULT_COUNTS_MID));
    }

    if (setupMode === "free") {
      setDiscursiveEnabled(false);
      setEssayEnabled(false);
      setDiscursivePoints(0);
      setEssayPoints(0);
      setObjectiveTotal(80);
      setQuestionCount(freeQuestionCount);
      regenerateQuestions(freeQuestionCount);
      setDisciplineState(buildDisciplineState());
    }

    setSetupOpen(false);
  };

  return (
    <main className="app">
      <SetupOverlay
        open={setupOpen}
        setupMode={setupMode}
        freeQuestionCount={freeQuestionCount}
        onSetupModeChange={setSetupMode}
        onFreeQuestionCountChange={(value) =>
          setFreeQuestionCount(clampInt(value, freeQuestionCount))
        }
        onApply={applySetup}
      />

      <HeroSection
        theme={theme}
        targetMode={targetMode}
        targetScore={targetScore}
        summary={summary}
        customTargetScore={customTargetScore}
        onCustomTargetChange={(value) =>
          setCustomTargetScore(clampFloat(value, customTargetScore))
        }
        onTargetModeChange={setTargetMode}
        onToggleTheme={() =>
          setTheme((prev) => (prev === "dark" ? "light" : "dark"))
        }
      />

      <ControlsPanel
        isFreeMode={isFreeMode}
        questionCount={questionCount}
        totalObjectiveQuestions={totalObjectiveQuestions}
        objectiveTotal={objectiveTotal}
        discursivePoints={discursivePoints}
        essayPoints={essayPoints}
        discursiveEnabled={discursiveEnabled}
        essayEnabled={essayEnabled}
        onQuestionCountChange={(value) =>
          setQuestionCount(clampInt(value, questionCount))
        }
        onObjectiveTotalChange={(value) =>
          setObjectiveTotal(clampFloat(value, objectiveTotal))
        }
        onDiscursivePointsChange={(value) =>
          setDiscursivePoints(
            Math.min(SCORE_LIMIT, clampFloat(value, discursivePoints)),
          )
        }
        onEssayPointsChange={(value) =>
          setEssayPoints(Math.min(SCORE_LIMIT, clampFloat(value, essayPoints)))
        }
        onGenerateQuestions={() => regenerateQuestions()}
        onResetAnswers={handleResetAnswers}
        onOpenSetup={() => setSetupOpen(true)}
        onToggleDiscursive={(checked) => {
          setDiscursiveEnabled(checked);
          if (checked && discursivePoints === 0) {
            setDiscursivePoints(SCORE_LIMIT);
          }
        }}
        onToggleEssay={(checked) => {
          setEssayEnabled(checked);
          if (checked && essayPoints === 0) {
            setEssayPoints(SCORE_LIMIT);
          }
        }}
      />

      {!isFreeMode ? (
        <CoursePanel
          courses={courses}
          selectedCourse={selectedCourse}
          selectedCourseCode={selectedCourseCode}
          useEqualWeights={useEqualWeights}
          weightedTotal={weightedTotal}
          disciplineTotals={disciplineTotals}
          disciplineState={disciplineState}
          questionValue={questionValue}
          showCutoffs={examMode === "final"}
          onCourseChange={setSelectedCourseCode}
          onToggleEqualWeights={setUseEqualWeights}
          onToggleDisciplineOpen={toggleDisciplineOpen}
          onDisciplineQuestionCountChange={updateDisciplineQuestionCount}
          onResetDisciplineAnswers={resetDisciplineAnswers}
          onDisciplineDirectScoreChange={(key, value) =>
            updateDiscipline(key, (state) => ({
              ...state,
              directScore: clampFloat(value, state.directScore),
            }))
          }
          onToggleDisciplineDirectScore={(key, checked) =>
            updateDiscipline(key, (state) => ({
              ...state,
              directScoreEnabled: checked,
            }))
          }
          onDisciplineQuestionChange={handleDisciplineQuestionChange}
          onToggleQuestionDirectScore={toggleQuestionDirectScore}
        />
      ) : null}

      {isFreeMode ? (
        <FreeQuestions
          questions={questions}
          scores={summary.scores}
          onQuestionChange={handleQuestionChange}
          onToggleQuestionDirectScore={toggleFreeQuestionDirectScore}
        />
      ) : null}

      <FooterSection summary={summary} />
    </main>
  );
}

export default App;
