import { describe, expect, it } from "vitest";
import type { Questao } from "../../../src/types/prova";
import {
  alternarNotaDiretaQuestao,
  atualizarCampoQuestao,
  atualizarQuestaoNoIndice,
  zerarRespostaQuestao,
} from "../../../src/utils/manipulacaoQuestoes";

const questaoBase = (): Questao => ({
  gabarito: 10,
  candidato: 4,
  maximoProposicao: 16,
  notaDiretaAtiva: false,
  notaDireta: 1.5,
});

describe("manipulacaoQuestoes", () => {
  it("atualizarQuestaoNoIndice retorna mesma referência para índice inválido", () => {
    const questoes = [questaoBase()];

    const resultado = atualizarQuestaoNoIndice(questoes, 5, (questao) => ({
      ...questao,
      candidato: 0,
    }));

    expect(resultado).toBe(questoes);
  });

  it("atualizarQuestaoNoIndice atualiza apenas o item alvo", () => {
    const primeira = questaoBase();
    const segunda = questaoBase();
    const questoes = [primeira, segunda];

    const resultado = atualizarQuestaoNoIndice(questoes, 1, (questao) => ({
      ...questao,
      candidato: 9,
    }));

    expect(resultado).not.toBe(questoes);
    expect(resultado[0]).toBe(primeira);
    expect(resultado[1]).not.toBe(segunda);
    expect(resultado[1].candidato).toBe(9);
  });

  it("atualizarCampoQuestao sanitiza inteiro para campos numéricos comuns", () => {
    const resultado = atualizarCampoQuestao(questaoBase(), "candidato", "6.9");
    expect(resultado.candidato).toBe(6);
  });

  it("atualizarCampoQuestao atualiza maximoProposicao com validação", () => {
    const questao = questaoBase();
    const valido = atualizarCampoQuestao(questao, "maximoProposicao", "32");
    const invalido = atualizarCampoQuestao(questao, "maximoProposicao", "99");

    expect(valido.maximoProposicao).toBe(32);
    expect(invalido.maximoProposicao).toBe(16);
  });

  it("atualizarCampoQuestao sanitiza nota direta sem permitir negativos", () => {
    const resultado = atualizarCampoQuestao(questaoBase(), "notaDireta", "-5");
    expect(resultado.notaDireta).toBe(0);
  });

  it("alternarNotaDiretaQuestao altera flag de nota direta", () => {
    const resultado = alternarNotaDiretaQuestao(questaoBase(), true);
    expect(resultado.notaDiretaAtiva).toBe(true);
  });

  it("zerarRespostaQuestao limpa resposta sem alterar gabarito", () => {
    const questao = questaoBase();
    const resultado = zerarRespostaQuestao(questao);

    expect(resultado.gabarito).toBe(questao.gabarito);
    expect(resultado.candidato).toBe(0);
    expect(resultado.notaDiretaAtiva).toBe(false);
    expect(resultado.notaDireta).toBe(0);
  });
});
