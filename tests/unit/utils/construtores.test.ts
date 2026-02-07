import { describe, expect, it } from "vitest";
import { DISCIPLINAS } from "../../../src/data/disciplinas";
import {
  construirEstadoDisciplinas,
  construirQuestoes,
  criarQuestao,
} from "../../../src/utils/construtores";

describe("construtores", () => {
  it("criarQuestao retorna estrutura padrão", () => {
    expect(criarQuestao()).toEqual({
      gabarito: 0,
      candidato: 0,
      maximoProposicao: 16,
      notaDiretaAtiva: false,
      notaDireta: 0,
    });
  });

  it("construirQuestoes cria quantidade solicitada com itens independentes", () => {
    const questoes = construirQuestoes(2);
    questoes[0].gabarito = 1;

    expect(questoes).toHaveLength(2);
    expect(questoes[1].gabarito).toBe(0);
  });

  it("construirEstadoDisciplinas cria todas as disciplinas com contagens", () => {
    const estado = construirEstadoDisciplinas({ MTM: 2, PLI: 1 });

    expect(Object.keys(estado).sort()).toEqual(
      DISCIPLINAS.map((disciplina) => disciplina.chave).sort(),
    );
    expect(estado.MTM.quantidadeQuestoes).toBe(2);
    expect(estado.MTM.questoes).toHaveLength(2);
    expect(estado.PLI.quantidadeQuestoes).toBe(1);
    expect(estado.SLI.quantidadeQuestoes).toBe(0);
  });
});
