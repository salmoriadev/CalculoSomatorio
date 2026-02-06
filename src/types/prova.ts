/**
 * Tipos centrais do domínio da prova.
 * Modela questões, disciplinas, modos e estruturas de resumo/pontuação.
 */
import type { ChaveDisciplina } from "../data/cursos";

export const VALORES_MAX_PROPOSICAO = [1, 2, 4, 8, 16, 32, 64] as const;
export type NumeroMaxProposicao = (typeof VALORES_MAX_PROPOSICAO)[number];
export type MaximoProposicao = NumeroMaxProposicao | "aberta";

export type Questao = {
  gabarito: number;
  candidato: number;
  maximoProposicao: MaximoProposicao;
  notaDiretaAtiva: boolean;
  notaDireta: number;
};

export type ModoProva = "meio" | "final" | "livre";

export type MetadadosDisciplina = {
  chave: ChaveDisciplina;
  rotulo: string;
};

export type EstadoDisciplina = {
  aberta: boolean;
  quantidadeQuestoes: number;
  questoes: Questao[];
  notaDiretaAtiva: boolean;
  notaDireta: number;
};

export type PontuacaoQuestao = {
  bruta: number;
  pontuacao: number;
};

export type Resumo = {
  pontuacoes: PontuacaoQuestao[];
  pontuacaoObjetiva: number;
  total: number;
};
