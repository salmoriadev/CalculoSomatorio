/**
 * Utilitários de formatação e sanitização de entrada numérica.
 * Mantém parsing e limites de valores em um único ponto.
 */
import { VALORES_MAX_PROPOSICAO } from "../types/prova";
import type { MaximoProposicao, NumeroMaxProposicao } from "../types/prova";

export const limitarInteiroNaoNegativo = (
  valor: string,
  valorPadrao: number,
) => {
  const numero = Number(valor);
  if (Number.isNaN(numero)) return valorPadrao;
  return Math.max(0, Math.floor(numero));
};

export const limitarDecimalNaoNegativo = (
  valor: string,
  valorPadrao: number,
) => {
  const numero = Number(valor);
  if (Number.isNaN(numero)) return valorPadrao;
  return Math.max(0, numero);
};

export const formatarPontuacao = (valor: number) => valor.toFixed(2);

export const exibirNumeroOuVazio = (valor: number) =>
  valor === 0 ? "" : valor;

export const parsearMaximoProposicao = (
  valor: string,
  valorPadrao: MaximoProposicao,
): MaximoProposicao => {
  if (valor === "aberta") return "aberta";

  const numero = Number(valor);
  if (Number.isNaN(numero)) return valorPadrao;

  return VALORES_MAX_PROPOSICAO.includes(numero as NumeroMaxProposicao)
    ? (numero as NumeroMaxProposicao)
    : valorPadrao;
};
