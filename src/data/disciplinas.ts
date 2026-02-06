/**
 * Catálogo de disciplinas da simulação.
 * Define metadados e contagens padrão por modo de prova.
 */
import type { ChaveDisciplina } from "./cursos";
import type { MetadadosDisciplina } from "../types/prova";

export const DISCIPLINAS: MetadadosDisciplina[] = [
  { chave: "PLI", rotulo: "Primeira língua (Português/Libras)" },
  { chave: "SLI", rotulo: "Segunda língua" },
  { chave: "MTM", rotulo: "Matemática" },
  { chave: "BLG", rotulo: "Biologia" },
  { chave: "QMC", rotulo: "Química" },
  { chave: "FSC", rotulo: "Física" },
  { chave: "CHS", rotulo: "Ciências Humanas e Sociais" },
  { chave: "RDC", rotulo: "Redação" },
  { chave: "DSC", rotulo: "Questões Discursivas" },
];

export const DISCIPLINAS_OBJETIVAS = DISCIPLINAS.filter(
  (disciplina) => disciplina.chave !== "RDC" && disciplina.chave !== "DSC",
);

export const DISCIPLINAS_ESPECIAIS = DISCIPLINAS.filter(
  (disciplina) => disciplina.chave === "RDC" || disciplina.chave === "DSC",
);

export const CONTAGENS_PADRAO_FINAL: Partial<Record<ChaveDisciplina, number>> = {
  PLI: 12,
  SLI: 8,
  MTM: 10,
  BLG: 10,
  CHS: 10,
  FSC: 5,
  QMC: 5,
};

export const CONTAGENS_PADRAO_MEIO: Partial<Record<ChaveDisciplina, number>> = {
  PLI: 6,
  SLI: 4,
  MTM: 5,
  BLG: 5,
  CHS: 5,
  FSC: 2,
  QMC: 2,
};
