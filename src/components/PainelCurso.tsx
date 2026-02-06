/**
 * Painel detalhado por curso e disciplina.
 * Exibe pesos/cortes e permite preencher respostas disciplinares.
 */
import type { ChaveDisciplina, Curso } from "../data/cursos";
import {
  DISCIPLINAS_ESPECIAIS,
  DISCIPLINAS_OBJETIVAS,
} from "../data/disciplinas";
import { formatarPontuacao } from "../utils/formatacao";
import { calcularPontuacaoQuestao } from "../utils/pontuacao";
import type { EstadoDisciplina, Questao } from "../types/prova";
import { VALORES_MAX_PROPOSICAO } from "../types/prova";

type PropriedadesPainelCurso = {
  cursos: Curso[];
  cursoSelecionado: Curso | null;
  codigoCursoSelecionado: string;
  usarPesosIguais: boolean;
  somatorioPonderado: number;
  totaisDisciplinas: Record<ChaveDisciplina, number>;
  estadoDisciplinas: Record<ChaveDisciplina, EstadoDisciplina>;
  valorQuestao: number;
  exibirCortes: boolean;
  onCursoChange: (valor: string) => void;
  onPesosIguaisToggle: (ativo: boolean) => void;
  onDisciplinaAberturaToggle: (chave: ChaveDisciplina) => void;
  onQuantidadeQuestoesDisciplinaChange: (
    chave: ChaveDisciplina,
    valor: string,
  ) => void;
  onZerarRespostasDisciplina: (chave: ChaveDisciplina) => void;
  onNotaDiretaDisciplinaChange: (chave: ChaveDisciplina, valor: string) => void;
  onNotaDiretaDisciplinaToggle: (
    chave: ChaveDisciplina,
    ativo: boolean,
  ) => void;
  onQuestaoDisciplinaChange: (
    chave: ChaveDisciplina,
    indiceQuestao: number,
    campo: keyof Questao,
    valor: string,
  ) => void;
  onNotaDiretaQuestaoToggle: (
    chave: ChaveDisciplina,
    indiceQuestao: number,
    ativo: boolean,
  ) => void;
};

