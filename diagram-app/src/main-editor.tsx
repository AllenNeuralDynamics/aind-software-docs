import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Editor from "./Editor";

const el = document.getElementById("editor-root");
if (el) {
  createRoot(el).render(
    <StrictMode>
      <Editor />
    </StrictMode>,
  );
}
