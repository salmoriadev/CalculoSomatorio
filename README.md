# UFSC Summatory Calculator

A premium, mobile-first web app to simulate the UFSC summatory scoring model. It supports official question scoring, essay and discursive sections, and course-specific weights from the UFSC 2025 unified entrance exam (UFSC/IFSC/IFC).

## Features
- UFSC summatory formula per question with no negative scores.
- Proposition sums with powers of two (01, 02, 04, 08, 16, 32, 64) and open questions.
- Three modes.
- Final exam mode with essay and discursive sections enabled by default.
- Mid-year mode with half the number of questions per discipline, essay enabled by default, discursive disabled by default.
- Free mode with custom question count and no discipline breakdown.
- Toggle essay and discursive sections any time (each capped at 10 points).
- Course weights, cutoffs, and PMC from the UFSC 2025 table (cutoffs are shown only in final mode).
- Equal-weight mode (all weights = 1.0) for quick comparisons.
- Direct score overrides per question and per discipline.
- Responsive layout designed for desktop and mobile.

## Scoring Model
The official per-question formula is:

P = (NP - (NTPC - (NPC - NPI))) / NP

Where:
- P is the score for the question.
- NP is the number of propositions in the question.
- NTPC is the number of correct propositions in the official key.
- NPC is the number of correct propositions marked by the candidate.
- NPI is the number of incorrect propositions marked by the candidate.

If the result is negative, the question score is set to zero.

Open questions only score if the candidate answer equals the official key.

## Tech Stack
- React 19
- TypeScript 5
- Vite 7
- Vanilla CSS

## Getting Started
1. Install dependencies.
   - npm install
2. Start the dev server.
   - npm run dev
3. Build for production.
   - npm run build
4. Preview the production build.
   - npm run preview

## Data Sources
Course weights, cutoffs, and PMC are based on the UFSC 2025 unified exam table (ANEXO A-3). This project is an unofficial simulator.

## Deployment
This is a static front-end app with no backend. This app is deployed directly to Vercel, an static hosting provider.
