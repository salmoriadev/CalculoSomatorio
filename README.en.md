# UFSC Summatory Calculator

[Leia este documento em português](./README.md)

Web app to simulate UFSC summatory scoring, including per-question calculation, essay/discursive sections, and course-specific weights.

## Architecture
- Diagram and file responsibilities: `docs/ARQUITETURA.md`

## Main features
- Official UFSC per-question formula.
- Support for proposition-sum questions (`01, 02, 04, 08, 16, 32, 64`) and open questions.
- Three exam modes: `final`, `meio` (mid-year), and `livre` (free mode).
- Approval target based on history (`highest`, `latest`, `average`) or custom target.
- Course weights, cutoffs, and PMC.
- Equal-weights mode (`1.0`) for all disciplines.
- Direct score override per discipline and per question.
- Responsive UI for desktop and mobile.

## Formula
`P = (NP - (NTPC - (NPC - NPI))) / NP`

If the result is negative, the question score is set to zero.

## Stack
- React 19
- TypeScript 5
- Vite 7
- CSS

## Local development
1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`
3. Build for production:
   - `npm run build`
4. Run lint:
   - `npm run lint`
5. Preview build:
   - `npm run preview`

## Data source
Weights, cutoffs, and PMC are based on the official UFSC unified entrance exam table.

## Note
This is an unofficial simulator.
