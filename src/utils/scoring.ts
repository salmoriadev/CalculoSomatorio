import { MAX_PROP_VALUES } from "../types/exam";
import type { Question, QuestionScore } from "../types/exam";

export const computeQuestionScore = (
  question: Question,
  questionValue: number,
): QuestionScore => {
  if (question.directScoreEnabled) {
    const limit = questionValue > 0 ? questionValue : 0;
    const score = Math.max(0, Math.min(question.directScore, limit));
    const raw = questionValue > 0 ? score / questionValue : 0;
    return { raw, score };
  }

  if (question.maxProp === "aberta") {
    const raw = question.gabarito === question.candidato ? 1 : 0;
    return { raw, score: raw * questionValue };
  }

  const maxProp = question.maxProp;
  const props = MAX_PROP_VALUES.filter((value) => value <= maxProp);
  const mask = props.reduce((acc, value) => acc | value, 0);
  const gabarito = question.gabarito & mask;
  const candidato = question.candidato & mask;
  const ntpc = props.reduce(
    (acc, value) => acc + ((gabarito & value) > 0 ? 1 : 0),
    0,
  );
  if (ntpc === 0) return { raw: 0, score: 0 };
  const npc = props.reduce(
    (acc, value) => acc + ((gabarito & candidato & value) > 0 ? 1 : 0),
    0,
  );
  const npi = props.reduce(
    (acc, value) =>
      acc + ((candidato & value) > 0 && (gabarito & value) === 0 ? 1 : 0),
    0,
  );
  const balance = npc - npi;
  if (balance <= 0) {
    return { raw: 0, score: 0 };
  }
  const np = props.length;
  const raw = (np - (ntpc - (npc - npi))) / np;
  const normalized = Math.max(0, Math.min(1, raw));
  return { raw: normalized, score: normalized * questionValue };
};
