/**
 * One-time converter: draw.io (.drawio / .drawio.svg) -> canonical diagram JSON.
 *
 * Run with `npm run convert`. After the JSON is reviewed, the .drawio/.drawio.svg
 * files can be retired — the JSON is the source of truth going forward.
 *
 * Best-effort: draw.io's shape library is collapsed into five node types, so
 * expect to tidy diagrams in the local editor afterwards.
 */
import { XMLParser } from "fast-xml-parser";
import { inflateRaw } from "pako";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, resolve, sep } from "node:path";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import type { Diagram, DiagramEdge, DiagramLevel, DiagramNode, NodeKind } from "../src/types";

const root = dirname(fileURLToPath(import.meta.url));
const DIAGRAMS_DIR = resolve(root, "../../docs/source/diagrams");

/**
 * Authored click-to-expand links (POC). Maps a diagram id -> { nodeId: childDiagramId }.
 * In production these are set through the editor; kept here so the converter is reproducible.
 */
const LINKS: Record<string, Record<string, string>> = {
  "high_level/general_data_flow": {
    // "Process / Analyze / QC" node -> mid-level QC diagram
    "JjBYBWJynipTyZ9cGDEI-12": "mid_level/QC",
  },
};

// -- helpers -----------------------------------------------------------------

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".drawio")) out.push(p);
  }
  return out;
}

function parseStyle(style: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (style || "").split(";")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq === -1) out[part] = "true";
    else out[part.slice(0, eq)] = part.slice(eq + 1);
  }
  return out;
}

function cleanLabel(value: unknown): string {
  if (value == null) return "";
  return String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .split("\n")
    .map((l) => l.trim())
    .filter((l, i, a) => !(l === "" && (i === 0 || i === a.length - 1)))
    .join("\n")
    .trim();
}

function nodeType(style: Record<string, string>): NodeKind {
  const shape = style["shape"] ?? "";
  if (shape.startsWith("cylinder")) return "datastore";
  if ("ellipse" in style || shape === "ellipse") return "process";
  if ("text" in style && (style["fillColor"] === "none" || style["strokeColor"] === "none"))
    return "label";
  const fill = style["fillColor"];
  const noFill = !fill || fill === "none" || fill === "default";
  if (style["container"] === "1" || (style["dashed"] === "1" && noFill)) return "group";
  return "entity";
}

function levelFor(id: string): DiagramLevel {
  if (id.includes("high_level")) return "high";
  if (id.includes("mid_level")) return "mid";
  if (id.includes("low_level")) return "low";
  return "domain";
}

// -- conversion --------------------------------------------------------------

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) => name === "mxCell" || name === "diagram",
});

function getGraphModel(diagramNode: any): any {
  if (diagramNode.mxGraphModel) return diagramNode.mxGraphModel;
  // Compressed content: base64 -> raw inflate -> URI-decode -> parse.
  const text = typeof diagramNode === "string" ? diagramNode : diagramNode["#text"];
  if (!text) return null;
  const bytes = Uint8Array.from(Buffer.from(text, "base64"));
  const xml = decodeURIComponent(inflateRaw(bytes, { to: "string" }));
  return parser.parse(xml).mxGraphModel;
}

function convert(file: string): Diagram {
  const id = relative(DIAGRAMS_DIR, file).replace(/\.drawio$/, "").split(sep).join("/");
  const xml = readFileSync(file, "utf8");
  const doc = parser.parse(xml);
  const diagrams = doc.mxfile?.diagram ?? [];
  const model = getGraphModel(diagrams[0]);
  const cells: any[] = model?.root?.mxCell ?? [];

  const vertexIds = new Set(cells.filter((c) => c["@_vertex"] === "1").map((c) => c["@_id"]));
  const links = LINKS[id] ?? {};

  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  const edgeLabels: Record<string, string> = {};

  for (const c of cells) {
    const cid = c["@_id"];
    const style = parseStyle(c["@_style"] ?? "");

    if (c["@_edge"] === "1") {
      const source = c["@_source"];
      const target = c["@_target"];
      if (!source || !target) continue;
      edges.push({
        id: cid,
        source,
        target,
        label: cleanLabel(c["@_value"]) || undefined,
        noArrow: style["endArrow"] === "none" || undefined,
      });
      continue;
    }

    if (c["@_vertex"] === "1") {
      const geo = Array.isArray(c.mxGeometry) ? c.mxGeometry[0] : c.mxGeometry;
      const parent = c["@_parent"];
      nodes.push({
        id: cid,
        type: nodeType(style),
        position: { x: Number(geo?.["@_x"] ?? 0), y: Number(geo?.["@_y"] ?? 0) },
        width: geo?.["@_width"] ? Number(geo["@_width"]) : undefined,
        height: geo?.["@_height"] ? Number(geo["@_height"]) : undefined,
        ...(parent && vertexIds.has(parent) ? { parentId: parent } : {}),
        data: {
          // Deliberately drop draw.io's raw fillColor/strokeColor — the viewer
          // renders a curated palette per node `type` instead (see src/nodes).
          label: cleanLabel(c["@_value"]),
          ...(links[cid] ? { childDiagram: links[cid] } : {}),
        },
      });
      continue;
    }

    // Edge-label child cell: value belongs to its parent edge.
    if (c["@_connectable"] === "0" && c["@_value"]) {
      edgeLabels[c["@_parent"]] = cleanLabel(c["@_value"]);
    }
  }

  for (const e of edges) if (!e.label && edgeLabels[e.id]) e.label = edgeLabels[e.id];

  return { id, level: levelFor(id), nodes, edges };
}

// -- main --------------------------------------------------------------------

const files = walk(DIAGRAMS_DIR);
if (files.length === 0) {
  console.error(`No .drawio files found under ${DIAGRAMS_DIR}`);
  process.exit(1);
}

let ok = 0;
for (const file of files) {
  try {
    const diagram = convert(file);
    const outPath = join(DIAGRAMS_DIR, `${diagram.id}.json`);
    if (!existsSync(dirname(outPath))) mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(diagram, null, 2) + "\n", "utf8");
    console.log(`✓ ${diagram.id}  (${diagram.nodes.length} nodes, ${diagram.edges.length} edges)`);
    ok++;
  } catch (e) {
    console.error(`✗ ${file}: ${e}`);
  }
}
console.log(`\nConverted ${ok}/${files.length} diagram(s) into ${DIAGRAMS_DIR}`);
