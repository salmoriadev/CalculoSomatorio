/**
 * Rodapé informativo da simulação.
 * Mostra o resumo final e os créditos do projeto.
 */
import type { Resumo } from "../types/prova";
import { formatarPontuacao } from "../utils/formatacao";

type PropriedadesSecaoRodape = {
  resumo: Resumo;
};

const SecaoRodape = ({ resumo }: PropriedadesSecaoRodape) => (
  <footer className="panel footer">
    <div>
      <h2>Resumo final</h2>
      <p>
        Resultado objetivo: <strong>{formatarPontuacao(resumo.pontuacaoObjetiva)}</strong>{" "}
        pontos. Total geral: <strong>{formatarPontuacao(resumo.total)}</strong>{" "}
        pontos.
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

export default SecaoRodape;
