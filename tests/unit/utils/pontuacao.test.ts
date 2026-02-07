import { describe, expect, it } from "vitest";
import type { Questao } from "../../../src/types/prova";
import { calcularPontuacaoQuestao } from "../../../src/utils/pontuacao";

const criarQuestao = (parcial?: Partial<Questao>): Questao => ({
  gabarito: 0,
  candidato: 0,
  maximoProposicao: 16,
  notaDiretaAtiva: false,
  notaDireta: 0,
  ...parcial,
});

describe("calcularPontuacaoQuestao", () => {
  it("aplica limite da nota direta ao valor da questão", () => {
    const questao = criarQuestao({ notaDiretaAtiva: true, notaDireta: 12 });

    const resultado = calcularPontuacaoQuestao(questao, 10);

    expect(resultado.pontuacao).toBe(10);
    expect(resultado.bruta).toBe(1);
  });

  it("retorna zero na nota direta quando valor da questão é zero", () => {
    const questao = criarQuestao({ notaDiretaAtiva: true, notaDireta: 5 });

    const resultado = calcularPontuacaoQuestao(questao, 0);

    expect(resultado.pontuacao).toBe(0);
    expect(resultado.bruta).toBe(0);
  });

  it("pontua questão aberta apenas com igualdade exata", () => {
    const acerto = calcularPontuacaoQuestao(
      criarQuestao({ maximoProposicao: "aberta", gabarito: 2, candidato: 2 }),
      3,
    );
    const erro = calcularPontuacaoQuestao(
      criarQuestao({ maximoProposicao: "aberta", gabarito: 2, candidato: 1 }),
      3,
    );

    expect(acerto).toEqual({ bruta: 1, pontuacao: 3 });
    expect(erro).toEqual({ bruta: 0, pontuacao: 0 });
  });

  it("retorna pontuação máxima para acerto completo objetivo", () => {
    const questao = criarQuestao({
      maximoProposicao: 8,
      gabarito: 5,
      candidato: 5,
    });

    const resultado = calcularPontuacaoQuestao(questao, 4);

    expect(resultado.bruta).toBe(1);
    expect(resultado.pontuacao).toBe(4);
  });

  it("calcula pontuação parcial com acertos sem erros", () => {
    const questao = criarQuestao({
      maximoProposicao: 8,
      gabarito: 5,
      candidato: 1,
    });

    const resultado = calcularPontuacaoQuestao(questao, 4);

    expect(resultado.bruta).toBeCloseTo(0.75);
    expect(resultado.pontuacao).toBeCloseTo(3);
  });

  it("zera pontuação quando saldo de acertos é nulo ou negativo", () => {
    const questao = criarQuestao({
      maximoProposicao: 8,
      gabarito: 5,
      candidato: 3,
    });

    const resultado = calcularPontuacaoQuestao(questao, 4);

    expect(resultado).toEqual({ bruta: 0, pontuacao: 0 });
  });

  it("ignora bits acima da maior proposição configurada", () => {
    const questao = criarQuestao({
      maximoProposicao: 4,
      gabarito: 15,
      candidato: 15,
    });

    const resultado = calcularPontuacaoQuestao(questao, 2);

    expect(resultado.bruta).toBe(1);
    expect(resultado.pontuacao).toBe(2);
  });
});
