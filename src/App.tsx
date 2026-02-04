import { useMemo, useState } from "react";
import courses from "./data/courses";
import type { DisciplineKey } from "./data/courses";
import "./App.css";

const MAX_PROP_VALUES = [1, 2, 4, 8, 16, 32, 64] as const;
type MaxPropNumber = (typeof MAX_PROP_VALUES)[number];
type MaxProp = MaxPropNumber | "aberta";

type Question = {
  gabarito: number;
  candidato: number;
  maxProp: MaxProp;
  directScoreEnabled: boolean;
  directScore: number;
};

type ExamMode = "mid" | "final" | "free";

type DisciplineMeta = {
  key: DisciplineKey;
  label: string;
};

type DisciplineState = {
  open: boolean;
  questionCount: number;
  questions: Question[];
  directScoreEnabled: boolean;
  directScore: number;
};

const DISCIPLINES: DisciplineMeta[] = [
  { key: "PLI", label: "Primeira língua (Português/Libras)" },
  { key: "SLI", label: "Segunda língua" },
  { key: "MTM", label: "Matemática" },
  { key: "BLG", label: "Biologia" },
  { key: "QMC", label: "Química" },
  { key: "FSC", label: "Física" },
  { key: "CHS", label: "Ciências Humanas e Sociais" },
  { key: "RDC", label: "Redação" },
  { key: "DSC", label: "Questões Discursivas" },
];

const OBJECTIVE_DISCIPLINES = DISCIPLINES.filter(
  (discipline) => discipline.key !== "RDC" && discipline.key !== "DSC",
);

const SPECIAL_DISCIPLINES = DISCIPLINES.filter(
  (discipline) => discipline.key === "RDC" || discipline.key === "DSC",
);

const DEFAULT_COUNTS_FINAL: Partial<Record<DisciplineKey, number>> = {
  PLI: 12,
  SLI: 8,
  MTM: 10,
  BLG: 10,
  CHS: 20,
  FSC: 10,
  QMC: 10,
};

const DEFAULT_COUNTS_MID: Partial<Record<DisciplineKey, number>> = {
  PLI: 6,
  SLI: 4,
  MTM: 5,
  BLG: 5,
  CHS: 10,
  FSC: 5,
  QMC: 5,
};

const createQuestion = (): Question => ({
  gabarito: 0,
  candidato: 0,
  maxProp: 16,
  directScoreEnabled: false,
  directScore: 0,
});

const buildQuestions = (count: number): Question[] =>
  Array.from({ length: count }, () => createQuestion());

const buildDisciplineState = (
  counts: Partial<Record<DisciplineKey, number>> = {},
): Record<DisciplineKey, DisciplineState> => {
  return DISCIPLINES.reduce(
    (acc, discipline) => {
      const count = counts[discipline.key] ?? 0;
      acc[discipline.key] = {
        open: false,
        questionCount: count,
        questions: buildQuestions(count),
        directScoreEnabled: false,
        directScore: 0,
      };
      return acc;
    },
    {} as Record<DisciplineKey, DisciplineState>,
  );
};

const clampInt = (value: string, fallback: number) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
};

const clampFloat = (value: string, fallback: number) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(0, parsed);
};

const parseMaxProp = (value: string, fallback: MaxProp): MaxProp => {
  if (value === "aberta") return "aberta";
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return MAX_PROP_VALUES.includes(parsed as MaxPropNumber)
    ? (parsed as MaxPropNumber)
    : fallback;
};

const formatScore = (value: number) => value.toFixed(2);

const computeQuestionScore = (question: Question, questionValue: number) => {
  if (question.directScoreEnabled) {
    const limit = questionValue > 0 ? questionValue : 0;
    const score = Math.max(0, Math.min(question.directScore, limit));
    const raw = questionValue > 0 ? score / questionValue : 0;
    return { raw, score };
  }

  if (question.maxProp === "aberta") {
    const raw = question.gabarito === question.candidato ? 1 : 0;
    return { raw, score: raw * questionValue };
  }

  const maxProp = question.maxProp;
  const props = MAX_PROP_VALUES.filter((value) => value <= maxProp);
  const mask = props.reduce((acc, value) => acc | value, 0);
  const gabarito = question.gabarito & mask;
  const candidato = question.candidato & mask;
  const ntpc = props.reduce(
    (acc, value) => acc + ((gabarito & value) > 0 ? 1 : 0),
    0,
  );
  if (ntpc === 0) return { raw: 0, score: 0 };
  const npc = props.reduce(
    (acc, value) => acc + ((gabarito & candidato & value) > 0 ? 1 : 0),
    0,
  );
  const npi = props.reduce(
    (acc, value) =>
      acc + ((candidato & value) > 0 && (gabarito & value) === 0 ? 1 : 0),
    0,
  );
  const np = props.length;
  const raw = (np - (ntpc - (npc - npi))) / np;
  const normalized = Math.max(0, Math.min(1, raw));
  return { raw: normalized, score: normalized * questionValue };
};

