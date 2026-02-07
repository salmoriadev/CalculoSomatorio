# Calculadora de Somatório UFSC

[Read this document in English](./README.en.md)

Aplicação web para simular a pontuação do somatório da UFSC, com suporte a cálculo por questão, redação, discursivas e pesos por curso.

## Arquitetura
- Diagrama e responsabilidades dos arquivos: `docs/ARQUITETURA.md`

## Principais recursos
- Cálculo por questão com a fórmula oficial da UFSC.
- Suporte para questões por somatório (01, 02, 04, 08, 16, 32, 64) e questões abertas.
- Três modos de prova: `final`, `meio` e `livre`.
- Meta de aprovação com histórico (`maior`, `última`, `média`) ou meta personalizada.
- Pesos por curso, pontos de corte e PMC.
- Opção para usar pesos iguais (`1.0`) em todas as disciplinas.
- Nota direta por disciplina e por questão.
- Interface responsiva para desktop e mobile.

## Fórmula usada
`P = (NP - (NTPC - (NPC - NPI))) / NP`

Se o resultado for negativo, a pontuação da questão é zerada.

## Tecnologias
- React 19
- TypeScript 5
- Vite 7
- CSS

## Como rodar localmente
1. Instale dependências:
   - `npm install`
2. Rode em desenvolvimento:
   - `npm run dev`
3. Gere build de produção:
   - `npm run build`
4. Rode lint:
   - `npm run lint`
5. Pré-visualize a build:
   - `npm run preview`

## Fonte dos dados
Os dados de pesos, cortes e PMC são baseados na tabela oficial do vestibular unificado da UFSC.

## Observação
Este projeto é um simulador não oficial.
