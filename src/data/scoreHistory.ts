import rawScores from "../../raw_scores.txt?raw";

export type TargetMode = "latest" | "average" | "max" | "custom";

type CourseYearScore = {
  year: number;
  score: number;
};

export type CourseScoreStats = {
  years: number[];
  latestYear: number | null;
  latest: number | null;
  average: number | null;
  max: number | null;
  count: number;
};

const parseScore = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/sem classificados/i.test(trimmed)) return null;
  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

const extractYear = (line: string): number | null => {
  const trimmed = line.trim();
  if (!trimmed) return null;
  let match = trimmed.match(/^(?:ufsc\s*)?(20\d{2})[:]?$/i);
  if (match) return Number(match[1]);
  match = trimmed.match(/ufsc\s+(20\d{2})/i);
  if (match) return Number(match[1]);
  match = trimmed.match(/Vestibular[^0-9]*(20\d{2})/i);
  if (match) return Number(match[1]);
  return null;
};

const buildHistory = () => {
  const byCourse = new Map<string, Map<number, number>>();
  let currentYear: number | null = null;

  rawScores.split(/\r?\n/).forEach((line) => {
    const year = extractYear(line);
    if (year) {
      currentYear = year;
      return;
    }

    if (!currentYear) return;

    const match = line.match(
      /^\s*(\d+)\s+.+?\(\s*UFSC\s*\)\s+([0-9.,]+|Sem classificados)\s+([0-9.,]+|Sem classificados)/i,
    );
    if (!match) return;

    const code = match[1];
    const lastScore = parseScore(match[3]);
    if (lastScore == null) return;

    const existing = byCourse.get(code) ?? new Map<number, number>();
    existing.set(currentYear, lastScore);
    byCourse.set(code, existing);
  });

  return byCourse;
};

const historyByCourse = buildHistory();

export const getCourseScoreStats = (code: string): CourseScoreStats => {
  const perYear = historyByCourse.get(code);
  if (!perYear) {
    return {
      years: [],
      latestYear: null,
      latest: null,
      average: null,
      max: null,
      count: 0,
    };
  }

  const entries: CourseYearScore[] = Array.from(perYear.entries()).map(
    ([year, score]) => ({ year, score }),
  );
  entries.sort((a, b) => b.year - a.year);

  const years = entries.map((entry) => entry.year);
  const values = entries.map((entry) => entry.score);

  if (!values.length) {
    return {
      years: [],
      latestYear: null,
      latest: null,
      average: null,
      max: null,
      count: 0,
    };
  }

  const sum = values.reduce((acc, value) => acc + value, 0);
  const average = sum / values.length;
  const max = Math.max(...values);

  return {
    years,
    latestYear: years[0] ?? null,
    latest: values[0] ?? null,
    average,
    max,
    count: values.length,
  };
};
