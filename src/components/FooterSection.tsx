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
        Resultado objetivo: <strong>{formatScore(summary.objectiveScore)}</strong>
        {" "}pontos. Total geral: <strong>{formatScore(summary.total)}</strong>
        {" "}pontos.
      </p>
    </div>
    <div className="footer-tip">
      <span>Fórmula oficial</span>
      <strong>P = (NP - (NTPC - (NPC - NPI))) / NP</strong>
    </div>
  </footer>
);

export default FooterSection;