const PainelCurso = ({
  cursos,
  cursoSelecionado,
  codigoCursoSelecionado,
  usarPesosIguais,
  somatorioPonderado,
  totaisDisciplinas,
  estadoDisciplinas,
  valorQuestao,
  exibirCortes,
  onCursoChange,
  onPesosIguaisToggle,
  onDisciplinaAberturaToggle,
  onQuantidadeQuestoesDisciplinaChange,
  onZerarRespostasDisciplina,
  onNotaDiretaDisciplinaChange,
  onNotaDiretaDisciplinaToggle,
  onQuestaoDisciplinaChange,
  onNotaDiretaQuestaoToggle,
}: PropriedadesPainelCurso) => {
  const exibirValor = (valor: number) => (valor === 0 ? "" : valor);

  return (
    <section className="panel course-panel">
      <div className="course-header">
        <div>
          <h2>{exibirCortes ? "Pesos e pontos de corte" : "Pesos do curso"}</h2>
          <p>
            {exibirCortes
              ? "Escolha o curso para ver pesos, mínimos e a pontuação máxima do vestibular UFSC."
              : "Escolha o curso para ver pesos e a pontuação máxima do vestibular UFSC."}
          </p>
        </div>

        <div className="course-select">
          <label htmlFor="seletorCurso">Curso</label>
          <select
            id="seletorCurso"
            value={codigoCursoSelecionado}
            onChange={(evento) => onCursoChange(evento.target.value)}
          >
            {cursos.map((curso) => (
              <option key={curso.codigo} value={curso.codigo}>
                {curso.nome} - {curso.campus} ({curso.codigo})
              </option>
            ))}
          </select>
        </div>

        <label className="toggle course-toggle">
          <input
            type="checkbox"
            checked={usarPesosIguais}
            onChange={(evento) => onPesosIguaisToggle(evento.target.checked)}
          />
          Usar pesos iguais (1.0)
        </label>
      </div>

      {cursoSelecionado ? (
        <div className="course-meta">
          <div>
            <span>Campus</span>
            <strong>{cursoSelecionado.campus}</strong>
          </div>
          <div>
            <span>Pontuação máxima (PMC)</span>
            <strong>{formatarPontuacao(cursoSelecionado.pmc)}</strong>
          </div>
          <div>
            <span>Somatório ponderado</span>
            <strong>{formatarPontuacao(somatorioPonderado)}</strong>
          </div>
          <div>
            <span>Modo de peso</span>
            <strong>{usarPesosIguais ? "Igual (1.0)" : "Tabela UFSC"}</strong>
          </div>
        </div>
      ) : null}

      <div className="course-grid">
        {cursoSelecionado
          ? DISCIPLINAS_OBJETIVAS.map((disciplina) => {
              const estadoDisciplinaAtual = estadoDisciplinas[disciplina.chave];
              const pesoDisciplina = usarPesosIguais
                ? 1
                : cursoSelecionado.pesos[disciplina.chave];
              const corteDisciplina = cursoSelecionado.cortes[disciplina.chave];
              const notaDisciplina = totaisDisciplinas[disciplina.chave];
              const abaixoDoCorte =
                exibirCortes && notaDisciplina > 0 && notaDisciplina < corteDisciplina;

              return (
                <div
                  key={disciplina.chave}
                  className={`discipline-card ${abaixoDoCorte ? "alert" : ""}`}
                >
                  <button
                    className={`discipline-summary ${exibirCortes ? "" : "no-cutoff"}`}
                    type="button"
                    onClick={() => onDisciplinaAberturaToggle(disciplina.chave)}
                  >
                    <div>
                      <p className="course-label">{disciplina.rotulo}</p>
                      <span className="course-key">{disciplina.chave}</span>
                    </div>

                    <div className="discipline-meta">
                      <span>Peso</span>
                      <strong>{pesoDisciplina}</strong>
                    </div>

                    {exibirCortes ? (
                      <div className="discipline-meta">
                        <span>Min. (corte)</span>
                        <strong>{corteDisciplina}</strong>
                      </div>
                    ) : null}

                    <div className="discipline-meta">
                      <span>Sua nota</span>
                      <strong>{formatarPontuacao(notaDisciplina)}</strong>
                    </div>

                    <span
                      className={`discipline-caret ${
                        estadoDisciplinaAtual.aberta ? "open" : ""
                      }`}
                    />
                  </button>

                  {estadoDisciplinaAtual.aberta ? (
                    <div className="discipline-body">
                      <div className="discipline-controls">
                        <label>
                          Quantidade de questões
                          <input
                            type="number"
                            min={0}
                            placeholder="Ex: 12"
                            value={exibirValor(estadoDisciplinaAtual.quantidadeQuestoes)}
                            onChange={(evento) =>
                              onQuantidadeQuestoesDisciplinaChange(
                                disciplina.chave,
                                evento.target.value,
                              )
                            }
                          />
                        </label>

                        <label>
                          Nota direta da disciplina
                          <input
                            type="number"
                            min={0}
                            step={0.1}
                            placeholder="Ex: 6.50"
                            value={exibirValor(estadoDisciplinaAtual.notaDireta)}
                            disabled={!estadoDisciplinaAtual.notaDiretaAtiva}
                            onChange={(evento) =>
                              onNotaDiretaDisciplinaChange(
                                disciplina.chave,
                                evento.target.value,
                              )
                            }
                          />
                        </label>

                        <label className="toggle small">
                          <input
                            type="checkbox"
                            checked={estadoDisciplinaAtual.notaDiretaAtiva}
                            onChange={(evento) =>
                              onNotaDiretaDisciplinaToggle(
                                disciplina.chave,
                                evento.target.checked,
                              )
                            }
                          />
                          Usar nota direta
                        </label>

                        <button
                          className="ghost"
                          onClick={() => onZerarRespostasDisciplina(disciplina.chave)}
                          type="button"
                        >
                          Zerar respostas
                        </button>
                      </div>

                      {estadoDisciplinaAtual.questoes.length === 0 ? (
                        <p className="helper">
                          Defina a quantidade de questões para calcular a
                          pontuação desta disciplina.
                        </p>
                      ) : (
                        <div className="discipline-questions">
                          {estadoDisciplinaAtual.questoes.map(
                            (questao, indiceQuestao) => {
                              const resultadoQuestao = calcularPontuacaoQuestao(
                                questao,
                                valorQuestao,
                              );
                              const notaBrutaQuestao = Math.max(0, resultadoQuestao.bruta);

                              return (
                                <div
                                  key={`${disciplina.chave}-${indiceQuestao}`}
                                  className="discipline-question"
                                >
                                  <header>
                                    <div>
                                      <p>
                                        Questão{" "}
                                        {String(indiceQuestao + 1).padStart(2, "0")}
                                      </p>
                                      <h4>{formatarPontuacao(notaBrutaQuestao)} pts</h4>
                                    </div>
                                    <span className="badge">
                                      {formatarPontuacao(notaBrutaQuestao)}
                                    </span>
                                  </header>

                                  <div className="question-inputs">
                                    <label>
                                      Candidato (soma marcada)
                                      <input
                                        type="number"
                                        min={0}
                                        placeholder="Ex: 04"
                                        value={exibirValor(questao.candidato)}
                                        onChange={(evento) =>
                                          onQuestaoDisciplinaChange(
                                            disciplina.chave,
                                            indiceQuestao,
                                            "candidato",
                                            evento.target.value,
                                          )
                                        }
                                      />
                                    </label>

                                    <label>
                                      Gabarito (soma correta)
                                      <input
                                        type="number"
                                        min={0}
                                        placeholder="Ex: 03"
                                        value={exibirValor(questao.gabarito)}
                                        onChange={(evento) =>
                                          onQuestaoDisciplinaChange(
                                            disciplina.chave,
                                            indiceQuestao,
                                            "gabarito",
                                            evento.target.value,
                                          )
                                        }
                                      />
                                    </label>

                                    <label>
                                      Maior proposição
                                      <select
                                        value={String(questao.maximoProposicao)}
                                        onChange={(evento) =>
                                          onQuestaoDisciplinaChange(
                                            disciplina.chave,
                                            indiceQuestao,
                                            "maximoProposicao",
                                            evento.target.value,
                                          )
                                        }
                                      >
                                        {VALORES_MAX_PROPOSICAO.map((valor) => (
                                          <option key={valor} value={valor}>
                                            {String(valor).padStart(2, "0")}
                                          </option>
                                        ))}
                                        <option value="aberta">Aberta</option>
                                      </select>
                                    </label>

                                    <label className="toggle small">
                                      <input
                                        type="checkbox"
                                        checked={questao.notaDiretaAtiva}
                                        onChange={(evento) =>
                                          onNotaDiretaQuestaoToggle(
                                            disciplina.chave,
                                            indiceQuestao,
                                            evento.target.checked,
                                          )
                                        }
                                      />
                                      Usar nota direta
                                    </label>

                                    <label>
                                      Nota da questão (pts)
                                      <input
                                        type="number"
                                        min={0}
                                        step={0.1}
                                        placeholder="Ex: 0.80"
                                        value={exibirValor(questao.notaDireta)}
                                        disabled={!questao.notaDiretaAtiva}
                                        onChange={(evento) =>
                                          onQuestaoDisciplinaChange(
                                            disciplina.chave,
                                            indiceQuestao,
                                            "notaDireta",
                                            evento.target.value,
                                          )
                                        }
                                      />
                                    </label>
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })
          : null}

        {cursoSelecionado
          ? DISCIPLINAS_ESPECIAIS.map((disciplina) => {
              const pesoDisciplina = usarPesosIguais
                ? 1
                : cursoSelecionado.pesos[disciplina.chave];
              const corteDisciplina = cursoSelecionado.cortes[disciplina.chave];
              const notaDisciplina = totaisDisciplinas[disciplina.chave];
              const abaixoDoCorte =
                exibirCortes && notaDisciplina > 0 && notaDisciplina < corteDisciplina;

              return (
                <div
                  key={disciplina.chave}
                  className={`discipline-static ${abaixoDoCorte ? "alert" : ""} ${
                    exibirCortes ? "" : "no-cutoff"
                  }`}
                >
                  <div>
                    <p className="course-label">{disciplina.rotulo}</p>
                    <span className="course-key">{disciplina.chave}</span>
                    <span className="discipline-note">
                      {disciplina.chave === "RDC"
                        ? "Usa o campo de redação acima"
                        : "Usa o campo de discursivas acima"}
                    </span>
                  </div>

                  <div className="discipline-meta">
                    <span>Peso</span>
                    <strong>{pesoDisciplina}</strong>
                  </div>

                  {exibirCortes ? (
                    <div className="discipline-meta">
                      <span>Min. (corte)</span>
                      <strong>{corteDisciplina}</strong>
                    </div>
                  ) : null}

                  <div className="discipline-meta">
                    <span>Sua nota</span>
                    <strong>{formatarPontuacao(notaDisciplina)}</strong>
                  </div>
                </div>
              );
            })
          : null}
      </div>

      <p className="helper">
        Abra cada disciplina para inserir o somatório das questões. O somatório
        ponderado multiplica cada nota pelo peso do curso. Se já tiver a nota
        pronta, use "nota direta". Em questões abertas, só pontua se candidato =
        gabarito.
      </p>
    </section>
  );
};

export default PainelCurso;
