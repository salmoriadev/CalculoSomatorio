/**
 * Componente raiz da calculadora.
 * Centraliza o estado global da simulação, conecta os painéis de UI
 * e aplica as regras de cálculo de pontuação/meta.
 */
import {
  lazy,
  Suspense,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import PainelControles from "./components/PainelControles";
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
} from "./utils/formatacao";
import {
  alternarNotaDiretaQuestao,
  atualizarCampoQuestao,
  atualizarQuestaoNoIndice,
  zerarRespostaQuestao,
} from "./utils/manipulacaoQuestoes";
import { calcularPontuacaoQuestao } from "./utils/pontuacao";
import "./App.css";

const LIMITE_PONTUACAO_ESPECIAL = 10;
const TOTAL_OBJETIVA_FINAL = 80;
const TOTAL_OBJETIVA_MEIO = 40;
const QUANTIDADE_QUESTOES_INICIAL = 10;
const PainelCurso = lazy(() => import("./components/PainelCurso"));
const PainelQuestoesLivres = lazy(
  () => import("./components/PainelQuestoesLivres"),
);

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

  const [quantidadeQuestoesLivre, setQuantidadeQuestoesLivre] = useState(
    QUANTIDADE_QUESTOES_INICIAL,
  );
  const [quantidadeQuestoesModoLivre, setQuantidadeQuestoesModoLivre] =
    useState(QUANTIDADE_QUESTOES_INICIAL);
  const [totalProvaObjetiva, setTotalProvaObjetiva] =
    useState(TOTAL_OBJETIVA_FINAL);

  const [modoMeta, setModoMeta] = useState<ModoMeta>("maior");
  const [metaPersonalizada, setMetaPersonalizada] = useState(0);

  const [pontosDiscursivas, setPontosDiscursivas] = useState(
    LIMITE_PONTUACAO_ESPECIAL,
  );
  const [pontosRedacao, setPontosRedacao] = useState(LIMITE_PONTUACAO_ESPECIAL);
  const [discursivasAtivas, setDiscursivasAtivas] = useState(true);
  const [redacaoAtiva, setRedacaoAtiva] = useState(true);

  const [questoesModoLivre, setQuestoesModoLivre] = useState<Questao[]>(() =>
    construirQuestoes(QUANTIDADE_QUESTOES_INICIAL),
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

    const idTemporizador = window.setTimeout(() => {
      window.localStorage.setItem("ufsc-theme", tema);
    }, 0);

    return () => {
      window.clearTimeout(idTemporizador);
    };
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

  const atualizarEstadoDisciplina = useCallback(
    (
      chaveDisciplina: ChaveDisciplina,
      atualizador: (estadoAtual: EstadoDisciplina) => EstadoDisciplina,
    ) => {
      setEstadoDisciplinas((estadoAnterior) => ({
        ...estadoAnterior,
        [chaveDisciplina]: atualizador(estadoAnterior[chaveDisciplina]),
      }));
    },
    [],
  );

  const regenerarQuestoesModoLivre = useCallback((quantidade: number) => {
    const quantidadeSegura = Math.max(1, quantidade);
    setQuestoesModoLivre(construirQuestoes(quantidadeSegura));
  }, []);

  const zerarRespostasModoLivre = useCallback(() => {
    setQuestoesModoLivre((questoesAnteriores) =>
      questoesAnteriores.map((questao) => zerarRespostaQuestao(questao)),
    );
  }, []);

  const alterarQuestaoModoLivre = useCallback(
    (indiceQuestao: number, campo: keyof Questao, valor: string) => {
      setQuestoesModoLivre((questoesAnteriores) => {
        return atualizarQuestaoNoIndice(
          questoesAnteriores,
          indiceQuestao,
          (questaoAtual) => atualizarCampoQuestao(questaoAtual, campo, valor),
        );
      });
    },
    [],
  );

  const alternarNotaDiretaQuestaoModoLivre = useCallback(
    (indiceQuestao: number, ativo: boolean) => {
      setQuestoesModoLivre((questoesAnteriores) => {
        return atualizarQuestaoNoIndice(
          questoesAnteriores,
          indiceQuestao,
          (questaoAtual) => alternarNotaDiretaQuestao(questaoAtual, ativo),
        );
      });
    },
    [],
  );

  const alternarAberturaDisciplina = useCallback(
    (chaveDisciplina: ChaveDisciplina) => {
      atualizarEstadoDisciplina(chaveDisciplina, (estadoAtual) => ({
        ...estadoAtual,
        aberta: !estadoAtual.aberta,
      }));
    },
    [atualizarEstadoDisciplina],
  );

  const alterarQuantidadeQuestoesDisciplina = useCallback(
    (chaveDisciplina: ChaveDisciplina, valor: string) => {
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
    },
    [atualizarEstadoDisciplina],
  );

  const alterarQuestaoDisciplina = useCallback(
    (
      chaveDisciplina: ChaveDisciplina,
      indiceQuestao: number,
      campo: keyof Questao,
      valor: string,
    ) => {
      atualizarEstadoDisciplina(chaveDisciplina, (estadoAtual) => {
        const proximasQuestoes = [...estadoAtual.questoes];
        const questoesAtualizadas = atualizarQuestaoNoIndice(
          proximasQuestoes,
          indiceQuestao,
          (questaoAtual) => atualizarCampoQuestao(questaoAtual, campo, valor),
        );
        return {
          ...estadoAtual,
          questoes: questoesAtualizadas,
        };
      });
    },
    [atualizarEstadoDisciplina],
  );

  const alternarNotaDiretaQuestaoDisciplina = useCallback(
    (
      chaveDisciplina: ChaveDisciplina,
      indiceQuestao: number,
      ativo: boolean,
    ) => {
      atualizarEstadoDisciplina(chaveDisciplina, (estadoAtual) => {
        const questoesAtualizadas = atualizarQuestaoNoIndice(
          estadoAtual.questoes,
          indiceQuestao,
          (questaoAtual) => alternarNotaDiretaQuestao(questaoAtual, ativo),
        );
        return {
          ...estadoAtual,
          questoes: questoesAtualizadas,
        };
      });
    },
    [atualizarEstadoDisciplina],
  );

  const zerarRespostasDisciplinas = useCallback(
    (chaveDisciplina?: ChaveDisciplina) => {
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
            questoes: disciplinaAtual.questoes.map((questao) =>
              zerarRespostaQuestao(questao),
            ),
          };
        });

        return proximoEstado;
      });
    },
    [],
  );

  const zerarRespostas = useCallback(() => {
    if (modoLivreAtivo) {
      zerarRespostasModoLivre();
      return;
    }
    zerarRespostasDisciplinas();
  }, [modoLivreAtivo, zerarRespostasDisciplinas, zerarRespostasModoLivre]);

  const aplicarConfiguracaoInicial = useCallback(() => {
    setModoProva(modoConfiguracao);

    switch (modoConfiguracao) {
      case "final":
        setDiscursivasAtivas(true);
        setRedacaoAtiva(true);
        setPontosDiscursivas(LIMITE_PONTUACAO_ESPECIAL);
        setPontosRedacao(LIMITE_PONTUACAO_ESPECIAL);
        setTotalProvaObjetiva(TOTAL_OBJETIVA_FINAL);
        setEstadoDisciplinas(
          construirEstadoDisciplinas(CONTAGENS_PADRAO_FINAL),
        );
        break;
      case "meio":
        setDiscursivasAtivas(false);
        setRedacaoAtiva(true);
        setPontosDiscursivas(0);
        setPontosRedacao(LIMITE_PONTUACAO_ESPECIAL);
        setTotalProvaObjetiva(TOTAL_OBJETIVA_MEIO);
        setEstadoDisciplinas(construirEstadoDisciplinas(CONTAGENS_PADRAO_MEIO));
        break;
      case "livre":
        setDiscursivasAtivas(false);
        setRedacaoAtiva(false);
        setPontosDiscursivas(0);
        setPontosRedacao(0);
        setTotalProvaObjetiva(TOTAL_OBJETIVA_FINAL);
        setQuantidadeQuestoesModoLivre(quantidadeQuestoesLivre);
        regenerarQuestoesModoLivre(quantidadeQuestoesLivre);
        setEstadoDisciplinas(construirEstadoDisciplinas());
        break;
      default:
        break;
    }

    setSobreposicaoAberta(false);
  }, [modoConfiguracao, quantidadeQuestoesLivre, regenerarQuestoesModoLivre]);

  const alterarQuantidadeQuestoesLivreConfiguracao = useCallback(
    (valor: string) => {
      setQuantidadeQuestoesLivre((quantidadeAtual) =>
        limitarInteiroNaoNegativo(valor, quantidadeAtual),
      );
    },
    [],
  );

  const alterarMetaPersonalizada = useCallback((valor: string) => {
    setMetaPersonalizada((metaAtual) =>
      limitarDecimalNaoNegativo(valor, metaAtual),
    );
  }, []);

  const alternarTema = useCallback(() => {
    window.requestAnimationFrame(() => {
      startTransition(() => {
        setTema((temaAnterior) => (temaAnterior === "dark" ? "light" : "dark"));
      });
    });
  }, []);

  const alterarQuantidadeQuestoesModoLivre = useCallback((valor: string) => {
    setQuantidadeQuestoesModoLivre((quantidadeAtual) =>
      limitarInteiroNaoNegativo(valor, quantidadeAtual),
    );
  }, []);

  const alterarTotalProvaObjetiva = useCallback((valor: string) => {
    setTotalProvaObjetiva((valorAtual) =>
      limitarDecimalNaoNegativo(valor, valorAtual),
    );
  }, []);

  const alterarPontosDiscursivas = useCallback((valor: string) => {
    setPontosDiscursivas((pontosAtuais) =>
      Math.min(
        LIMITE_PONTUACAO_ESPECIAL,
        limitarDecimalNaoNegativo(valor, pontosAtuais),
      ),
    );
  }, []);

  const alterarPontosRedacao = useCallback((valor: string) => {
    setPontosRedacao((pontosAtuais) =>
      Math.min(
        LIMITE_PONTUACAO_ESPECIAL,
        limitarDecimalNaoNegativo(valor, pontosAtuais),
      ),
    );
  }, []);

  const gerarQuestoesModoLivre = useCallback(() => {
    regenerarQuestoesModoLivre(quantidadeQuestoesModoLivre);
  }, [quantidadeQuestoesModoLivre, regenerarQuestoesModoLivre]);

  const abrirConfiguracao = useCallback(() => {
    setSobreposicaoAberta(true);
  }, []);

  const alternarDiscursivas = useCallback((ativo: boolean) => {
    setDiscursivasAtivas(ativo);
    setPontosDiscursivas((pontosAtuais) => {
      if (ativo && pontosAtuais === 0) return LIMITE_PONTUACAO_ESPECIAL;
      return pontosAtuais;
    });
  }, []);

  const alternarRedacao = useCallback((ativo: boolean) => {
    setRedacaoAtiva(ativo);
    setPontosRedacao((pontosAtuais) => {
      if (ativo && pontosAtuais === 0) return LIMITE_PONTUACAO_ESPECIAL;
      return pontosAtuais;
    });
  }, []);

  const alterarNotaDiretaDisciplina = useCallback(
    (chaveDisciplina: ChaveDisciplina, valor: string) => {
      atualizarEstadoDisciplina(chaveDisciplina, (estadoAtual) => ({
        ...estadoAtual,
        notaDireta: limitarDecimalNaoNegativo(valor, estadoAtual.notaDireta),
      }));
    },
    [atualizarEstadoDisciplina],
  );

  const alternarNotaDiretaDisciplina = useCallback(
    (chaveDisciplina: ChaveDisciplina, ativo: boolean) => {
      atualizarEstadoDisciplina(chaveDisciplina, (estadoAtual) => ({
        ...estadoAtual,
        notaDiretaAtiva: ativo,
      }));
    },
    [atualizarEstadoDisciplina],
  );

  return (
    <main className="app">
      <SobreposicaoConfiguracao
        aberta={sobreposicaoAberta}
        modoSelecionado={modoConfiguracao}
        quantidadeQuestoesLivre={quantidadeQuestoesLivre}
        onModoSelecionadoChange={setModoConfiguracao}
        onQuantidadeQuestoesLivreChange={
          alterarQuantidadeQuestoesLivreConfiguracao
        }
        onAplicar={aplicarConfiguracaoInicial}
      />

      <SecaoPrincipal
        tema={tema}
        modoMeta={modoMeta}
        pontuacaoMeta={pontuacaoMeta}
        resumo={resumo}
        valorMetaPersonalizada={metaPersonalizada}
        onMetaPersonalizadaChange={alterarMetaPersonalizada}
        onModoMetaChange={setModoMeta}
        onTemaToggle={alternarTema}
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
        onQuantidadeQuestoesLivreChange={alterarQuantidadeQuestoesModoLivre}
        onTotalProvaObjetivaChange={alterarTotalProvaObjetiva}
        onPontosDiscursivasChange={alterarPontosDiscursivas}
        onPontosRedacaoChange={alterarPontosRedacao}
        onGerarQuestoes={gerarQuestoesModoLivre}
        onZerarRespostas={zerarRespostas}
        onAbrirConfiguracao={abrirConfiguracao}
        onDiscursivasToggle={alternarDiscursivas}
        onRedacaoToggle={alternarRedacao}
      />

      <Suspense fallback={null}>
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
            onNotaDiretaDisciplinaChange={alterarNotaDiretaDisciplina}
            onNotaDiretaDisciplinaToggle={alternarNotaDiretaDisciplina}
            onQuestaoDisciplinaChange={alterarQuestaoDisciplina}
            onNotaDiretaQuestaoToggle={alternarNotaDiretaQuestaoDisciplina}
          />
        ) : (
          <PainelQuestoesLivres
            questoes={questoesModoLivre}
            pontuacoesQuestoes={resumo.pontuacoes}
            onQuestaoChange={alterarQuestaoModoLivre}
            onNotaDiretaQuestaoToggle={alternarNotaDiretaQuestaoModoLivre}
          />
        )}
      </Suspense>

      <SecaoRodape resumo={resumo} />
    </main>
  );
}

export default App;
