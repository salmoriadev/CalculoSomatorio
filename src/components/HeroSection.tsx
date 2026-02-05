import { useEffect, useMemo, useRef, useState } from "react";
import type { Summary } from "../types/exam";
import type { TargetMode } from "../data/scoreHistory";
import { formatScore } from "../utils/format";

type HeroSectionProps = {
  theme: "dark" | "light";
  targetMode: TargetMode;
  targetScore: number | null;
  summary: Summary;
  customTargetScore: number;
  onCustomTargetChange: (value: string) => void;
  onTargetModeChange: (value: TargetMode) => void;
  onToggleTheme: () => void;
};

const HeroSection = ({
  theme,
  targetMode,
  targetScore,
  summary,
  customTargetScore,
  onCustomTargetChange,
  onTargetModeChange,
  onToggleTheme,
}: HeroSectionProps) => {
  const logoSrc =
    theme === "light"
      ? "/vertical_sigla_fundo_claro.png"
      : "/brasao_site_ufsc.svg";
  const [isTargetMenuOpen, setIsTargetMenuOpen] = useState(false);
  const customInputRef = useRef<HTMLInputElement | null>(null);
  const targetMenuRef = useRef<HTMLDivElement | null>(null);
  const options = useMemo(
    () => [
      {
        value: "max",
        shortLabel: "Maior nota",
        label: `Maior nota`,
      },
      {
        value: "latest",
        shortLabel: "Última nota",
        label: `Última nota registrada`,
      },
      {
        value: "average",
        shortLabel: "Média das notas",
        label: `Média das notas`,
      },
      {
        value: "custom",
        shortLabel: "Meta personalizada",
        label: "Meta personalizada",
      },
    ],
    [],
  );
  const selectedOption =
    options.find((option) => option.value === targetMode) ?? options[0];
  const targetDelta = targetScore == null ? null : targetScore - summary.total;
  const statusLabel =
    targetDelta == null
      ? ""
      : targetDelta > 0
        ? `Faltam ${formatScore(targetDelta)} pontos.`
        : targetDelta < 0
          ? `Passou ${formatScore(Math.abs(targetDelta))} pontos.`
          : "Meta atingida.";
  const statusClass =
    targetDelta == null ? "" : targetDelta > 0 ? "danger" : "success";

  useEffect(() => {
    if (targetMode !== "custom") return;
    customInputRef.current?.focus();
  }, [targetMode]);

  useEffect(() => {
    if (!isTargetMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!targetMenuRef.current?.contains(target)) {
        setIsTargetMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTargetMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTargetMenuOpen]);

  return (
    <>
      <div className="site-header">
        <div className="site-header__inner">
          <div className="site-brand">
            <span className="logo-badge">
              <img src={logoSrc} alt="UFSC" loading="lazy" />
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
            onClick={onToggleTheme}
            aria-pressed={theme === "dark"}
          >
            <span className="theme-indicator" />
            {theme === "dark" ? "Tema claro" : "Tema escuro"}
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
            <div className="target-select__wrapper" ref={targetMenuRef}>
              <button
                className="target-select"
                type="button"
                onClick={() => setIsTargetMenuOpen((current) => !current)}
                aria-haspopup="listbox"
                aria-expanded={isTargetMenuOpen}
              >
                <span>{selectedOption.shortLabel}</span>
                <span
                  className={`target-select__caret ${isTargetMenuOpen ? "open" : ""}`}
                />
              </button>

              {isTargetMenuOpen ? (
                <ul
                  className="target-select__menu"
                  role="listbox"
                  aria-label="Meta de aprovação"
                >
                  {options.map((option) => (
                    <li key={option.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={option.value === targetMode}
                        className={`target-select__option ${
                          option.value === targetMode ? "active" : ""
                        }`}
                        onClick={() => {
                          onTargetModeChange(option.value as TargetMode);
                          setIsTargetMenuOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            {targetMode === "custom" ? (
              <input
                ref={customInputRef}
                type="number"
                min={0}
                step={0.1}
                placeholder="Digite sua meta"
                value={customTargetScore === 0 ? "" : customTargetScore}
                onChange={(event) => onCustomTargetChange(event.target.value)}
              />
            ) : null}
          </div>
          <div className="metric-summary-card">
            {targetScore != null ? (
              <>
                <span>Meta:</span>
                <strong>{formatScore(targetScore)}</strong>
                <span className={`target-status ${statusClass}`}>
                  {statusLabel}
                </span>
              </>
            ) : (
              <span>
                {targetMode === "custom"
                  ? "Defina sua meta personalizada."
                  : "Sem histórico disponível para este curso."}
              </span>
            )}
          </div>
          <div>
            <span>Total objetivo</span>
            <strong>{formatScore(summary.objectiveScore)}</strong>
          </div>
          <div>
            <span>Total geral</span>
            <strong>{formatScore(summary.total)}</strong>
          </div>
        </div>
      </header>
    </>
  );
};

export default HeroSection;
