import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

/**
 * Viewer entry point. Mounts a read-only React Flow diagram into every
 * element with a `data-diagram` attribute (id of the diagram to show).
 * In the docs, such a <div> is injected via a raw-HTML block.
 */
function mountAll() {
  const targets = document.querySelectorAll<HTMLElement>("[data-diagram]");
  targets.forEach((el) => {
    const diagramId = el.dataset.diagram;
    if (!diagramId || el.dataset.mounted) return;
    el.dataset.mounted = "true";
    if (!el.style.height) el.style.height = "600px";
    createRoot(el).render(
      <StrictMode>
        <App diagramId={diagramId} />
      </StrictMode>,
    );
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountAll);
} else {
  mountAll();
}
