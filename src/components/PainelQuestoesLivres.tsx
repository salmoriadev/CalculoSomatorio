/**
 * Painel do modo livre.
 * Renderiza a lista de questões independentes sem divisão por disciplina.
 */
import { memo, useCallback } from "react";
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

type PropriedadesCartaoQuestaoLivre = {
  indiceQuestao: number;
  questao: Questao;
  pontuacaoQuestao: PontuacaoQuestao | undefined;
  onQuestaoChange: (
    indice: number,
    campo: keyof Questao,
    valor: string,
  ) => void;
  onNotaDiretaQuestaoToggle: (indice: number, ativo: boolean) => void;
};

const CartaoQuestaoLivre = memo(
  ({
    indiceQuestao,
    questao,
    pontuacaoQuestao,
    onQuestaoChange,
    onNotaDiretaQuestaoToggle,
  }: PropriedadesCartaoQuestaoLivre) => {
    const pontuacaoBruta = pontuacaoQuestao
      ? Math.max(0, pontuacaoQuestao.bruta)
      : 0;

    const lidarCampoQuestaoChange = useCallback(
      (campo: keyof Questao, valor: string) => {
        onQuestaoChange(indiceQuestao, campo, valor);
      },
      [indiceQuestao, onQuestaoChange],
    );

    const lidarNotaDiretaToggle = useCallback(
      (ativo: boolean) => {
        onNotaDiretaQuestaoToggle(indiceQuestao, ativo);
      },
      [indiceQuestao, onNotaDiretaQuestaoToggle],
    );

    return (
      <article className="panel question-card">
        <header>
          <div>
            <p>Questão {String(indiceQuestao + 1).padStart(2, "0")}</p>
            <h3>{formatarPontuacao(pontuacaoBruta)} pts</h3>
          </div>
          <span className="badge">{formatarPontuacao(pontuacaoBruta)}</span>
        </header>

        <CamposQuestao
          questao={questao}
          onCampoQuestaoChange={lidarCampoQuestaoChange}
          onNotaDiretaToggle={lidarNotaDiretaToggle}
        />
      </article>
    );
  },
  (propriedadesAnteriores, proximasPropriedades) =>
    propriedadesAnteriores.questao === proximasPropriedades.questao &&
    propriedadesAnteriores.pontuacaoQuestao ===
      proximasPropriedades.pontuacaoQuestao &&
    propriedadesAnteriores.indiceQuestao ===
      proximasPropriedades.indiceQuestao &&
    propriedadesAnteriores.onQuestaoChange ===
      proximasPropriedades.onQuestaoChange &&
    propriedadesAnteriores.onNotaDiretaQuestaoToggle ===
      proximasPropriedades.onNotaDiretaQuestaoToggle,
);

const PainelQuestoesLivres = ({
  questoes,
  pontuacoesQuestoes,
  onQuestaoChange,
  onNotaDiretaQuestaoToggle,
}: PropriedadesPainelQuestoesLivres) => {
  return (
    <section className="grid">
      {questoes.map((questao, indiceQuestao) => {
        return (
          <CartaoQuestaoLivre
            key={indiceQuestao}
            indiceQuestao={indiceQuestao}
            questao={questao}
            pontuacaoQuestao={pontuacoesQuestoes[indiceQuestao]}
            onQuestaoChange={onQuestaoChange}
            onNotaDiretaQuestaoToggle={onNotaDiretaQuestaoToggle}
          />
        );
      })}
    </section>
  );
};

export default memo(PainelQuestoesLivres);
