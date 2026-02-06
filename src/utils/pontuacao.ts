/**
 * Motor de cálculo de pontuação por questão.
 * Implementa a fórmula oficial de somatório e regras de nota direta.
 */
import { VALORES_MAX_PROPOSICAO } from "../types/prova";
import type { PontuacaoQuestao, Questao } from "../types/prova";

export const calcularPontuacaoQuestao = (
  questao: Questao,
  valorQuestao: number,
): PontuacaoQuestao => {
  if (questao.notaDiretaAtiva) {
    const limite = valorQuestao > 0 ? valorQuestao : 0;
    const pontuacao = Math.max(0, Math.min(questao.notaDireta, limite));
    const bruta = valorQuestao > 0 ? pontuacao / valorQuestao : 0;
    return { bruta, pontuacao };
  }

  if (questao.maximoProposicao === "aberta") {
    const bruta = questao.gabarito === questao.candidato ? 1 : 0;
    return { bruta, pontuacao: bruta * valorQuestao };
  }

  const maximoProposicao = questao.maximoProposicao;
  const proposicoes = VALORES_MAX_PROPOSICAO.filter(
    (valor) => valor <= maximoProposicao,
  );
  const mascara = proposicoes.reduce((acumulador, valor) => acumulador | valor, 0);
  const gabaritoFiltrado = questao.gabarito & mascara;
  const candidatoFiltrado = questao.candidato & mascara;

  const totalProposicoesCorretas = proposicoes.reduce(
    (acumulador, valor) => acumulador + ((gabaritoFiltrado & valor) > 0 ? 1 : 0),
    0,
  );

  if (totalProposicoesCorretas === 0) return { bruta: 0, pontuacao: 0 };

  const numeroProposicoesCorretasMarcadas = proposicoes.reduce(
    (acumulador, valor) =>
      acumulador + ((gabaritoFiltrado & candidatoFiltrado & valor) > 0 ? 1 : 0),
    0,
  );

  const numeroProposicoesIncorretasMarcadas = proposicoes.reduce(
    (acumulador, valor) =>
      acumulador + ((candidatoFiltrado & valor) > 0 && (gabaritoFiltrado & valor) === 0 ? 1 : 0),
    0,
  );

  const saldoAcertos =
    numeroProposicoesCorretasMarcadas - numeroProposicoesIncorretasMarcadas;
  if (saldoAcertos <= 0) {
    return { bruta: 0, pontuacao: 0 };
  }

  const numeroProposicoes = proposicoes.length;
  const pontuacaoBruta =
    (numeroProposicoes -
      (totalProposicoesCorretas -
        (numeroProposicoesCorretasMarcadas -
          numeroProposicoesIncorretasMarcadas))) /
    numeroProposicoes;

  const pontuacaoBrutaNormalizada = Math.max(0, Math.min(1, pontuacaoBruta));

  return {
    bruta: pontuacaoBrutaNormalizada,
    pontuacao: pontuacaoBrutaNormalizada * valorQuestao,
  };
};
