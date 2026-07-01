import type { NodeKind } from "./types";

export interface Palette {
  fill: string;
  stroke: string;
  text: string;
}

/**
 * One curated colour per node kind (Tailwind-ish 50/500/800 triplets). This
 * replaces draw.io's raw per-node fillColor/strokeColor — kind already carries
 * the semantic meaning (see the legend: entities=indigo, processes=sky,
 * datastores=emerald), so a fixed palette reads far cleaner than 30 slightly
 * different pastel hexes.
 */
export const PALETTE: Record<Exclude<NodeKind, "label">, Palette> = {
  entity: { fill: "#EEF2FF", stroke: "#6366F1", text: "#3730A3" },
  process: { fill: "#F0F9FF", stroke: "#0EA5E9", text: "#075985" },
  datastore: { fill: "#ECFDF5", stroke: "#10B981", text: "#065F46" },
  group: { fill: "rgba(100,116,139,0.05)", stroke: "#CBD5E1", text: "#475569" },
};

export const GROUP_EXPANDED: Palette = {
  fill: "rgba(99,102,241,0.05)",
  stroke: "#A5B4FC",
  text: "#4338CA",
};

export const LABEL_TEXT = "#475569";

/** Node data may carry an explicit override (set via the editor); fall back to the palette. */
export function resolvePalette(
  kind: Exclude<NodeKind, "label">,
  data: { fill?: string; stroke?: string },
  base: Palette = PALETTE[kind],
): Palette {
  return {
    fill: data.fill || base.fill,
    stroke: data.stroke || base.stroke,
    text: base.text,
  };
}
