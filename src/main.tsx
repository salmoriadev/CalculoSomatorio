/**
 * Arquivo de entrada da aplicação React.
 * Responsável por montar o componente `App` no elemento `#root`.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
