import type { DisciplineKey } from "../data/courses";
import type { DisciplineState, Question } from "../types/exam";
import { DISCIPLINES } from "../data/disciplines";

export const createQuestion = (): Question => ({
  gabarito: 0,
  candidato: 0,
  maxProp: 16,
  directScoreEnabled: false,
  directScore: 0,
});

export const buildQuestions = (count: number): Question[] =>
  Array.from({ length: count }, () => createQuestion());

export const buildDisciplineState = (
  counts: Partial<Record<DisciplineKey, number>> = {},
): Record<DisciplineKey, DisciplineState> => {
  return DISCIPLINES.reduce(
    (acc, discipline) => {
      const count = counts[discipline.key] ?? 0;
      acc[discipline.key] = {
        open: false,
        questionCount: count,
        questions: buildQuestions(count),
        directScoreEnabled: false,
        directScore: 0,
      };
      return acc;
    },
    {} as Record<DisciplineKey, DisciplineState>,
  );
};
