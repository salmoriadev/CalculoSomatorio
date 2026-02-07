/**
 * Utilitários para manipulação de questões e respostas.
 * Centraliza atualizações imutáveis para reduzir duplicação no estado da aplicação.
 */
import type { Questao } from "../types/prova";
import {
  limitarDecimalNaoNegativo,
  limitarInteiroNaoNegativo,
  parsearMaximoProposicao,
} from "./formatacao";

export const atualizarQuestaoNoIndice = (
  questoes: Questao[],
  indiceQuestao: number,
  atualizador: (questaoAtual: Questao) => Questao,
): Questao[] => {
  const questaoAtual = questoes[indiceQuestao];
  if (!questaoAtual) return questoes;

  const proximasQuestoes = [...questoes];
  proximasQuestoes[indiceQuestao] = atualizador(questaoAtual);
  return proximasQuestoes;
};

export const atualizarCampoQuestao = (
  questaoAtual: Questao,
  campo: keyof Questao,
  valor: string,
): Questao => {
  if (campo === "maximoProposicao") {
    return {
      ...questaoAtual,
      maximoProposicao: parsearMaximoProposicao(
        valor,
        questaoAtual.maximoProposicao,
      ),
    };
  }

  if (campo === "notaDireta") {
    return {
      ...questaoAtual,
      notaDireta: limitarDecimalNaoNegativo(valor, questaoAtual.notaDireta),
    };
  }

  return {
    ...questaoAtual,
    [campo]: limitarInteiroNaoNegativo(valor, questaoAtual[campo] as number),
  };
};

export const alternarNotaDiretaQuestao = (
  questaoAtual: Questao,
  ativo: boolean,
): Questao => ({
  ...questaoAtual,
  notaDiretaAtiva: ativo,
});

export const zerarRespostaQuestao = (questaoAtual: Questao): Questao => ({
  ...questaoAtual,
  candidato: 0,
  notaDiretaAtiva: false,
  notaDireta: 0,
});
