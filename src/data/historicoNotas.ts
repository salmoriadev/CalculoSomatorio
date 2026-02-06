/**
 * Parser do histórico de notas por curso/ano.
 * Disponibiliza estatísticas para cálculo da meta de aprovação.
 */
import notasBrutas from "../../raw_scores.txt?raw";

export type ModoMeta = "ultima" | "media" | "maior" | "personalizada";

type NotaCursoAno = {
  ano: number;
  nota: number;
};

export type EstatisticasNotasCurso = {
  anos: number[];
  anoMaisRecente: number | null;
  notaMaisRecente: number | null;
  mediaNotas: number | null;
  maiorNota: number | null;
  quantidadeNotas: number;
};

const parsearNota = (valor: string): number | null => {
  const valorSemEspacos = valor.trim();
  if (!valorSemEspacos) return null;
  if (/sem classificados/i.test(valorSemEspacos)) return null;
  const numero = Number(valorSemEspacos.replace(",", "."));
  return Number.isFinite(numero) ? numero : null;
};

const extrairAnoDaLinha = (linha: string): number | null => {
  const linhaSemEspacos = linha.trim();
  if (!linhaSemEspacos) return null;

  let resultado = linhaSemEspacos.match(/^(?:ufsc\s*)?(20\d{2})[:]?$/i);
  if (resultado) return Number(resultado[1]);

  resultado = linhaSemEspacos.match(/ufsc\s+(20\d{2})/i);
  if (resultado) return Number(resultado[1]);

  resultado = linhaSemEspacos.match(/Vestibular[^0-9]*(20\d{2})/i);
  if (resultado) return Number(resultado[1]);

  return null;
};

const ESTATISTICAS_NOTAS_VAZIAS: EstatisticasNotasCurso = Object.freeze({
  anos: [],
  anoMaisRecente: null,
  notaMaisRecente: null,
  mediaNotas: null,
  maiorNota: null,
  quantidadeNotas: 0,
});

const montarEstatisticasNotasPorCurso = () => {
  const notasPorCursoEAno = new Map<string, Map<number, number>>();
  let anoAtual: number | null = null;

  notasBrutas.split(/\r?\n/).forEach((linha) => {
    const anoEncontrado = extrairAnoDaLinha(linha);
    if (anoEncontrado) {
      anoAtual = anoEncontrado;
      return;
    }

    if (!anoAtual) return;

    const correspondencia = linha.match(
      /^\s*(\d+)\s+.+?\(\s*UFSC\s*\)\s+([0-9.,]+|Sem classificados)\s+([0-9.,]+|Sem classificados)/i,
    );
    if (!correspondencia) return;

    const codigoCurso = correspondencia[1];
    const notaUltimoClassificado = parsearNota(correspondencia[3]);
    if (notaUltimoClassificado == null) return;

    const notasPorAno =
      notasPorCursoEAno.get(codigoCurso) ?? new Map<number, number>();
    notasPorAno.set(anoAtual, notaUltimoClassificado);
    notasPorCursoEAno.set(codigoCurso, notasPorAno);
  });

  const estatisticasPorCurso = new Map<string, EstatisticasNotasCurso>();

  notasPorCursoEAno.forEach((notasPorAno, codigoCurso) => {
    const notasOrdenadasPorAno: NotaCursoAno[] = Array.from(
      notasPorAno.entries(),
    ).map(([ano, nota]) => ({ ano, nota }));
    notasOrdenadasPorAno.sort((a, b) => b.ano - a.ano);

    const anos = notasOrdenadasPorAno.map((item) => item.ano);
    const notas = notasOrdenadasPorAno.map((item) => item.nota);

    if (!notas.length) {
      estatisticasPorCurso.set(codigoCurso, ESTATISTICAS_NOTAS_VAZIAS);
      return;
    }

    const somaNotas = notas.reduce((acumulador, nota) => acumulador + nota, 0);
    const mediaNotas = somaNotas / notas.length;
    const maiorNota = Math.max(...notas);

    estatisticasPorCurso.set(
      codigoCurso,
      Object.freeze({
        anos,
        anoMaisRecente: anos[0] ?? null,
        notaMaisRecente: notas[0] ?? null,
        mediaNotas,
        maiorNota,
        quantidadeNotas: notas.length,
      }),
    );
  });

  return estatisticasPorCurso;
};

const ESTATISTICAS_NOTAS_POR_CURSO = montarEstatisticasNotasPorCurso();

export const obterEstatisticasNotasCurso = (
  codigoCurso: string,
): EstatisticasNotasCurso => {
  return (
    ESTATISTICAS_NOTAS_POR_CURSO.get(codigoCurso) ?? ESTATISTICAS_NOTAS_VAZIAS
  );
};
