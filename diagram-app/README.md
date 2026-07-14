# diagram-app

Interactive [React Flow](https://reactflow.dev/) diagrams for the AIND software docs,
plus a **local-only editor**. Diagrams are stored as JSON (the canonical source of
truth) under `../docs/source/diagrams/`, organised by level
(`high_level/`, `mid_level/`, `low_level/`, `dynamic_foraging/`).

## Concepts

- **Canonical format** — each diagram is a JSON file (`<level>/<name>.json`) of
  React Flow `nodes` + `edges`. See [`src/types.ts`](src/types.ts). This replaces the
  old draw.io `.drawio` / `.drawio.svg` files.
- **Click-to-expand hierarchy** — a node may declare `data.childDiagram` (another
  diagram id). In the viewer, clicking that node reveals the child diagram nested
  *inside* it; a **✕ collapse** button closes it again.
- **Viewer vs editor** — the read-only viewer ships in the published docs; the editor
  runs only on your machine and writes changes back to the JSON files.

## Commands

```bash
npm install            # once

npm run dev            # read-only viewer at http://localhost:5173
npm run edit           # local EDITOR (edit + save to disk) at /editor.html
npm run build          # bundle the viewer into ../docs/source/_static/diagrams-app/
npm run convert        # one-time: import any remaining .drawio files -> JSON
```

### Editing diagrams

`npm run edit` opens the editor. Load a diagram by id (e.g. `high_level/general_data_flow`),
then drag nodes, draw edges (drag between nodes), edit the selected node in the
Inspector (type/label/colour/**child-diagram link**), add nodes, or Delete to remove.
Click **Save** to write back to `docs/source/diagrams/<id>.json`.

> The save endpoint (`POST /api/diagram/:id`) exists **only** on the dev server, via a
> plugin in [`vite.config.ts`](vite.config.ts). The production bundle has no write path,
> so the published docs are strictly read-only.

## How it ships in the docs

1. `npm run build` bundles the viewer to `docs/source/_static/diagrams-app/diagrams.{js,css}`
   (git-ignored; rebuilt by the Read the Docs `pre_build` job — see `.readthedocs.yaml`).
2. A `build-finished` hook in `docs/source/conf.py` copies the diagram JSON into
   `_static/diagrams/` so the viewer can fetch it at runtime.
3. A page embeds a diagram with a raw-HTML block:
   ```html
   <div class="rf-diagram" data-diagram="high_level/general_data_flow" style="height:620px"></div>
   <script type="module" src="../_static/diagrams-app/diagrams.js"></script>
   ```

To preview the full docs locally: `npm run build`, then `cd ../docs && make html`.
