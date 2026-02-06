/**
 * Seção superior da página (hero).
 * Exibe resumo de meta, seletor de referência de meta e totais principais.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { ModoMeta } from "../data/historicoNotas";
import type { Resumo } from "../types/prova";
import { formatarPontuacao } from "../utils/formatacao";

type PropriedadesSecaoPrincipal = {
  tema: "dark" | "light";
  modoMeta: ModoMeta;
  pontuacaoMeta: number | null;
  resumo: Resumo;
  valorMetaPersonalizada: number;
  onMetaPersonalizadaChange: (valor: string) => void;
  onModoMetaChange: (valor: ModoMeta) => void;
  onTemaToggle: () => void;
};

type OpcaoMeta = {
  valor: ModoMeta;
  rotuloCurto: string;
  rotuloLista: string;
};

const SecaoPrincipal = ({
  tema,
  modoMeta,
  pontuacaoMeta,
  resumo,
  valorMetaPersonalizada,
  onMetaPersonalizadaChange,
  onModoMetaChange,
  onTemaToggle,
}: PropriedadesSecaoPrincipal) => {
  const logoUfsc =
    tema === "light"
      ? "/vertical_sigla_fundo_claro.png"
      : "/brasao_site_ufsc.svg";

  const [menuMetaAberto, setMenuMetaAberto] = useState(false);
  const referenciaCampoMetaPersonalizada = useRef<HTMLInputElement | null>(
    null,
  );
  const referenciaMenuMeta = useRef<HTMLDivElement | null>(null);

  const opcoesMeta = useMemo<OpcaoMeta[]>(
    () => [
      {
        valor: "maior",
        rotuloCurto: "Maior nota",
        rotuloLista: "Maior nota dos últimos anos (2023-2026)",
      },
      {
        valor: "ultima",
        rotuloCurto: "Última nota",
        rotuloLista: "Última nota registrada (2026)",
      },
      {
        valor: "media",
        rotuloCurto: "Média das notas",
        rotuloLista: "Média das notas dos últimos anos (2023-2026)",
      },
      {
        valor: "personalizada",
        rotuloCurto: "Meta personalizada",
        rotuloLista: "Meta personalizada",
      },
    ],
    [],
  );

  const opcaoMetaSelecionada =
    opcoesMeta.find((opcao) => opcao.valor === modoMeta) ?? opcoesMeta[0];

  const diferencaParaMeta =
    pontuacaoMeta == null ? null : pontuacaoMeta - resumo.total;

  const textoStatusMeta =
    diferencaParaMeta == null
      ? ""
      : diferencaParaMeta > 0
        ? `Faltam ${formatarPontuacao(diferencaParaMeta)} pontos.`
        : diferencaParaMeta < 0
          ? `Passou ${formatarPontuacao(Math.abs(diferencaParaMeta))} pontos.`
          : "Meta atingida.";

  const classeStatusMeta =
    diferencaParaMeta == null
      ? ""
      : diferencaParaMeta > 0
        ? "danger"
        : "success";

  useEffect(() => {
    if (modoMeta !== "personalizada") return;
    referenciaCampoMetaPersonalizada.current?.focus();
  }, [modoMeta]);

  useEffect(() => {
    if (!menuMetaAberto) return;

    const aoClicarFora = (evento: MouseEvent) => {
      const elementoAlvo = evento.target as Node;
      if (!referenciaMenuMeta.current?.contains(elementoAlvo)) {
        setMenuMetaAberto(false);
      }
    };

    const aoPressionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        setMenuMetaAberto(false);
      }
    };

    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoPressionarTecla);

    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoPressionarTecla);
    };
  }, [menuMetaAberto]);

  return (
    <>
      <div className="site-header">
        <div className="site-header__inner">
          <div className="site-brand">
            <span className="logo-badge">
              <img src={logoUfsc} alt="UFSC" loading="lazy" />
            </span>

            <div>
              <span className="site-title">
                Universidade Federal de Santa Catarina
              </span>
              <span className="site-subtitle">
                Calculadora de Somatório UFSC
              </span>
            </div>
          </div>

          <button
            className="theme-toggle"
            type="button"
            onClick={onTemaToggle}
            aria-pressed={tema === "dark"}
          >
            <span className="theme-indicator" />
            {tema === "dark" ? "Tema claro" : "Tema escuro"}
          </button>
        </div>
      </div>

      <header className="hero panel">
        <div>
          <p className="eyebrow">
            A Nova Calculadora de Metas e Notas do Vestibular da UFSC
          </p>
          <h1>Simule sua pontuação com precisão e estratégia.</h1>
          <p className="lead">
            Fórmula oficial aplicada por questão:
            <strong> P = (NP - (NTPC - (NPC - NPI))) / NP</strong>. Se o
            resultado for negativo, a questão vale zero. Todas as metas criadas
            são feitas com bases em dados do vestibular da UFSC, com dados das
            provas de 2023 a 2026.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="metric-input">
            <span>Meta de aprovação</span>

            <div className="target-select__wrapper" ref={referenciaMenuMeta}>
              <button
                className="target-select"
                type="button"
                onClick={() => setMenuMetaAberto((aberto) => !aberto)}
                aria-haspopup="listbox"
                aria-expanded={menuMetaAberto}
              >
                <span>{opcaoMetaSelecionada.rotuloCurto}</span>
                <span
                  className={`target-select__caret ${menuMetaAberto ? "open" : ""}`}
                />
              </button>

              {menuMetaAberto ? (
                <ul
                  className="target-select__menu"
                  role="listbox"
                  aria-label="Meta de aprovação"
                >
                  {opcoesMeta.map((opcao) => (
                    <li key={opcao.valor}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={opcao.valor === modoMeta}
                        className={`target-select__option ${
                          opcao.valor === modoMeta ? "active" : ""
                        }`}
                        onClick={() => {
                          onModoMetaChange(opcao.valor);
                          setMenuMetaAberto(false);
                        }}
                      >
                        {opcao.rotuloLista}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {modoMeta === "personalizada" ? (
              <input
                ref={referenciaCampoMetaPersonalizada}
                type="number"
                min={0}
                step={0.1}
                placeholder="Digite sua meta"
                value={
                  valorMetaPersonalizada === 0 ? "" : valorMetaPersonalizada
                }
                onChange={(evento) =>
                  onMetaPersonalizadaChange(evento.target.value)
                }
              />
            ) : null}
          </div>

          <div className="metric-summary-card">
            {pontuacaoMeta != null ? (
              <>
                <span>Meta:</span>
                <strong>{formatarPontuacao(pontuacaoMeta)}</strong>
                <span className={`target-status ${classeStatusMeta}`}>
                  {textoStatusMeta}
                </span>
              </>
            ) : (
              <span>
                {modoMeta === "personalizada"
                  ? "Defina sua meta personalizada."
                  : "Sem histórico disponível para este curso."}
              </span>
            )}
          </div>

          <div>
            <span>Total objetivo</span>
            <strong>{formatarPontuacao(resumo.pontuacaoObjetiva)}</strong>
          </div>

          <div>
            <span>Total geral</span>
            <strong>{formatarPontuacao(resumo.total)}</strong>
          </div>
        </div>
      </header>
    </>
  );
};

export default SecaoPrincipal;
