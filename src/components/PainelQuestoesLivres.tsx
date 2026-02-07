/**
 * Painel do modo livre.
 * Renderiza a lista de questões independentes sem divisão por disciplina.
 */
import type { PontuacaoQuestao, Questao } from "../types/prova";
import { formatarPontuacao } from "../utils/formatacao";
import CamposQuestao from "./CamposQuestao";

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

            <CamposQuestao
              questao={questao}
              onCampoQuestaoChange={(campo, valor) =>
                onQuestaoChange(indiceQuestao, campo, valor)
              }
              onNotaDiretaToggle={(ativo) =>
                onNotaDiretaQuestaoToggle(indiceQuestao, ativo)
              }
            />
          </article>
        );
      })}
    </section>
  );
};

export default PainelQuestoesLivres;
