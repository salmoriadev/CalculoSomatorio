import type { ExamMode } from "../types/exam";

type SetupOverlayProps = {
  open: boolean;
  setupMode: ExamMode;
  freeQuestionCount: number;
  onSetupModeChange: (mode: ExamMode) => void;
  onFreeQuestionCountChange: (value: string) => void;
  onApply: () => void;
};

const SetupOverlay = ({
  open,
  setupMode,
  freeQuestionCount,
  onSetupModeChange,
  onFreeQuestionCountChange,
  onApply,
}: SetupOverlayProps) => {
  if (!open) return null;

  return (
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
            className={`setup-option ${setupMode === "mid" ? "selected" : ""}`}
            onClick={() => onSetupModeChange("mid")}
            type="button"
          >
            <span>Prova de meio do ano</span>
            <strong>Sem discursivas</strong>
            <small>Redação ligada</small>
          </button>
          <button
            className={`setup-option ${setupMode === "final" ? "selected" : ""}`}
            onClick={() => onSetupModeChange("final")}
            type="button"
          >
            <span>Prova final do ano</span>
            <strong>Completa</strong>
            <small>Redação e discursivas ligadas</small>
          </button>
          <button
            className={`setup-option ${setupMode === "free" ? "selected" : ""}`}
            onClick={() => onSetupModeChange("free")}
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
              onChange={(event) => onFreeQuestionCountChange(event.target.value)}
            />
          </label>
        ) : null}

        <div className="setup-footer">
          <button className="primary" onClick={onApply} type="button">
            Começar simulação
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupOverlay;
