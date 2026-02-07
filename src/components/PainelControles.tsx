/**
 * Painel com controles gerais da simulação.
 * Permite configurar totais, redação/discursivas e ações rápidas.
 */
import { exibirNumeroOuVazio } from "../utils/formatacao";

type PropriedadesPainelControles = {
  modoLivreAtivo: boolean;
  quantidadeQuestoesLivre: number;
  totalQuestoesObjetivas: number;
  totalProvaObjetiva: number;
  pontosDiscursivas: number;
  pontosRedacao: number;
  discursivasAtivas: boolean;
  redacaoAtiva: boolean;
  onQuantidadeQuestoesLivreChange: (valor: string) => void;
  onTotalProvaObjetivaChange: (valor: string) => void;
  onPontosDiscursivasChange: (valor: string) => void;
  onPontosRedacaoChange: (valor: string) => void;
  onGerarQuestoes: () => void;
  onZerarRespostas: () => void;
  onAbrirConfiguracao: () => void;
  onDiscursivasToggle: (ativo: boolean) => void;
  onRedacaoToggle: (ativo: boolean) => void;
};

const PainelControles = ({
  modoLivreAtivo,
  quantidadeQuestoesLivre,
  totalQuestoesObjetivas,
  totalProvaObjetiva,
  pontosDiscursivas,
  pontosRedacao,
  discursivasAtivas,
  redacaoAtiva,
  onQuantidadeQuestoesLivreChange,
  onTotalProvaObjetivaChange,
  onPontosDiscursivasChange,
  onPontosRedacaoChange,
  onGerarQuestoes,
  onZerarRespostas,
  onAbrirConfiguracao,
  onDiscursivasToggle,
  onRedacaoToggle,
}: PropriedadesPainelControles) => {
  return (
    <section className="panel controls">
      <div className="control-group">
        <label htmlFor="quantidadeQuestoes">Total de questões objetivas</label>
        <input
          id="quantidadeQuestoes"
          type="number"
          min={0}
          placeholder="Ex: 60"
          value={
            modoLivreAtivo
              ? exibirNumeroOuVazio(quantidadeQuestoesLivre)
              : exibirNumeroOuVazio(totalQuestoesObjetivas)
          }
          disabled={!modoLivreAtivo}
          onChange={(evento) => {
            if (!modoLivreAtivo) return;
            onQuantidadeQuestoesLivreChange(evento.target.value);
          }}
        />
      </div>

      <div className="control-group">
        <label htmlFor="totalObjetivo">Total da prova objetiva</label>
        <input
          id="totalObjetivo"
          type="number"
          min={0}
          step={0.1}
          placeholder="Ex: 80"
          value={exibirNumeroOuVazio(totalProvaObjetiva)}
          onChange={(evento) => onTotalProvaObjetivaChange(evento.target.value)}
        />
      </div>

      <div className="control-group">
        <label htmlFor="pontosDiscursivas">Discursivas</label>
        <input
          id="pontosDiscursivas"
          type="number"
          min={0}
          max={10}
          step={0.1}
          placeholder="Ex: 10"
          value={exibirNumeroOuVazio(discursivasAtivas ? pontosDiscursivas : 0)}
          disabled={!discursivasAtivas}
          onChange={(evento) => onPontosDiscursivasChange(evento.target.value)}
        />
        {!discursivasAtivas ? (
          <span className="pill">Sem discursivas</span>
        ) : null}
      </div>

      <div className="control-group">
        <label htmlFor="pontosRedacao">Redação</label>
        <input
          id="pontosRedacao"
          type="number"
          min={0}
          max={10}
          step={0.1}
          placeholder="Ex: 10"
          value={exibirNumeroOuVazio(redacaoAtiva ? pontosRedacao : 0)}
          disabled={!redacaoAtiva}
          onChange={(evento) => onPontosRedacaoChange(evento.target.value)}
        />
        {!redacaoAtiva ? <span className="pill">Sem redação</span> : null}
      </div>

      <div className="control-actions">
        {modoLivreAtivo ? (
          <button className="primary" onClick={onGerarQuestoes}>
            Gerar questões ({quantidadeQuestoesLivre})
          </button>
        ) : null}

        <button className="ghost" onClick={onZerarRespostas}>
          Zerar respostas
        </button>

        <button className="ghost" onClick={onAbrirConfiguracao}>
          Trocar modelo
        </button>
      </div>

      <label className="toggle">
        <input
          type="checkbox"
          checked={discursivasAtivas}
          onChange={(evento) => onDiscursivasToggle(evento.target.checked)}
        />
        Incluir discursivas nesta simulação
      </label>

      <label className="toggle">
        <input
          type="checkbox"
          checked={redacaoAtiva}
          onChange={(evento) => onRedacaoToggle(evento.target.checked)}
        />
        Incluir redação nesta simulação
      </label>

      <p className="helper">
        Escolha a referência de meta no topo e acompanhe o total geral. Dica:
        marcar uma incorreta reduz a sua pontuação.
      </p>
    </section>
  );
};

export default PainelControles;
