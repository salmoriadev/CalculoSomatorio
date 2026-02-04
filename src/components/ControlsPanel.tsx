type ControlsPanelProps = {
  isFreeMode: boolean;
  questionCount: number;
  totalObjectiveQuestions: number;
  objectiveTotal: number;
  discursivePoints: number;
  essayPoints: number;
  discursiveEnabled: boolean;
  essayEnabled: boolean;
  onQuestionCountChange: (value: string) => void;
  onObjectiveTotalChange: (value: string) => void;
  onDiscursivePointsChange: (value: string) => void;
  onEssayPointsChange: (value: string) => void;
  onGenerateQuestions: () => void;
  onResetAnswers: () => void;
  onOpenSetup: () => void;
  onToggleDiscursive: (checked: boolean) => void;
  onToggleEssay: (checked: boolean) => void;
};

const ControlsPanel = ({
  isFreeMode,
  questionCount,
  totalObjectiveQuestions,
  objectiveTotal,
  discursivePoints,
  essayPoints,
  discursiveEnabled,
  essayEnabled,
  onQuestionCountChange,
  onObjectiveTotalChange,
  onDiscursivePointsChange,
  onEssayPointsChange,
  onGenerateQuestions,
  onResetAnswers,
  onOpenSetup,
  onToggleDiscursive,
  onToggleEssay,
}: ControlsPanelProps) => {
  const displayValue = (value: number) => (value === 0 ? "" : value);

  return (
    <section className="panel controls">
      <div className="control-group">
        <label htmlFor="questionCount">Total de questões objetivas</label>
        <input
          id="questionCount"
          type="number"
          min={0}
          placeholder="Ex: 60"
          value={
            isFreeMode
              ? displayValue(questionCount)
              : displayValue(totalObjectiveQuestions)
          }
          disabled={!isFreeMode}
          onChange={(event) => {
            if (!isFreeMode) return;
            onQuestionCountChange(event.target.value);
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
          placeholder="Ex: 80"
          value={displayValue(objectiveTotal)}
          onChange={(event) => onObjectiveTotalChange(event.target.value)}
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
          placeholder="Ex: 10"
          value={displayValue(discursiveEnabled ? discursivePoints : 0)}
          disabled={!discursiveEnabled}
          onChange={(event) => onDiscursivePointsChange(event.target.value)}
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
          placeholder="Ex: 10"
          value={displayValue(essayEnabled ? essayPoints : 0)}
          disabled={!essayEnabled}
          onChange={(event) => onEssayPointsChange(event.target.value)}
        />
        {!essayEnabled ? <span className="pill">Sem redação</span> : null}
      </div>
      <div className="control-actions">
        {isFreeMode ? (
          <button className="primary" onClick={onGenerateQuestions}>
            Gerar questões ({questionCount})
          </button>
        ) : null}
        <button className="ghost" onClick={onResetAnswers}>
          Zerar respostas
        </button>
        <button className="ghost" onClick={onOpenSetup}>
          Trocar modelo
        </button>
      </div>
      <label className="toggle">
        <input
          type="checkbox"
          checked={discursiveEnabled}
          onChange={(event) => onToggleDiscursive(event.target.checked)}
        />
        Incluir discursivas nesta simulação
      </label>
      <label className="toggle">
        <input
          type="checkbox"
          checked={essayEnabled}
          onChange={(event) => onToggleEssay(event.target.checked)}
        />
        Incluir redação nesta simulação
      </label>
      <p className="helper">
        Defina sua meta e acompanhe o total geral. Dica: marcar uma incorreta
        reduz a sua pontuação.
      </p>
    </section>
  );
};

export default ControlsPanel;
