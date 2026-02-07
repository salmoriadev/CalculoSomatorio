import { describe, expect, it } from "vitest";
import { obterEstatisticasNotasCurso } from "../../../src/data/historicoNotas";

describe("historicoNotas", () => {
  it("retorna estatísticas vazias para curso sem histórico", () => {
    const estatisticas = obterEstatisticasNotasCurso("codigo-inexistente");

    expect(estatisticas).toEqual({
      anos: [],
      anoMaisRecente: null,
      notaMaisRecente: null,
      mediaNotas: null,
      maiorNota: null,
      quantidadeNotas: 0,
    });
  });

  it("retorna estatísticas consistentes para curso com histórico", () => {
    const estatisticas = obterEstatisticasNotasCurso("208");

    expect(estatisticas.quantidadeNotas).toBeGreaterThan(0);
    expect(estatisticas.anos.length).toBe(estatisticas.quantidadeNotas);
    expect(estatisticas.anoMaisRecente).toBe(estatisticas.anos[0]);
    expect(estatisticas.notaMaisRecente).not.toBeNull();
    expect(estatisticas.mediaNotas).not.toBeNull();
    expect(estatisticas.maiorNota).not.toBeNull();

    const anosOrdenados = [...estatisticas.anos].sort((a, b) => b - a);
    expect(estatisticas.anos).toEqual(anosOrdenados);

    expect(estatisticas.maiorNota!).toBeGreaterThanOrEqual(
      estatisticas.mediaNotas!,
    );
  });
});
