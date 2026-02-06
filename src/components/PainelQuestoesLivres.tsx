/**
 * Painel do modo livre.
 * Renderiza a lista de questões independentes sem divisão por disciplina.
 */
import type { PontuacaoQuestao, Questao } from "../types/prova";
import { VALORES_MAX_PROPOSICAO } from "../types/prova";
import { formatarPontuacao } from "../utils/formatacao";

type PropriedadesPainelQuestoesLivres = {
  questoes: Questao[];
  pontuacoesQuestoes: PontuacaoQuestao[];
  onQuestaoChange: (
    indice: number,
    campo: keyof Questao,
    valor: string,
  ) => void;
  onNotaDiretaQuestaoToggle: (indice: number, ativo: boolean) => void;
};

const PainelQuestoesLivres = ({
  questoes,
  pontuacoesQuestoes,
  onQuestaoChange,
  onNotaDiretaQuestaoToggle,
}: PropriedadesPainelQuestoesLivres) => {
  const exibirValor = (valor: number) => (valor === 0 ? "" : valor);

  return (
    <section className="grid">
      {questoes.map((questao, indiceQuestao) => {
        const pontuacaoQuestao = pontuacoesQuestoes[indiceQuestao];
        const pontuacaoBruta = pontuacaoQuestao
          ? Math.max(0, pontuacaoQuestao.bruta)
          : 0;

        return (
          <article key={indiceQuestao} className="panel question-card">
            <header>
              <div>
                <p>Questão {String(indiceQuestao + 1).padStart(2, "0")}</p>
                <h3>{formatarPontuacao(pontuacaoBruta)} pts</h3>
              </div>
              <span className="badge">{formatarPontuacao(pontuacaoBruta)}</span>
            </header>

            <div className="question-inputs">
              <label>
                Candidato (soma marcada)
                <input
                  type="number"
                  min={0}
                  placeholder="Ex: 04"
                  value={exibirValor(questao.candidato)}
                  onChange={(evento) =>
                    onQuestaoChange(
                      indiceQuestao,
                      "candidato",
                      evento.target.value,
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
                  value={exibirValor(questao.gabarito)}
                  onChange={(evento) =>
                    onQuestaoChange(
                      indiceQuestao,
                      "gabarito",
                      evento.target.value,
                    )
                  }
                />
              </label>

              <label>
                Maior proposição
                <select
                  value={String(questao.maximoProposicao)}
                  onChange={(evento) =>
                    onQuestaoChange(
                      indiceQuestao,
                      "maximoProposicao",
                      evento.target.value,
                    )
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
                  onChange={(evento) =>
                    onNotaDiretaQuestaoToggle(
                      indiceQuestao,
                      evento.target.checked,
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
                  value={exibirValor(questao.notaDireta)}
                  disabled={!questao.notaDiretaAtiva}
                  onChange={(evento) =>
                    onQuestaoChange(
                      indiceQuestao,
                      "notaDireta",
                      evento.target.value,
                    )
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

export default PainelQuestoesLivres;