function App() {
  const [setupOpen, setSetupOpen] = useState(true);
  const [setupMode, setSetupMode] = useState<ExamMode>("final");
  const [examMode, setExamMode] = useState<ExamMode>("final");
  const [freeQuestionCount, setFreeQuestionCount] = useState(10);
  const [questionCount, setQuestionCount] = useState(10);
  const [objectiveTotal, setObjectiveTotal] = useState(80);
  const [targetScore, setTargetScore] = useState(0);
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

  const summary = useMemo(() => {
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

  const targetGap = useMemo(() => {
    if (targetScore <= 0) return null;
    const diff = targetScore - summary.total;
    return diff > 0 ? diff : 0;
  }, [targetScore, summary.total]);

  const weightedTotal = useMemo(() => {
    if (!selectedCourse) return 0;
    return DISCIPLINES.reduce((acc, discipline) => {
      const weight = useEqualWeights
        ? 1
        : selectedCourse.weights[discipline.key];
      return acc + disciplineTotals[discipline.key] * weight;
    }, 0);
  }, [selectedCourse, disciplineTotals, useEqualWeights]);

  const regenerateQuestions = (count = questionCount) => {
    const safeCount = Math.max(1, count);
    setQuestions(buildQuestions(safeCount));
  };

  const resetFreeAnswers = () => {
    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
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

  const toggleDisciplineOpen = (key: DisciplineKey) => {
    setDisciplineState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        open: !prev[key].open,
      },
    }));
  };

  const updateDisciplineQuestionCount = (key: DisciplineKey, value: string) => {
    setDisciplineState((prev) => {
      const current = prev[key];
      const nextCount = clampInt(value, current.questionCount);
      const nextQuestions = Array.from({ length: nextCount }, (_, index) => {
        return current.questions[index] ?? createQuestion();
      });
      return {
        ...prev,
        [key]: {
          ...current,
          questionCount: nextCount,
          questions: nextQuestions,
        },
      };
    });
  };

  const handleDisciplineQuestionChange = (
    key: DisciplineKey,
    index: number,
    field: keyof Question,
    value: string,
  ) => {
    setDisciplineState((prev) => {
      const current = prev[key];
      const nextQuestions = [...current.questions];
      const currentQuestion = nextQuestions[index];
      if (!currentQuestion) return prev;
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
        ...prev,
        [key]: {
          ...current,
          questions: nextQuestions,
        },
      };
    });
  };

  const resetDisciplineAnswers = (key?: DisciplineKey) => {
    setDisciplineState((prev) => {
      const next = { ...prev };
      const keys = key ? [key] : OBJECTIVE_DISCIPLINES.map((d) => d.key);
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

  const applySetup = () => {
    setExamMode(setupMode);

    if (setupMode === "final") {
      setDiscursiveEnabled(true);
      setEssayEnabled(true);
      setDiscursivePoints(10);
      setEssayPoints(10);
      setObjectiveTotal(80);
      setDisciplineState(buildDisciplineState(DEFAULT_COUNTS_FINAL));
    }

    if (setupMode === "mid") {
      setDiscursiveEnabled(false);
      setEssayEnabled(true);
      setDiscursivePoints(0);
      setEssayPoints(10);
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

  const handleResetAnswers = () => {
    if (isFreeMode) {
      resetFreeAnswers();
      return;
    }
    resetDisciplineAnswers();
  };

  const showEssayToggle = true;
  const showDiscursiveToggle = true;

  return (
    <div className="app">
      {setupOpen ? (
        <div className="setup-overlay">
          <div className="panel setup-card">
            <p className="eyebrow">Comece por aqui</p>
            <h1>Qual modelo de prova você quer simular?</h1>
            <p className="lead">
              Escolha o tipo de prova UFSC. Na opção livre você define quantas
              questões deseja analisar.
            </p>

            <div className="setup-grid">
              <button
                className={`setup-option ${
                  setupMode === "mid" ? "selected" : ""
                }`}
                onClick={() => setSetupMode("mid")}
                type="button"
              >
                <span>Prova de meio do ano</span>
                <strong>Sem discursivas</strong>
                <small>Redação ligada</small>
              </button>
              <button
                className={`setup-option ${
                  setupMode === "final" ? "selected" : ""
                }`}
                onClick={() => setSetupMode("final")}
                type="button"
              >
                <span>Prova final do ano</span>
                <strong>Completa</strong>
                <small>Redação e discursivas ligadas</small>
              </button>
              <button
                className={`setup-option ${
                  setupMode === "free" ? "selected" : ""
                }`}
                onClick={() => setSetupMode("free")}
                type="button"
              >
                <span>Livre escolha</span>
                <strong>Do seu jeito</strong>
                <small>Sem redação e discursivas</small>
              </button>
            </div>

            {setupMode === "free" ? (
              <label className="setup-input">
                Quantas questões você quer usar?
                <input
                  type="number"
                  min={1}
                  value={freeQuestionCount}
                  onChange={(event) =>
                    setFreeQuestionCount(
                      clampInt(event.target.value, freeQuestionCount),
                    )
                  }
                />
              </label>
            ) : null}

            <div className="setup-footer">
              <button className="primary" onClick={applySetup} type="button">
                Começar simulação
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <header className="hero panel">
        <div>
          <p className="eyebrow">Calculadora de Somatório UFSC</p>
          <h1>Simule sua pontuação com precisão e estratégia.</h1>
          <p className="lead">
            Fórmula oficial aplicada por questão:
            <strong> P = (NP - (NTPC - (NPC - NPI))) / NP</strong>. Se o
            resultado for negativo, a questão vale zero.
          </p>
        </div>
        <div className="hero-metrics">
          <div className="metric-input">
            <span>Meta de aprovação (pontos)</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={targetScore}
              onChange={(event) =>
                setTargetScore(clampFloat(event.target.value, targetScore))
              }
            />
            {targetScore > 0 ? (
              <small>
                {targetGap === 0
                  ? "Meta atingida"
                  : `Faltam ${formatScore(targetGap ?? 0)} pontos`}
              </small>
            ) : (
              <small>Defina sua meta para o curso.</small>
            )}
          </div>
          <div>
            <span>Total objetivo</span>
            <strong>{formatScore(summary.objectiveScore)}</strong>
          </div>
          <div>
            <span>Total geral</span>
            <strong>{formatScore(summary.total)}</strong>
          </div>
        </div>
      </header>

      <section className="panel controls">
        <div className="control-group">
          <label htmlFor="questionCount">Total de questões objetivas</label>
          <input
            id="questionCount"
            type="number"
            min={0}
            value={isFreeMode ? questionCount : totalObjectiveQuestions}
            disabled={!isFreeMode}
            onChange={(event) => {
              if (!isFreeMode) return;
              setQuestionCount(clampInt(event.target.value, questionCount));
            }}
          />
        </div>
        <div className="control-group">
          <label htmlFor="objectiveTotal">Total da prova objetiva</label>
          <input
            id="objectiveTotal"
            type="number"
            min={0}
            step={0.1}
            value={objectiveTotal}
            onChange={(event) =>
              setObjectiveTotal(clampFloat(event.target.value, objectiveTotal))
            }
          />
        </div>
        <div className="control-group">
          <label htmlFor="discursivePoints">Discursivas</label>
          <input
            id="discursivePoints"
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={discursiveEnabled ? discursivePoints : 0}
            disabled={!discursiveEnabled}
            onChange={(event) =>
              setDiscursivePoints(
                Math.min(10, clampFloat(event.target.value, discursivePoints)),
              )
            }
          />
          {!discursiveEnabled ? (
            <span className="pill">Sem discursivas</span>
          ) : null}
        </div>
        <div className="control-group">
          <label htmlFor="essayPoints">Redação</label>
          <input
            id="essayPoints"
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={essayEnabled ? essayPoints : 0}
            disabled={!essayEnabled}
            onChange={(event) =>
              setEssayPoints(
                Math.min(10, clampFloat(event.target.value, essayPoints)),
              )
            }
          />
          {!essayEnabled ? <span className="pill">Sem redação</span> : null}
        </div>
        <div className="control-actions">
          {isFreeMode ? (
            <button className="primary" onClick={() => regenerateQuestions()}>
              Gerar questões ({questionCount})
            </button>
          ) : null}
          <button className="ghost" onClick={handleResetAnswers}>
            Zerar respostas
          </button>
          <button className="ghost" onClick={() => setSetupOpen(true)}>
            Trocar modelo
          </button>
        </div>
        {showDiscursiveToggle ? (
          <label className="toggle">
            <input
              type="checkbox"
              checked={discursiveEnabled}
              onChange={(event) => {
                const checked = event.target.checked;
                setDiscursiveEnabled(checked);
                if (checked && discursivePoints === 0) {
                  setDiscursivePoints(10);
                }
              }}
            />
            Incluir discursivas nesta simulação
          </label>
        ) : null}
        {showEssayToggle ? (
          <label className="toggle">
            <input
              type="checkbox"
              checked={essayEnabled}
              onChange={(event) => {
                const checked = event.target.checked;
                setEssayEnabled(checked);
                if (checked && essayPoints === 0) {
                  setEssayPoints(10);
                }
              }}
            />
            Incluir redação nesta simulação
          </label>
        ) : null}
        <p className="helper">
          Defina sua meta e acompanhe o total geral. Dica: marcar uma incorreta
          reduz a sua pontuação.
        </p>
      </section>

      {!isFreeMode ? (
        <section className="panel course-panel">
          <div className="course-header">
            <div>
              <h2>Pesos e pontos de corte</h2>
              <p>
                Escolha o curso para ver pesos, mínimos e a pontuação máxima do
                vestibular UFSC.
              </p>
            </div>
            <div className="course-select">
              <label htmlFor="courseSelect">Curso</label>
              <select
                id="courseSelect"
                value={selectedCourseCode}
                onChange={(event) => setSelectedCourseCode(event.target.value)}
              >
                {courses.map((course) => (
                  <option key={course.code} value={course.code}>
                    {course.name} - {course.campus} ({course.code})
                  </option>
                ))}
              </select>
            </div>
            <label className="toggle course-toggle">
              <input
                type="checkbox"
                checked={useEqualWeights}
                onChange={(event) => setUseEqualWeights(event.target.checked)}
              />
              Usar pesos iguais (1.0)
            </label>
          </div>

          {selectedCourse ? (
            <div className="course-meta">
              <div>
                <span>Campus</span>
                <strong>{selectedCourse.campus}</strong>
              </div>
              <div>
                <span>Pontuação máxima (PMC)</span>
                <strong>{formatScore(selectedCourse.pmc)}</strong>
              </div>
              <div>
                <span>Somatório ponderado</span>
                <strong>{formatScore(weightedTotal)}</strong>
              </div>
              <div>
                <span>Modo de peso</span>
                <strong>
                  {useEqualWeights ? "Igual (1.0)" : "Tabela UFSC"}
                </strong>
              </div>
            </div>
          ) : null}

          <div className="course-grid">
            {selectedCourse
              ? OBJECTIVE_DISCIPLINES.map((discipline) => {
                  const state = disciplineState[discipline.key];
                  const weight = useEqualWeights
                    ? 1
                    : selectedCourse.weights[discipline.key];
                  const cutoff = selectedCourse.cutoffs[discipline.key];
                  const score = disciplineTotals[discipline.key];
                  const belowCutoff = score > 0 && score < cutoff;
                  return (
                    <div
                      key={discipline.key}
                      className={`discipline-card ${belowCutoff ? "alert" : ""}`}
                    >
                      <button
                        className="discipline-summary"
                        type="button"
                        onClick={() => toggleDisciplineOpen(discipline.key)}
                      >
                        <div>
                          <p className="course-label">{discipline.label}</p>
                          <span className="course-key">{discipline.key}</span>
                        </div>
                        <div className="discipline-meta">
                          <span>Peso</span>
                          <strong>{weight}</strong>
                        </div>
                        <div className="discipline-meta">
                          <span>Min. (corte)</span>
                          <strong>{cutoff}</strong>
                        </div>
                        <div className="discipline-meta">
                          <span>Sua nota</span>
                          <strong>{formatScore(score)}</strong>
                        </div>
                        <span
                          className={`discipline-caret ${
                            state.open ? "open" : ""
                          }`}
                          aria-hidden
                        />
                      </button>

                      {state.open ? (
                        <div className="discipline-body">
                          <div className="discipline-controls">
                            <label>
                              Quantidade de questões
                              <input
                                type="number"
                                min={0}
                                value={state.questionCount}
                                onChange={(event) =>
                                  updateDisciplineQuestionCount(
                                    discipline.key,
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <label>
                              Nota direta da disciplina
                              <input
                                type="number"
                                min={0}
                                step={0.1}
                                value={state.directScore}
                                disabled={!state.directScoreEnabled}
                                onChange={(event) =>
                                  setDisciplineState((prev) => ({
                                    ...prev,
                                    [discipline.key]: {
                                      ...prev[discipline.key],
                                      directScore: clampFloat(
                                        event.target.value,
                                        prev[discipline.key].directScore,
                                      ),
                                    },
                                  }))
                                }
                              />
                            </label>
                            <label className="toggle small">
                              <input
                                type="checkbox"
                                checked={state.directScoreEnabled}
                                onChange={(event) =>
                                  setDisciplineState((prev) => ({
                                    ...prev,
                                    [discipline.key]: {
                                      ...prev[discipline.key],
                                      directScoreEnabled: event.target.checked,
                                    },
                                  }))
                                }
                              />
                              Usar nota direta
                            </label>
                            <button
                              className="ghost"
                              onClick={() =>
                                resetDisciplineAnswers(discipline.key)
                              }
                              type="button"
                            >
                              Zerar respostas
                            </button>
                          </div>

                          {state.questions.length === 0 ? (
                            <p className="helper">
                              Defina a quantidade de questões para calcular a
                              pontuação desta disciplina.
                            </p>
                          ) : (
                            <div className="discipline-questions">
                              {state.questions.map((question, index) => {
                                const questionScore = computeQuestionScore(
                                  question,
                                  questionValue,
                                );
                                return (
                                  <div
                                    key={`${discipline.key}-${index}`}
                                    className="discipline-question"
                                  >
                                    <header>
                                      <div>
                                        <p>
                                          Questão{" "}
                                          {String(index + 1).padStart(2, "0")}
                                        </p>
                                        <h4>
                                          {formatScore(questionScore.score)} pts
                                        </h4>
                                      </div>
                                      <span className="badge">
                                        {formatScore(
                                          Math.max(0, questionScore.raw),
                                        )}
                                      </span>
                                    </header>
                                    <div className="question-inputs">
                                      <label>
                                        Gabarito (soma correta)
                                        <input
                                          type="number"
                                          min={0}
                                          value={question.gabarito}
                                          onChange={(event) =>
                                            handleDisciplineQuestionChange(
                                              discipline.key,
                                              index,
                                              "gabarito",
                                              event.target.value,
                                            )
                                          }
                                        />
                                      </label>
                                      <label>
                                        Candidato (soma marcada)
                                        <input
                                          type="number"
                                          min={0}
                                          value={question.candidato}
                                          onChange={(event) =>
                                            handleDisciplineQuestionChange(
                                              discipline.key,
                                              index,
                                              "candidato",
                                              event.target.value,
                                            )
                                          }
                                        />
                                      </label>
                                      <label>
                                        Maior proposição
                                        <select
                                          value={String(question.maxProp)}
                                          onChange={(event) =>
                                            handleDisciplineQuestionChange(
                                              discipline.key,
                                              index,
                                              "maxProp",
                                              event.target.value,
                                            )
                                          }
                                        >
                                          {MAX_PROP_VALUES.map((value) => (
                                            <option key={value} value={value}>
                                              {String(value).padStart(2, "0")}
                                            </option>
                                          ))}
                                          <option value="aberta">Aberta</option>
                                        </select>
                                      </label>
                                      <label className="toggle small">
                                        <input
                                          type="checkbox"
                                          checked={question.directScoreEnabled}
                                          onChange={(event) =>
                                            setDisciplineState((prev) => {
                                              const current =
                                                prev[discipline.key];
                                              const nextQuestions = [
                                                ...current.questions,
                                              ];
                                              const target =
                                                nextQuestions[index];
                                              if (!target) return prev;
                                              nextQuestions[index] = {
                                                ...target,
                                                directScoreEnabled:
                                                  event.target.checked,
                                              };
                                              return {
                                                ...prev,
                                                [discipline.key]: {
                                                  ...current,
                                                  questions: nextQuestions,
                                                },
                                              };
                                            })
                                          }
                                        />
                                        Usar nota direta
                                      </label>
                                      <label>
                                        Nota da questão (pts)
                                        <input
                                          type="number"
                                          min={0}
                                          step={0.1}
                                          value={question.directScore}
                                          disabled={
                                            !question.directScoreEnabled
                                          }
                                          onChange={(event) =>
                                            handleDisciplineQuestionChange(
                                              discipline.key,
                                              index,
                                              "directScore",
                                              event.target.value,
                                            )
                                          }
                                        />
                                      </label>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              : null}

            {selectedCourse
              ? SPECIAL_DISCIPLINES.map((discipline) => {
                  const weight = useEqualWeights
                    ? 1
                    : selectedCourse.weights[discipline.key];
                  const cutoff = selectedCourse.cutoffs[discipline.key];
                  const score = disciplineTotals[discipline.key];
                  const belowCutoff = score > 0 && score < cutoff;
                  return (
                    <div
                      key={discipline.key}
                      className={`discipline-static ${belowCutoff ? "alert" : ""}`}
                    >
                      <div>
                        <p className="course-label">{discipline.label}</p>
                        <span className="course-key">{discipline.key}</span>
                        <span className="discipline-note">
                          {discipline.key === "RDC"
                            ? "Usa o campo de redação acima"
                            : "Usa o campo de discursivas acima"}
                        </span>
                      </div>
                      <div className="discipline-meta">
                        <span>Peso</span>
                        <strong>{weight}</strong>
                      </div>
                      <div className="discipline-meta">
                        <span>Min. (corte)</span>
                        <strong>{cutoff}</strong>
                      </div>
                      <div className="discipline-meta">
                        <span>Sua nota</span>
                        <strong>{formatScore(score)}</strong>
                      </div>
                    </div>
                  );
                })
              : null}
          </div>
          <p className="helper">
            Abra cada disciplina para inserir o somatório das questões. O
            somatório ponderado multiplica cada nota pelo peso do curso. Se já
            tiver a nota pronta, use \"nota direta\". Em questões abertas, só
            pontua se candidato = gabarito.
          </p>
        </section>
      ) : null}

      {isFreeMode ? (
        <section className="grid">
          {questions.map((question, index) => {
            const score = summary.scores[index];
            return (
              <article key={index} className="panel question-card">
                <header>
                  <div>
                    <p>Questão {String(index + 1).padStart(2, "0")}</p>
                    <h3>{score ? formatScore(score.score) : "0.00"} pts</h3>
                  </div>
                  <span className="badge">
                    {score ? formatScore(Math.max(0, score.raw)) : "0.00"}
                  </span>
                </header>
                <div className="question-inputs">
                  <label>
                    Gabarito (soma correta)
                    <input
                      type="number"
                      min={0}
                      value={question.gabarito}
                      onChange={(event) =>
                        handleQuestionChange(
                          index,
                          "gabarito",
                          event.target.value,
                        )
                      }
                    />
                  </label>
                  <label>
                    Candidato (soma marcada)
                    <input
                      type="number"
                      min={0}
                      value={question.candidato}
                      onChange={(event) =>
                        handleQuestionChange(
                          index,
                          "candidato",
                          event.target.value,
                        )
                      }
                    />
                  </label>
                  <label>
                    Maior proposição
                    <select
                      value={String(question.maxProp)}
                      onChange={(event) =>
                        handleQuestionChange(
                          index,
                          "maxProp",
                          event.target.value,
                        )
                      }
                    >
                      {MAX_PROP_VALUES.map((value) => (
                        <option key={value} value={value}>
                          {String(value).padStart(2, "0")}
                        </option>
                      ))}
                      <option value="aberta">Aberta</option>
                    </select>
                  </label>
                  <label className="toggle small">
                    <input
                      type="checkbox"
                      checked={question.directScoreEnabled}
                      onChange={(event) =>
                        setQuestions((prev) => {
                          const next = [...prev];
                          const current = next[index];
                          if (!current) return prev;
                          next[index] = {
                            ...current,
                            directScoreEnabled: event.target.checked,
                          };
                          return next;
                        })
                      }
                    />
                    Usar nota direta
                  </label>
                  <label>
                    Nota da questão (pts)
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={question.directScore}
                      disabled={!question.directScoreEnabled}
                      onChange={(event) =>
                        handleQuestionChange(
                          index,
                          "directScore",
                          event.target.value,
                        )
                      }
                    />
                  </label>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      <footer className="panel footer">
        <div>
          <h2>Resumo final</h2>
          <p>
            Resultado objetivo:{" "}
            <strong>{formatScore(summary.objectiveScore)}</strong> pontos. Total
            geral: <strong>{formatScore(summary.total)}</strong> pontos.
          </p>
        </div>
        <div className="footer-tip">
          <span>Fórmula oficial</span>
          <strong>P = (NP - (NTPC - (NPC - NPI))) / NP</strong>
        </div>
      </footer>
    </div>
  );
}

export default App;
