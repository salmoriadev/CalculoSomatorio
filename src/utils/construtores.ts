/**
 * Utilitários de construção de estado inicial.
 * Gera questões e estrutura padrão de disciplinas da simulação.
 */
import type { ChaveDisciplina } from "../data/cursos";
import type { EstadoDisciplina, Questao } from "../types/prova";
import { DISCIPLINAS } from "../data/disciplinas";

export const criarQuestao = (): Questao => ({
  gabarito: 0,
  candidato: 0,
  maximoProposicao: 16,
  notaDiretaAtiva: false,
  notaDireta: 0,
});

export const construirQuestoes = (quantidade: number): Questao[] =>
  Array.from({ length: quantidade }, () => criarQuestao());

export const construirEstadoDisciplinas = (
  contagens: Partial<Record<ChaveDisciplina, number>> = {},
): Record<ChaveDisciplina, EstadoDisciplina> => {
  return DISCIPLINAS.reduce(
    (acumulador, disciplina) => {
      const quantidade = contagens[disciplina.chave] ?? 0;
      acumulador[disciplina.chave] = {
        aberta: false,
        quantidadeQuestoes: quantidade,
        questoes: construirQuestoes(quantidade),
        notaDiretaAtiva: false,
        notaDireta: 0,
      };
      return acumulador;
    },
    {} as Record<ChaveDisciplina, EstadoDisciplina>,
  );
};
