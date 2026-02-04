import { MAX_PROP_VALUES } from "../types/exam";
import type { MaxProp, MaxPropNumber } from "../types/exam";

export const clampInt = (value: string, fallback: number) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
};

export const clampFloat = (value: string, fallback: number) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(0, parsed);
};

export const formatScore = (value: number) => value.toFixed(2);

export const parseMaxProp = (value: string, fallback: MaxProp): MaxProp => {
  if (value === "aberta") return "aberta";
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return MAX_PROP_VALUES.includes(parsed as MaxPropNumber)
    ? (parsed as MaxPropNumber)
    : fallback;
};
