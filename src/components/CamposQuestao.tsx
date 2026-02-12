/**
 * Bloco reutilizável de campos de entrada de uma questão.
 * É usado tanto no modo livre quanto nas questões por disciplina.
 */
import { memo } from "react";
import type { Questao } from "../types/prova";
import { VALORES_MAX_PROPOSICAO } from "../types/prova";
import { exibirNumeroOuVazio } from "../utils/formatacao";

type PropriedadesCamposQuestao = {
  questao: Questao;
  onCampoQuestaoChange: (campo: keyof Questao, valor: string) => void;
  onNotaDiretaToggle: (ativo: boolean) => void;
};

const CamposQuestao = ({
  questao,
  onCampoQuestaoChange,
  onNotaDiretaToggle,
}: PropriedadesCamposQuestao) => {
  return (
    <div className="question-inputs">
      <label>
        Candidato (soma marcada)
        <input
          type="number"
          min={0}
          placeholder="Ex: 04"
          value={exibirNumeroOuVazio(questao.candidato)}
          onChange={(evento) =>
            onCampoQuestaoChange("candidato", evento.target.value)
          }
        />
      </label>

      <label>
        Gabarito (soma correta)
        <input
          type="number"
          min={0}
          placeholder="Ex: 03"
          value={exibirNumeroOuVazio(questao.gabarito)}
          onChange={(evento) =>
            onCampoQuestaoChange("gabarito", evento.target.value)
          }
        />
      </label>

      <label>
        Maior proposição
        <select
          value={String(questao.maximoProposicao)}
          onChange={(evento) =>
            onCampoQuestaoChange("maximoProposicao", evento.target.value)
          }
        >
          {VALORES_MAX_PROPOSICAO.map((valor) => (
            <option key={valor} value={valor}>
              {String(valor).padStart(2, "0")}
            </option>
          ))}
          <option value="aberta">Aberta</option>
        </select>
      </label>

      <label className="toggle small">
        <input
          type="checkbox"
          checked={questao.notaDiretaAtiva}
          onChange={(evento) => onNotaDiretaToggle(evento.target.checked)}
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
          value={exibirNumeroOuVazio(questao.notaDireta)}
          disabled={!questao.notaDiretaAtiva}
          onChange={(evento) =>
            onCampoQuestaoChange("notaDireta", evento.target.value)
          }
        />
      </label>
    </div>
  );
};

export default memo(
  CamposQuestao,
  (propriedadesAnteriores, proximasPropriedades) =>
    propriedadesAnteriores.questao === proximasPropriedades.questao,
);
