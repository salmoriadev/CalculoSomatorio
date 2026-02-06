/**
 * Componente raiz da calculadora.
 * Centraliza o estado global da simulação, conecta os painéis de UI
 * e aplica as regras de cálculo de pontuação/meta.
 */
import { useEffect, useMemo, useState } from "react";
import PainelControles from "./components/PainelControles";
import PainelCurso from "./components/PainelCurso";
import PainelQuestoesLivres from "./components/PainelQuestoesLivres";
import SecaoPrincipal from "./components/SecaoPrincipal";
import SecaoRodape from "./components/SecaoRodape";
import SobreposicaoConfiguracao from "./components/SobreposicaoConfiguracao";
import cursos, { type ChaveDisciplina } from "./data/cursos";
import {
  CONTAGENS_PADRAO_FINAL,
  CONTAGENS_PADRAO_MEIO,
  DISCIPLINAS,
  DISCIPLINAS_OBJETIVAS,
} from "./data/disciplinas";
import {
  obterEstatisticasNotasCurso,
  type ModoMeta,
} from "./data/historicoNotas";
import type {
  EstadoDisciplina,
  ModoProva,
  Questao,
  Resumo,
} from "./types/prova";
import {
  construirEstadoDisciplinas,
  construirQuestoes,
  criarQuestao,
} from "./utils/construtores";
import {
  limitarDecimalNaoNegativo,
  limitarInteiroNaoNegativo,
  parsearMaximoProposicao,
} from "./utils/formatacao";
import { calcularPontuacaoQuestao } from "./utils/pontuacao";
import "./App.css";

const LIMITE_PONTUACAO_ESPECIAL = 10;

