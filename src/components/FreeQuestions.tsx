import type { Question, QuestionScore } from "../types/exam";
import { MAX_PROP_VALUES } from "../types/exam";
import { formatScore } from "../utils/format";

type FreeQuestionsProps = {
  questions: Question[];
  scores: QuestionScore[];
  onQuestionChange: (
    index: number,
    field: keyof Question,
    value: string,
  ) => void;
  onToggleQuestionDirectScore: (index: number, checked: boolean) => void;
};

const FreeQuestions = ({
  questions,
  scores,
  onQuestionChange,
  onToggleQuestionDirectScore,
}: FreeQuestionsProps) => {
  const displayValue = (value: number) => (value === 0 ? "" : value);

  return (
    <section className="grid">
      {questions.map((question, index) => {
        const score = scores[index];
        const rawScore = score ? Math.max(0, score.raw) : 0;
        return (
          <article key={index} className="panel question-card">
            <header>
              <div>
                <p>Questão {String(index + 1).padStart(2, "0")}</p>
                <h3>{formatScore(rawScore)} pts</h3>
              </div>
              <span className="badge">{formatScore(rawScore)}</span>
            </header>
            <div className="question-inputs">
              <label>
                Gabarito (soma correta)
                <input
                  type="number"
                  min={0}
                  placeholder="Ex: 03"
                  value={displayValue(question.gabarito)}
                  onChange={(event) =>
                    onQuestionChange(index, "gabarito", event.target.value)
                  }
                />
              </label>
              <label>
                Candidato (soma marcada)
                <input
                  type="number"
                  min={0}
                  placeholder="Ex: 04"
                  value={displayValue(question.candidato)}
                  onChange={(event) =>
                    onQuestionChange(index, "candidato", event.target.value)
                  }
                />
              </label>
              <label>
                Maior proposição
                <select
                  value={String(question.maxProp)}
                  onChange={(event) =>
                    onQuestionChange(index, "maxProp", event.target.value)
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
                    onToggleQuestionDirectScore(index, event.target.checked)
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
                    onQuestionChange(index, "directScore", event.target.value)
                  }
                />
              </label>
            </div>
          </article>
        );
      })}
    </section>
  );
};

export default FreeQuestions;
