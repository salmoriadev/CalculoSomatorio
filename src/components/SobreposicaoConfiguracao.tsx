/**
 * Sobreposição inicial de configuração do cenário de prova.
 * Define o modo (final, meio ou livre) antes de iniciar a simulação.
 */
import type { ModoProva } from "../types/prova";

type PropriedadesSobreposicaoConfiguracao = {
  aberta: boolean;
  modoSelecionado: ModoProva;
  quantidadeQuestoesLivre: number;
  onModoSelecionadoChange: (modo: ModoProva) => void;
  onQuantidadeQuestoesLivreChange: (valor: string) => void;
  onAplicar: () => void;
};

const SobreposicaoConfiguracao = ({
  aberta,
  modoSelecionado,
  quantidadeQuestoesLivre,
  onModoSelecionadoChange,
  onQuantidadeQuestoesLivreChange,
  onAplicar,
}: PropriedadesSobreposicaoConfiguracao) => {
  if (!aberta) return null;

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
            className={`setup-option ${modoSelecionado === "meio" ? "selected" : ""}`}
            onClick={() => onModoSelecionadoChange("meio")}
            type="button"
          >
            <span>Prova de meio do ano</span>
            <strong>Sem discursivas</strong>
            <small>Redação ligada</small>
          </button>

          <button
            className={`setup-option ${modoSelecionado === "final" ? "selected" : ""}`}
            onClick={() => onModoSelecionadoChange("final")}
            type="button"
          >
            <span>Prova final do ano</span>
            <strong>Completa</strong>
            <small>Redação e discursivas ligadas</small>
          </button>

          <button
            className={`setup-option ${modoSelecionado === "livre" ? "selected" : ""}`}
            onClick={() => onModoSelecionadoChange("livre")}
            type="button"
          >
            <span>Livre escolha</span>
            <strong>Do seu jeito</strong>
            <small>Sem redação e discursivas</small>
          </button>
        </div>

        {modoSelecionado === "livre" ? (
          <label className="setup-input">
            Quantas questões você quer usar?
            <input
              type="number"
              min={1}
              value={quantidadeQuestoesLivre}
              onChange={(evento) =>
                onQuantidadeQuestoesLivreChange(evento.target.value)
              }
            />
          </label>
        ) : null}

        <div className="setup-footer">
          <button className="primary" onClick={onAplicar} type="button">
            Começar simulação
          </button>
        </div>
      </div>
    </div>
  );
};

export default SobreposicaoConfiguracao;
