import { describe, expect, it } from "vitest";
import {
  exibirNumeroOuVazio,
  formatarPontuacao,
  limitarDecimalNaoNegativo,
  limitarInteiroNaoNegativo,
  parsearMaximoProposicao,
} from "../../../src/utils/formatacao";

describe("formatacao", () => {
  it("limitarInteiroNaoNegativo usa fallback para entrada inválida", () => {
    expect(limitarInteiroNaoNegativo("abc", 7)).toBe(7);
  });

  it("limitarInteiroNaoNegativo aplica floor e limite mínimo zero", () => {
    expect(limitarInteiroNaoNegativo("3.9", 0)).toBe(3);
    expect(limitarInteiroNaoNegativo("-1", 0)).toBe(0);
  });

  it("limitarDecimalNaoNegativo usa fallback e bloqueia negativos", () => {
    expect(limitarDecimalNaoNegativo("x", 1.5)).toBe(1.5);
    expect(limitarDecimalNaoNegativo("-2.2", 0)).toBe(0);
  });

  it("parsearMaximoProposicao aceita aberta e valores válidos", () => {
    expect(parsearMaximoProposicao("aberta", 16)).toBe("aberta");
    expect(parsearMaximoProposicao("32", 16)).toBe(32);
  });

  it("parsearMaximoProposicao mantém padrão para valor inválido", () => {
    expect(parsearMaximoProposicao("99", 16)).toBe(16);
    expect(parsearMaximoProposicao("abc", 8)).toBe(8);
  });

  it("formata pontuação e valor vazio corretamente", () => {
    expect(formatarPontuacao(1.2)).toBe("1.20");
    expect(exibirNumeroOuVazio(0)).toBe("");
    expect(exibirNumeroOuVazio(2)).toBe(2);
  });
});
