import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../../src/App";

describe("App", () => {
  it("aplica modo meio com discursivas desativadas", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: /Prova de meio do ano/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /Começar simulação/i }),
    );

    expect(
      await screen.findByRole("heading", { name: /Pesos do curso/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sem discursivas")).toBeInTheDocument();
    expect(screen.getByLabelText("Discursivas")).toBeDisabled();
  });

  it("aplica modo livre e regenera quantidade de questões", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Livre escolha/i }));
    const quantidadeInicial = screen.getByLabelText(
      /Quantas questões você quer usar\?/i,
    );
    await user.clear(quantidadeInicial);
    await user.type(quantidadeInicial, "3");
    await user.click(
      screen.getByRole("button", { name: /Começar simulação/i }),
    );

    expect(await screen.findByText("Questão 03")).toBeInTheDocument();
    expect(screen.queryByText("Questão 04")).not.toBeInTheDocument();

    const totalQuestoes = screen.getByLabelText("Total de questões objetivas");
    expect(totalQuestoes).toHaveValue(3);

    await user.clear(totalQuestoes);
    await user.type(totalQuestoes, "5");
    await user.click(
      screen.getByRole("button", { name: /Gerar questões \(5\)/i }),
    );

    expect(await screen.findByText("Questão 05")).toBeInTheDocument();
  });

  it("zera respostas no modo livre", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Livre escolha/i }));
    const quantidadeInicial = screen.getByLabelText(
      /Quantas questões você quer usar\?/i,
    );
    await user.clear(quantidadeInicial);
    await user.type(quantidadeInicial, "1");
    await user.click(
      screen.getByRole("button", { name: /Começar simulação/i }),
    );

    const candidato = await screen.findByLabelText("Candidato (soma marcada)");
    await user.type(candidato, "5");
    expect(candidato).toHaveValue(5);

    const usarNotaDireta = screen.getByRole("checkbox", {
      name: "Usar nota direta",
    });
    await user.click(usarNotaDireta);
    const notaQuestao = screen.getByLabelText("Nota da questão (pts)");
    await user.type(notaQuestao, "2");
    expect(notaQuestao).toHaveValue(2);

    await user.click(screen.getByRole("button", { name: "Zerar respostas" }));

    expect(candidato).toHaveValue(null);
    expect(usarNotaDireta).not.toBeChecked();
    expect(notaQuestao).toBeDisabled();
    expect(notaQuestao).toHaveValue(null);
  });
});