function App() {
  const [tema, setTema] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    const temaSalvo = window.localStorage.getItem("ufsc-theme");
    if (temaSalvo === "light" || temaSalvo === "dark") return temaSalvo;
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });

  const [sobreposicaoAberta, setSobreposicaoAberta] = useState(true);
  const [modoConfiguracao, setModoConfiguracao] = useState<ModoProva>("final");
  const [modoProva, setModoProva] = useState<ModoProva>("final");

  const [quantidadeQuestoesLivre, setQuantidadeQuestoesLivre] = useState(10);
  const [quantidadeQuestoesModoLivre, setQuantidadeQuestoesModoLivre] =
    useState(10);
  const [totalProvaObjetiva, setTotalProvaObjetiva] = useState(80);

  const [modoMeta, setModoMeta] = useState<ModoMeta>("maior");
  const [metaPersonalizada, setMetaPersonalizada] = useState(0);

  const [pontosDiscursivas, setPontosDiscursivas] = useState(10);
  const [pontosRedacao, setPontosRedacao] = useState(10);
  const [discursivasAtivas, setDiscursivasAtivas] = useState(true);
  const [redacaoAtiva, setRedacaoAtiva] = useState(true);

  const [questoesModoLivre, setQuestoesModoLivre] = useState<Questao[]>(() =>
    construirQuestoes(10),
  );

  const [estadoDisciplinas, setEstadoDisciplinas] = useState<
    Record<ChaveDisciplina, EstadoDisciplina>
  >(() => construirEstadoDisciplinas(CONTAGENS_PADRAO_FINAL));

  const [codigoCursoSelecionado, setCodigoCursoSelecionado] = useState(
    cursos[0]?.codigo ?? "",
  );

  const cursoSelecionado = useMemo(
    () =>
      cursos.find((curso) => curso.codigo === codigoCursoSelecionado) ?? null,
    [codigoCursoSelecionado],
  );

  const [usarPesosIguais, setUsarPesosIguais] = useState(false);

  const modoLivreAtivo = modoProva === "livre";

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    window.localStorage.setItem("ufsc-theme", tema);
  }, [tema]);

  useEffect(() => {
    const { body, documentElement } = document;
    if (sobreposicaoAberta) {
      body.style.overflow = "hidden";
      documentElement.style.overflow = "hidden";
    } else {
      body.style.overflow = "";
      documentElement.style.overflow = "";
    }

    return () => {
      body.style.overflow = "";
      documentElement.style.overflow = "";
    };
  }, [sobreposicaoAberta]);

  const totalQuestoesDisciplinas = useMemo(() => {
    return DISCIPLINAS_OBJETIVAS.reduce((acumulador, disciplina) => {
      return acumulador + estadoDisciplinas[disciplina.chave].questoes.length;
    }, 0);
  }, [estadoDisciplinas]);

  const totalQuestoesObjetivas = modoLivreAtivo
    ? questoesModoLivre.length
    : totalQuestoesDisciplinas;

  const valorQuestao = useMemo(() => {
    if (!totalQuestoesObjetivas) return 0;
    return totalProvaObjetiva / totalQuestoesObjetivas;
  }, [totalProvaObjetiva, totalQuestoesObjetivas]);

  const totaisDisciplinas = useMemo(() => {
    const totais = {} as Record<ChaveDisciplina, number>;

    DISCIPLINAS_OBJETIVAS.forEach((disciplina) => {
      const estadoDisciplina = estadoDisciplinas[disciplina.chave];
      const totalDisciplina = estadoDisciplina.notaDiretaAtiva
        ? Math.max(0, estadoDisciplina.notaDireta)
        : estadoDisciplina.questoes.reduce((acumulador, questao) => {
            return (
              acumulador +
              calcularPontuacaoQuestao(questao, valorQuestao).pontuacao
            );
          }, 0);

      totais[disciplina.chave] = totalDisciplina;
    });

    totais.RDC = redacaoAtiva ? pontosRedacao : 0;
    totais.DSC = discursivasAtivas ? pontosDiscursivas : 0;

    return totais;
  }, [
    estadoDisciplinas,
    valorQuestao,
    redacaoAtiva,
    pontosRedacao,
    discursivasAtivas,
    pontosDiscursivas,
  ]);

  const resumo: Resumo = useMemo(() => {
    const pontosDiscursivosAtivos = discursivasAtivas ? pontosDiscursivas : 0;
    const pontosRedacaoAtivos = redacaoAtiva ? pontosRedacao : 0;

    if (modoLivreAtivo) {
      const pontuacoesQuestoes = questoesModoLivre.map((questao) =>
        calcularPontuacaoQuestao(questao, valorQuestao),
      );
      const pontuacaoObjetiva = pontuacoesQuestoes.reduce(
        (acumulador, item) => acumulador + item.pontuacao,
        0,
      );
      const total =
        pontuacaoObjetiva + pontosDiscursivosAtivos + pontosRedacaoAtivos;

      return {
        pontuacoes: pontuacoesQuestoes,
        pontuacaoObjetiva,
        total,
      };
    }

    const pontuacaoObjetiva = DISCIPLINAS_OBJETIVAS.reduce(
      (acumulador, disciplina) => {
        return acumulador + totaisDisciplinas[disciplina.chave];
      },
      0,
    );

    const total =
      pontuacaoObjetiva + pontosDiscursivosAtivos + pontosRedacaoAtivos;

    return {
      pontuacoes: [],
      pontuacaoObjetiva,
      total,
    };
  }, [
    discursivasAtivas,
    pontosDiscursivas,
    redacaoAtiva,
    pontosRedacao,
    modoLivreAtivo,
    questoesModoLivre,
    valorQuestao,
    totaisDisciplinas,
  ]);

  const somatorioPonderado = useMemo(() => {
    if (!cursoSelecionado) return 0;

    return DISCIPLINAS.reduce((acumulador, disciplina) => {
      const pesoDisciplina = usarPesosIguais
        ? 1
        : cursoSelecionado.pesos[disciplina.chave];
      return acumulador + totaisDisciplinas[disciplina.chave] * pesoDisciplina;
    }, 0);
  }, [cursoSelecionado, totaisDisciplinas, usarPesosIguais]);

  const estatisticasNotasCurso = useMemo(
    () => obterEstatisticasNotasCurso(codigoCursoSelecionado),
    [codigoCursoSelecionado],
  );

  const pontuacaoMeta = useMemo(() => {
    if (modoMeta === "personalizada") {
      return metaPersonalizada > 0 ? metaPersonalizada : null;
    }
    if (modoMeta === "ultima") return estatisticasNotasCurso.notaMaisRecente;
    if (modoMeta === "media") return estatisticasNotasCurso.mediaNotas;
    return estatisticasNotasCurso.maiorNota;
  }, [modoMeta, estatisticasNotasCurso, metaPersonalizada]);

  const atualizarEstadoDisciplina = (
    chaveDisciplina: ChaveDisciplina,
    atualizador: (estadoAtual: EstadoDisciplina) => EstadoDisciplina,
  ) => {
    setEstadoDisciplinas((estadoAnterior) => ({
      ...estadoAnterior,
      [chaveDisciplina]: atualizador(estadoAnterior[chaveDisciplina]),
    }));
  };

  const regenerarQuestoesModoLivre = (
    quantidade = quantidadeQuestoesModoLivre,
  ) => {
    const quantidadeSegura = Math.max(1, quantidade);
    setQuestoesModoLivre(construirQuestoes(quantidadeSegura));
  };

  const zerarRespostasModoLivre = () => {
    setQuestoesModoLivre((questoesAnteriores) =>
      questoesAnteriores.map((questao) => ({
        ...questao,
        candidato: 0,
        notaDiretaAtiva: false,
        notaDireta: 0,
      })),
    );
  };

  const alterarQuestaoModoLivre = (
    indiceQuestao: number,
    campo: keyof Questao,
    valor: string,
  ) => {
    setQuestoesModoLivre((questoesAnteriores) => {
      const proximasQuestoes = [...questoesAnteriores];
      const questaoAtual = proximasQuestoes[indiceQuestao];
      if (!questaoAtual) return questoesAnteriores;

      if (campo === "maximoProposicao") {
        proximasQuestoes[indiceQuestao] = {
          ...questaoAtual,
          maximoProposicao: parsearMaximoProposicao(
            valor,
            questaoAtual.maximoProposicao,
          ),
        };
      } else if (campo === "notaDireta") {
        proximasQuestoes[indiceQuestao] = {
          ...questaoAtual,
          notaDireta: limitarDecimalNaoNegativo(valor, questaoAtual.notaDireta),
        };
      } else {
        proximasQuestoes[indiceQuestao] = {
          ...questaoAtual,
          [campo]: limitarInteiroNaoNegativo(
            valor,
            questaoAtual[campo] as number,
          ),
        };
      }

      return proximasQuestoes;
    });
  };

  const alternarNotaDiretaQuestaoModoLivre = (
    indiceQuestao: number,
    ativo: boolean,
  ) => {
    setQuestoesModoLivre((questoesAnteriores) => {
      const proximasQuestoes = [...questoesAnteriores];
      const questaoAtual = proximasQuestoes[indiceQuestao];
      if (!questaoAtual) return questoesAnteriores;

      proximasQuestoes[indiceQuestao] = {
        ...questaoAtual,
        notaDiretaAtiva: ativo,
      };

      return proximasQuestoes;
    });
  };

  const alternarAberturaDisciplina = (chaveDisciplina: ChaveDisciplina) => {
    atualizarEstadoDisciplina(chaveDisciplina, (estadoAtual) => ({
      ...estadoAtual,
      aberta: !estadoAtual.aberta,
    }));
  };

  const alterarQuantidadeQuestoesDisciplina = (
    chaveDisciplina: ChaveDisciplina,
    valor: string,
  ) => {
    atualizarEstadoDisciplina(chaveDisciplina, (estadoAtual) => {
      const proximaQuantidade = limitarInteiroNaoNegativo(
        valor,
        estadoAtual.quantidadeQuestoes,
      );

      const proximasQuestoes = Array.from(
        { length: proximaQuantidade },
        (_, indiceQuestao) =>
          estadoAtual.questoes[indiceQuestao] ?? criarQuestao(),
      );

      return {
        ...estadoAtual,
        quantidadeQuestoes: proximaQuantidade,
        questoes: proximasQuestoes,
      };
    });
  };

  const alterarQuestaoDisciplina = (
    chaveDisciplina: ChaveDisciplina,
    indiceQuestao: number,
    campo: keyof Questao,
    valor: string,
  ) => {
    atualizarEstadoDisciplina(chaveDisciplina, (estadoAtual) => {
      const proximasQuestoes = [...estadoAtual.questoes];
      const questaoAtual = proximasQuestoes[indiceQuestao];
      if (!questaoAtual) return estadoAtual;

      if (campo === "maximoProposicao") {
        proximasQuestoes[indiceQuestao] = {
          ...questaoAtual,
          maximoProposicao: parsearMaximoProposicao(
            valor,
            questaoAtual.maximoProposicao,
          ),
        };
      } else if (campo === "notaDireta") {
        proximasQuestoes[indiceQuestao] = {
          ...questaoAtual,
          notaDireta: limitarDecimalNaoNegativo(valor, questaoAtual.notaDireta),
        };
      } else {
        proximasQuestoes[indiceQuestao] = {
          ...questaoAtual,
          [campo]: limitarInteiroNaoNegativo(
            valor,
            questaoAtual[campo] as number,
          ),
        };
      }

      return {
        ...estadoAtual,
        questoes: proximasQuestoes,
      };
    });
  };

  const alternarNotaDiretaQuestaoDisciplina = (
    chaveDisciplina: ChaveDisciplina,
    indiceQuestao: number,
    ativo: boolean,
  ) => {
    atualizarEstadoDisciplina(chaveDisciplina, (estadoAtual) => {
      const proximasQuestoes = [...estadoAtual.questoes];
      const questaoAtual = proximasQuestoes[indiceQuestao];
      if (!questaoAtual) return estadoAtual;

      proximasQuestoes[indiceQuestao] = {
        ...questaoAtual,
        notaDiretaAtiva: ativo,
      };

      return {
        ...estadoAtual,
        questoes: proximasQuestoes,
      };
    });
  };

  const zerarRespostasDisciplinas = (chaveDisciplina?: ChaveDisciplina) => {
    setEstadoDisciplinas((estadoAnterior) => {
      const proximoEstado = { ...estadoAnterior };

      const chaves = chaveDisciplina
        ? [chaveDisciplina]
        : DISCIPLINAS_OBJETIVAS.map((disciplina) => disciplina.chave);

      chaves.forEach((chaveAtual) => {
        const disciplinaAtual = proximoEstado[chaveAtual];
        proximoEstado[chaveAtual] = {
          ...disciplinaAtual,
          notaDiretaAtiva: false,
          notaDireta: 0,
          questoes: disciplinaAtual.questoes.map((questao) => ({
            ...questao,
            candidato: 0,
            notaDiretaAtiva: false,
            notaDireta: 0,
          })),
        };
      });

      return proximoEstado;
    });
  };

  const zerarRespostas = () => {
    if (modoLivreAtivo) {
      zerarRespostasModoLivre();
      return;
    }
    zerarRespostasDisciplinas();
  };

  const aplicarConfiguracaoInicial = () => {
    setModoProva(modoConfiguracao);

    if (modoConfiguracao === "final") {
      setDiscursivasAtivas(true);
      setRedacaoAtiva(true);
      setPontosDiscursivas(LIMITE_PONTUACAO_ESPECIAL);
      setPontosRedacao(LIMITE_PONTUACAO_ESPECIAL);
      setTotalProvaObjetiva(80);
      setEstadoDisciplinas(construirEstadoDisciplinas(CONTAGENS_PADRAO_FINAL));
    }

    if (modoConfiguracao === "meio") {
      setDiscursivasAtivas(false);
      setRedacaoAtiva(true);
      setPontosDiscursivas(0);
      setPontosRedacao(LIMITE_PONTUACAO_ESPECIAL);
      setTotalProvaObjetiva(40);
      setEstadoDisciplinas(construirEstadoDisciplinas(CONTAGENS_PADRAO_MEIO));
    }

    if (modoConfiguracao === "livre") {
      setDiscursivasAtivas(false);
      setRedacaoAtiva(false);
      setPontosDiscursivas(0);
      setPontosRedacao(0);
      setTotalProvaObjetiva(80);
      setQuantidadeQuestoesModoLivre(quantidadeQuestoesLivre);
      regenerarQuestoesModoLivre(quantidadeQuestoesLivre);
      setEstadoDisciplinas(construirEstadoDisciplinas());
    }

    setSobreposicaoAberta(false);
  };

  return (
    <main className="app">
      <SobreposicaoConfiguracao
        aberta={sobreposicaoAberta}
        modoSelecionado={modoConfiguracao}
        quantidadeQuestoesLivre={quantidadeQuestoesLivre}
        onModoSelecionadoChange={setModoConfiguracao}
        onQuantidadeQuestoesLivreChange={(valor) =>
          setQuantidadeQuestoesLivre(
            limitarInteiroNaoNegativo(valor, quantidadeQuestoesLivre),
          )
        }
        onAplicar={aplicarConfiguracaoInicial}
      />

      <SecaoPrincipal
        tema={tema}
        modoMeta={modoMeta}
        pontuacaoMeta={pontuacaoMeta}
        resumo={resumo}
        valorMetaPersonalizada={metaPersonalizada}
        onMetaPersonalizadaChange={(valor) =>
          setMetaPersonalizada(
            limitarDecimalNaoNegativo(valor, metaPersonalizada),
          )
        }
        onModoMetaChange={setModoMeta}
        onTemaToggle={() =>
          setTema((temaAnterior) =>
            temaAnterior === "dark" ? "light" : "dark",
          )
        }
      />

      <PainelControles
        modoLivreAtivo={modoLivreAtivo}
        quantidadeQuestoesLivre={quantidadeQuestoesModoLivre}
        totalQuestoesObjetivas={totalQuestoesObjetivas}
        totalProvaObjetiva={totalProvaObjetiva}
        pontosDiscursivas={pontosDiscursivas}
        pontosRedacao={pontosRedacao}
        discursivasAtivas={discursivasAtivas}
        redacaoAtiva={redacaoAtiva}
        onQuantidadeQuestoesLivreChange={(valor) =>
          setQuantidadeQuestoesModoLivre(
            limitarInteiroNaoNegativo(valor, quantidadeQuestoesModoLivre),
          )
        }
        onTotalProvaObjetivaChange={(valor) =>
          setTotalProvaObjetiva(
            limitarDecimalNaoNegativo(valor, totalProvaObjetiva),
          )
        }
        onPontosDiscursivasChange={(valor) =>
          setPontosDiscursivas(
            Math.min(
              LIMITE_PONTUACAO_ESPECIAL,
              limitarDecimalNaoNegativo(valor, pontosDiscursivas),
            ),
          )
        }
        onPontosRedacaoChange={(valor) =>
          setPontosRedacao(
            Math.min(
              LIMITE_PONTUACAO_ESPECIAL,
              limitarDecimalNaoNegativo(valor, pontosRedacao),
            ),
          )
        }
        onGerarQuestoes={() => regenerarQuestoesModoLivre()}
        onZerarRespostas={zerarRespostas}
        onAbrirConfiguracao={() => setSobreposicaoAberta(true)}
        onDiscursivasToggle={(ativo) => {
          setDiscursivasAtivas(ativo);
          if (ativo && pontosDiscursivas === 0) {
            setPontosDiscursivas(LIMITE_PONTUACAO_ESPECIAL);
          }
        }}
        onRedacaoToggle={(ativo) => {
          setRedacaoAtiva(ativo);
          if (ativo && pontosRedacao === 0) {
            setPontosRedacao(LIMITE_PONTUACAO_ESPECIAL);
          }
        }}
      />

      {!modoLivreAtivo ? (
        <PainelCurso
          cursos={cursos}
          cursoSelecionado={cursoSelecionado}
          codigoCursoSelecionado={codigoCursoSelecionado}
          usarPesosIguais={usarPesosIguais}
          somatorioPonderado={somatorioPonderado}
          totaisDisciplinas={totaisDisciplinas}
          estadoDisciplinas={estadoDisciplinas}
          valorQuestao={valorQuestao}
          exibirCortes={modoProva === "final"}
          onCursoChange={setCodigoCursoSelecionado}
          onPesosIguaisToggle={setUsarPesosIguais}
          onDisciplinaAberturaToggle={alternarAberturaDisciplina}
          onQuantidadeQuestoesDisciplinaChange={
            alterarQuantidadeQuestoesDisciplina
          }
          onZerarRespostasDisciplina={zerarRespostasDisciplinas}
          onNotaDiretaDisciplinaChange={(chaveDisciplina, valor) =>
            atualizarEstadoDisciplina(chaveDisciplina, (estadoAtual) => ({
              ...estadoAtual,
              notaDireta: limitarDecimalNaoNegativo(
                valor,
                estadoAtual.notaDireta,
              ),
            }))
          }
          onNotaDiretaDisciplinaToggle={(chaveDisciplina, ativo) =>
            atualizarEstadoDisciplina(chaveDisciplina, (estadoAtual) => ({
              ...estadoAtual,
              notaDiretaAtiva: ativo,
            }))
          }
          onQuestaoDisciplinaChange={alterarQuestaoDisciplina}
          onNotaDiretaQuestaoToggle={alternarNotaDiretaQuestaoDisciplina}
        />
      ) : null}

      {modoLivreAtivo ? (
        <PainelQuestoesLivres
          questoes={questoesModoLivre}
          pontuacoesQuestoes={resumo.pontuacoes}
          onQuestaoChange={alterarQuestaoModoLivre}
          onNotaDiretaQuestaoToggle={alternarNotaDiretaQuestaoModoLivre}
        />
      ) : null}

      <SecaoRodape resumo={resumo} />
    </main>
  );
}

export default App;
