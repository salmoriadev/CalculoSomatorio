import type { DisciplineKey } from "./courses";
import type { DisciplineMeta } from "../types/exam";

export const DISCIPLINES: DisciplineMeta[] = [
  { key: "PLI", label: "Primeira língua (Português/Libras)" },
  { key: "SLI", label: "Segunda língua" },
  { key: "MTM", label: "Matemática" },
  { key: "BLG", label: "Biologia" },
  { key: "QMC", label: "Química" },
  { key: "FSC", label: "Física" },
  { key: "CHS", label: "Ciências Humanas e Sociais" },
  { key: "RDC", label: "Redação" },
  { key: "DSC", label: "Questões Discursivas" },
];

export const OBJECTIVE_DISCIPLINES = DISCIPLINES.filter(
  (discipline) => discipline.key !== "RDC" && discipline.key !== "DSC",
);

export const SPECIAL_DISCIPLINES = DISCIPLINES.filter(
  (discipline) => discipline.key === "RDC" || discipline.key === "DSC",
);

export const DEFAULT_COUNTS_FINAL: Partial<Record<DisciplineKey, number>> = {
  PLI: 12,
  SLI: 8,
  MTM: 10,
  BLG: 10,
  CHS: 10,
  FSC: 5,
  QMC: 5,
};

export const DEFAULT_COUNTS_MID: Partial<Record<DisciplineKey, number>> = {
  PLI: 6,
  SLI: 4,
  MTM: 5,
  BLG: 5,
  CHS: 5,
  FSC: 2,
  QMC: 2,
};
