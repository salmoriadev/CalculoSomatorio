# Arquitetura da Calculadora

Diagrama de responsabilidades dos arquivos principais.

```mermaid
flowchart TD
    A[src/main.tsx\nEntrada React + Speed Insights] --> B[src/App.tsx\nEstado global e orquestração]

    B --> C1[src/components/SecaoPrincipal.tsx\nCabeçalho e meta]
    B --> C2[src/components/PainelControles.tsx\nControles gerais]
    B --> C3[src/components/PainelCurso.tsx\nFluxo por curso/disciplina]
    B --> C4[src/components/PainelQuestoesLivres.tsx\nFluxo livre]
    C3 --> C7[src/components/CamposQuestao.tsx\nCampos reutilizáveis de questão]
    C4 --> C7
    B --> C5[src/components/SobreposicaoConfiguracao.tsx\nEscolha de modo]
    B --> C6[src/components/SecaoRodape.tsx\nResumo final]

    B --> D1[src/data/cursos.ts\nCursos, pesos e cortes]
    B --> D2[src/data/disciplinas.ts\nMetadados e contagens padrão]
    B --> D3[src/data/historicoNotas.ts\nHistórico para metas]

    B --> U1[src/utils/construtores.ts\nEstado inicial]
    B --> U2[src/utils/formatacao.ts\nSanitização/formatos]
    B --> U3[src/utils/pontuacao.ts\nRegra de cálculo]
    B --> U4[src/utils/manipulacaoQuestoes.ts\nAtualizações imutáveis]

    B --> T[src/types/prova.ts\nTipos de domínio]
    G[src/index.css\nTema global] --> A
    H[src/App.css\nLayout e componentes] --> B
```

## Resumo rápido
- `App.tsx` é o núcleo da lógica.
- `components/` cuida da interface e interação.
- `data/` centraliza dados e parsing.
- `utils/` contém regras reutilizáveis e manipulação de estado.
- `types/prova.ts` define o contrato de tipos da aplicação.
