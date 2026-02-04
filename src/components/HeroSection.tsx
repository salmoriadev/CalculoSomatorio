import type { Summary } from "../types/exam";
import { formatScore } from "../utils/format";

type HeroSectionProps = {
  targetScore: number;
  targetGap: number | null;
  summary: Summary;
  onTargetScoreChange: (value: string) => void;
};

const HeroSection = ({
  targetScore,
  targetGap,
  summary,
  onTargetScoreChange,
}: HeroSectionProps) => {
  const displayValue = (value: number) => (value === 0 ? "" : value);

  return (
    <header className="hero panel">
      <div>
        <p className="eyebrow">Calculadora de Somatório UFSC</p>
        <h1>Simule sua pontuação com precisão e estratégia.</h1>
        <p className="lead">
          Fórmula oficial aplicada por questão:
          <strong> P = (NP - (NTPC - (NPC - NPI))) / NP</strong>. Se o resultado
          for negativo, a questão vale zero.
        </p>
      </div>
      <div className="hero-metrics">
        <div className="metric-input">
          <span>Meta de aprovação (pontos)</span>
          <input
            type="number"
            min={0}
            step={0.1}
            placeholder="Ex: 120"
            value={displayValue(targetScore)}
            onChange={(event) => onTargetScoreChange(event.target.value)}
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
  );
};

export default HeroSection;
