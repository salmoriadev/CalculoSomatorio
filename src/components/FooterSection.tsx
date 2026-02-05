import type { Summary } from "../types/exam";
import { formatScore } from "../utils/format";

type FooterSectionProps = {
  summary: Summary;
};

const FooterSection = ({ summary }: FooterSectionProps) => (
  <footer className="panel footer">
    <div>
      <h2>Resumo final</h2>
      <p>
        Resultado objetivo:{" "}
        <strong>{formatScore(summary.objectiveScore)}</strong> pontos. Total
        geral: <strong>{formatScore(summary.total)}</strong> pontos.
      </p>
    </div>
    <div className="footer-tip">
      <span>Fórmula oficial</span>
      <strong>P = (NP - (NTPC - (NPC - NPI))) / NP</strong>
      <div className="footer-credits">
        <span>Feito por</span>
        <a
          href="https://www.linkedin.com/in/arthursalmoria"
          target="_blank"
          rel="noreferrer"
        >
          Arthur de Farias Salmoria
        </a>
        <div className="footer-socials">
          <a
            href="https://www.linkedin.com/in/arthursalmoria"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <img src="/linkedin.png" alt="LinkedIn" />
          </a>
          <a
            href="https://github.com/salmoriadev"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <img src="/github.webp" alt="GitHub" />
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default FooterSection;
