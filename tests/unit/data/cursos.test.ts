import { describe, expect, it } from "vitest";
import cursos from "../../../src/data/cursos";

const CHAVES_DISCIPLINAS = [
  "PLI",
  "SLI",
  "MTM",
  "BLG",
  "QMC",
  "FSC",
  "CHS",
  "RDC",
  "DSC",
];

describe("cursos", () => {
  it("gera lista de cursos com códigos únicos e ordenada por nome", () => {
    expect(cursos.length).toBeGreaterThan(50);

    const codigos = cursos.map((curso) => curso.codigo);
    expect(new Set(codigos).size).toBe(cursos.length);

    const nomes = cursos.map((curso) => curso.nome);
    expect(nomes).toEqual([...nomes].sort((a, b) => a.localeCompare(b)));
  });

  it("mantém pesos e cortes completos e numéricos", () => {
    cursos.forEach((curso) => {
      expect(Object.keys(curso.pesos).sort()).toEqual(
        [...CHAVES_DISCIPLINAS].sort(),
      );
      expect(Object.keys(curso.cortes).sort()).toEqual(
        [...CHAVES_DISCIPLINAS].sort(),
      );

      Object.values(curso.pesos).forEach((peso) => {
        expect(Number.isFinite(peso)).toBe(true);
        expect(peso).toBeGreaterThanOrEqual(0);
      });

      Object.values(curso.cortes).forEach((corte) => {
        expect(Number.isFinite(corte)).toBe(true);
        expect(corte).toBeGreaterThanOrEqual(0);
      });

      expect(Number.isFinite(curso.pmc)).toBe(true);
      expect(curso.pmc).toBeGreaterThanOrEqual(0);
    });
  });
});
