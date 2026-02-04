import type { DisciplineKey } from "../data/courses";

export const MAX_PROP_VALUES = [1, 2, 4, 8, 16, 32, 64] as const;
export type MaxPropNumber = (typeof MAX_PROP_VALUES)[number];
export type MaxProp = MaxPropNumber | "aberta";

export type Question = {
  gabarito: number;
  candidato: number;
  maxProp: MaxProp;
  directScoreEnabled: boolean;
  directScore: number;
};

export type ExamMode = "mid" | "final" | "free";

export type DisciplineMeta = {
  key: DisciplineKey;
  label: string;
};

export type DisciplineState = {
  open: boolean;
  questionCount: number;
  questions: Question[];
  directScoreEnabled: boolean;
  directScore: number;
};

export type QuestionScore = {
  raw: number;
  score: number;
};

export type Summary = {
  scores: QuestionScore[];
  objectiveScore: number;
  total: number;
};
