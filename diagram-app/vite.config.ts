import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve, normalize } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const root = dirname(fileURLToPath(import.meta.url));
// Canonical diagram JSON lives in the Sphinx source tree; this app reads/writes it.
const DIAGRAMS_DIR = resolve(root, "../docs/source/diagrams");

/** Resolve a diagram id (e.g. "high_level/general_data_flow") to its JSON path, guarding traversal. */
function diagramPath(id: string): string {
  const p = normalize(resolve(DIAGRAMS_DIR, `${id}.json`));
  if (!p.startsWith(DIAGRAMS_DIR)) throw new Error(`Illegal diagram id: ${id}`);
  return p;
}

function idFromUrl(url: string): string {
  // /api/diagram/high_level/general_data_flow  ->  high_level/general_data_flow
  return decodeURIComponent(url.replace(/^\/api\/diagram\//, "").split("?")[0]);
}

/**
 * Dev-only API for reading and (for the editor) writing diagram JSON on disk.
 * This middleware exists ONLY on the dev server — the production `vite build`
 * output has no such endpoint, so the published viewer is strictly read-only.
 */
function diagramApiPlugin(): Plugin {
  return {
    name: "aind-diagram-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/api/diagram/")) return next();
        const id = idFromUrl(req.url);
        let file: string;
        try {
          file = diagramPath(id);
        } catch (e) {
          res.statusCode = 400;
          return res.end(String(e));
        }

        if (req.method === "GET") {
          if (!existsSync(file)) {
            res.statusCode = 404;
            return res.end(`No diagram: ${id}`);
          }
          res.setHeader("Content-Type", "application/json");
          return res.end(readFileSync(file, "utf8"));
        }

        if (req.method === "POST" || req.method === "PUT") {
          const chunks: Buffer[] = [];
          req.on("data", (c) => chunks.push(c as Buffer));
          req.on("end", () => {
            try {
              const body = Buffer.concat(chunks).toString("utf8");
              JSON.parse(body); // validate before writing
              mkdirSync(dirname(file), { recursive: true });
              writeFileSync(file, body.endsWith("\n") ? body : body + "\n", "utf8");
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true, id }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ ok: false, error: String(e) }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end("Method not allowed");
      });
    },
  };
}

export default defineConfig(({ command }) => ({
  root,
  plugins: [react(), diagramApiPlugin()],
  // Library builds don't inline process.env.NODE_ENV, which React reads at runtime.
  // (The dev server sets it automatically, so only define it for `vite build`.)
  ...(command === "build" ? { define: { "process.env.NODE_ENV": JSON.stringify("production") } } : {}),
  build: {
    outDir: resolve(root, "../docs/source/_static/diagrams-app"),
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      // Viewer only. The editor (editor.html) is a dev-time entry and is never built.
      entry: resolve(root, "src/main-viewer.tsx"),
      formats: ["es"],
      fileName: () => "diagrams.js",
    },
    rollupOptions: {
      output: { assetFileNames: "diagrams.[ext]" },
    },
  },
}));
