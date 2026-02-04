import type { Course, DisciplineKey } from "../data/courses";
import type { DisciplineState, Question } from "../types/exam";
import { MAX_PROP_VALUES } from "../types/exam";
import {
  OBJECTIVE_DISCIPLINES,
  SPECIAL_DISCIPLINES,
} from "../data/disciplines";
import { formatScore } from "../utils/format";
import { computeQuestionScore } from "../utils/scoring";

type CoursePanelProps = {
  courses: Course[];
  selectedCourse: Course | null;
  selectedCourseCode: string;
  useEqualWeights: boolean;
  weightedTotal: number;
  disciplineTotals: Record<DisciplineKey, number>;
  disciplineState: Record<DisciplineKey, DisciplineState>;
  questionValue: number;
  showCutoffs: boolean;
  onCourseChange: (value: string) => void;
  onToggleEqualWeights: (checked: boolean) => void;
  onToggleDisciplineOpen: (key: DisciplineKey) => void;
  onDisciplineQuestionCountChange: (key: DisciplineKey, value: string) => void;
  onResetDisciplineAnswers: (key: DisciplineKey) => void;
  onDisciplineDirectScoreChange: (key: DisciplineKey, value: string) => void;
  onToggleDisciplineDirectScore: (key: DisciplineKey, checked: boolean) => void;
  onDisciplineQuestionChange: (
    key: DisciplineKey,
    index: number,
    field: keyof Question,
    value: string,
  ) => void;
  onToggleQuestionDirectScore: (
    key: DisciplineKey,
    index: number,
    checked: boolean,
  ) => void;
};

const CoursePanel = ({
  courses,
  selectedCourse,
  selectedCourseCode,
  useEqualWeights,
  weightedTotal,
  disciplineTotals,
  disciplineState,
  questionValue,
  showCutoffs,
  onCourseChange,
  onToggleEqualWeights,
  onToggleDisciplineOpen,
  onDisciplineQuestionCountChange,
  onResetDisciplineAnswers,
  onDisciplineDirectScoreChange,
  onToggleDisciplineDirectScore,
  onDisciplineQuestionChange,
  onToggleQuestionDirectScore,
}: CoursePanelProps) => {
  const displayValue = (value: number) => (value === 0 ? "" : value);

  return (
    <section className="panel course-panel">
      <div className="course-header">
        <div>
          <h2>{showCutoffs ? "Pesos e pontos de corte" : "Pesos do curso"}</h2>
          <p>
            {showCutoffs
              ? "Escolha o curso para ver pesos, mínimos e a pontuação máxima do vestibular UFSC."
              : "Escolha o curso para ver pesos e a pontuação máxima do vestibular UFSC."}
          </p>
        </div>
        <div className="course-select">
          <label htmlFor="courseSelect">Curso</label>
          <select
            id="courseSelect"
            value={selectedCourseCode}
            onChange={(event) => onCourseChange(event.target.value)}
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
            onChange={(event) => onToggleEqualWeights(event.target.checked)}
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
            <strong>{useEqualWeights ? "Igual (1.0)" : "Tabela UFSC"}</strong>
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
              const belowCutoff = showCutoffs && score > 0 && score < cutoff;

              return (
                <div
                  key={discipline.key}
                  className={`discipline-card ${belowCutoff ? "alert" : ""}`}
                >
                  <button
                    className={`discipline-summary ${showCutoffs ? "" : "no-cutoff"}`}
                    type="button"
                    onClick={() => onToggleDisciplineOpen(discipline.key)}
                  >
                    <div>
                      <p className="course-label">{discipline.label}</p>
                      <span className="course-key">{discipline.key}</span>
                    </div>
                    <div className="discipline-meta">
                      <span>Peso</span>
                      <strong>{weight}</strong>
                    </div>
                    {showCutoffs ? (
                      <div className="discipline-meta">
                        <span>Min. (corte)</span>
                        <strong>{cutoff}</strong>
                      </div>
                    ) : null}
                    <div className="discipline-meta">
                      <span>Sua nota</span>
                      <strong>{formatScore(score)}</strong>
                    </div>
                    <span
                      className={`discipline-caret ${state.open ? "open" : ""}`}
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
                            placeholder="Ex: 12"
                            value={displayValue(state.questionCount)}
                            onChange={(event) =>
                              onDisciplineQuestionCountChange(
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
                            placeholder="Ex: 6.50"
                            value={displayValue(state.directScore)}
                            disabled={!state.directScoreEnabled}
                            onChange={(event) =>
                              onDisciplineDirectScoreChange(
                                discipline.key,
                                event.target.value,
                              )
                            }
                          />
                        </label>
                        <label className="toggle small">
                          <input
                            type="checkbox"
                            checked={state.directScoreEnabled}
                            onChange={(event) =>
                              onToggleDisciplineDirectScore(
                                discipline.key,
                                event.target.checked,
                              )
                            }
                          />
                          Usar nota direta
                        </label>
                        <button
                          className="ghost"
                          onClick={() =>
                            onResetDisciplineAnswers(discipline.key)
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
                            const rawScore = Math.max(0, questionScore.raw);
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
                                    <h4>{formatScore(rawScore)} pts</h4>
                                  </div>
                                  <span className="badge">
                                    {formatScore(rawScore)}
                                  </span>
                                </header>
                                <div className="question-inputs">
                                  <label>
                                    Candidato (soma marcada)
                                    <input
                                      type="number"
                                      min={0}
                                      placeholder="Ex: 04"
                                      value={displayValue(question.candidato)}
                                      onChange={(event) =>
                                        onDisciplineQuestionChange(
                                          discipline.key,
                                          index,
                                          "candidato",
                                          event.target.value,
                                        )
                                      }
                                    />
                                  </label>
                                  <label>
                                    Gabarito (soma correta)
                                    <input
                                      type="number"
                                      min={0}
                                      placeholder="Ex: 03"
                                      value={displayValue(question.gabarito)}
                                      onChange={(event) =>
                                        onDisciplineQuestionChange(
                                          discipline.key,
                                          index,
                                          "gabarito",
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
                                        onDisciplineQuestionChange(
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
                                        onToggleQuestionDirectScore(
                                          discipline.key,
                                          index,
                                          event.target.checked,
                                        )
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
                                      placeholder="Ex: 0.80"
                                      value={displayValue(question.directScore)}
                                      disabled={!question.directScoreEnabled}
                                      onChange={(event) =>
                                        onDisciplineQuestionChange(
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
              const belowCutoff = showCutoffs && score > 0 && score < cutoff;

              return (
                <div
                  key={discipline.key}
                  className={`discipline-static ${belowCutoff ? "alert" : ""} ${
                    showCutoffs ? "" : "no-cutoff"
                  }`}
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
                  {showCutoffs ? (
                    <div className="discipline-meta">
                      <span>Min. (corte)</span>
                      <strong>{cutoff}</strong>
                    </div>
                  ) : null}
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
        Abra cada disciplina para inserir o somatório das questões. O somatório
        ponderado multiplica cada nota pelo peso do curso. Se já tiver a nota
        pronta, use "nota direta". Em questões abertas, só pontua se candidato =
        gabarito.
      </p>
    </section>
  );
};

export default CoursePanel;
