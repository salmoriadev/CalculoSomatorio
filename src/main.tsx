/**
 * Arquivo de entrada da aplicação React.
 * Responsável por montar o componente `App` no elemento `#root`
 * e inicializar medições de performance da Vercel.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
);
