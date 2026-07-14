import { Handle, Position, type NodeProps, type NodeTypes } from "@xyflow/react";
import type { DiagramNodeData } from "../types";
import { useDiagramActions } from "../DiagramActions";
import { GROUP_EXPANDED, PALETTE, resolvePalette } from "../palette";

/**
 * Custom node types mapped from the original draw.io shapes. We deliberately
 * collapse draw.io's huge shape library into five families and render each
 * with a single curated palette (see ../palette.ts) rather than draw.io's raw
 * per-node colours; fidelity is approximate by design (JSON is now the source
 * of truth — clean up further in the editor).
 */

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const CARD_SHADOW = "0 1px 2px rgba(15,23,42,0.06), 0 2px 6px rgba(15,23,42,0.08)";

// Invisible handles on all four sides (both source & target), so edges can
// attach on whichever side is closest to the other node instead of always
// running top-to-bottom. The actual side is picked per-edge in lib/toFlow.ts
// based on node geometry, then passed as sourceHandle/targetHandle ids.
const HANDLE_STYLE = { opacity: 0, width: 1, height: 1, border: 0, minWidth: 0, minHeight: 0 };
const SIDES = [
  { id: "t", position: Position.Top },
  { id: "r", position: Position.Right },
  { id: "b", position: Position.Bottom },
  { id: "l", position: Position.Left },
] as const;

function AllHandles() {
  return (
    <>
      {SIDES.map(({ id, position }) => (
        <Handle key={`t-${id}`} id={id} type="target" position={position} style={HANDLE_STYLE} isConnectable={false} />
      ))}
      {SIDES.map(({ id, position }) => (
        <Handle key={`s-${id}`} id={id} type="source" position={position} style={HANDLE_STYLE} isConnectable={false} />
      ))}
    </>
  );
}

function labelHtml(label: string) {
  // Labels may contain newlines (converted from <div>/<br> in draw.io).
  return label.split("\n").map((line, i) => <div key={i}>{line || " "}</div>);
}

/** Small circular "this node expands" badge, overlapping the node's corner. */
function ExpandBadge() {
  return (
    <span
      style={{
        position: "absolute",
        top: -8,
        right: -8,
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: PALETTE.entity.stroke,
        color: "#fff",
        fontSize: 14,
        fontWeight: 700,
        lineHeight: "19px",
        textAlign: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        pointerEvents: "none",
      }}
    >
      +
    </span>
  );
}

export function EntityNode({ data }: NodeProps) {
  const d = data as DiagramNodeData;
  const p = resolvePalette("entity", d);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "6px 10px",
        boxSizing: "border-box",
        borderRadius: 10,
        background: p.fill,
        border: `1.5px solid ${p.stroke}`,
        boxShadow: CARD_SHADOW,
        fontFamily: FONT,
        fontSize: 12.5,
        fontWeight: 600,
        lineHeight: 1.35,
        color: p.text,
        cursor: d.childDiagram ? "zoom-in" : "default",
      }}
      title={d.childDiagram ? "Click to expand nested detail" : undefined}
    >
      <AllHandles />
      <div>{labelHtml(d.label)}</div>
      {d.childDiagram ? <ExpandBadge /> : null}
    </div>
  );
}

export function ProcessNode({ data }: NodeProps) {
  const d = data as DiagramNodeData;
  const p = resolvePalette("process", d);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 6,
        boxSizing: "border-box",
        borderRadius: "50%",
        background: p.fill,
        border: `1.5px solid ${p.stroke}`,
        boxShadow: CARD_SHADOW,
        fontFamily: FONT,
        fontSize: 11.5,
        fontWeight: 600,
        lineHeight: 1.3,
        color: p.text,
        cursor: d.childDiagram ? "zoom-in" : "default",
      }}
      title={d.childDiagram ? "Click to expand nested detail" : undefined}
    >
      <AllHandles />
      <div>{labelHtml(d.label)}</div>
      {d.childDiagram ? <ExpandBadge /> : null}
    </div>
  );
}

export function DatastoreNode({ data }: NodeProps) {
  const d = data as DiagramNodeData;
  const p = resolvePalette("datastore", d);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        filter: "drop-shadow(0 1px 2px rgba(15,23,42,0.12))",
      }}
    >
      <AllHandles />
      {/* True cylinder: elliptical top rim + body, drawn as SVG (not a CSS hack). */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <path
          d="M 2 14 C 2 6 98 6 98 14 L 98 86 C 98 94 2 94 2 86 Z"
          fill={p.fill}
          stroke={p.stroke}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M 2 14 C 2 22 98 22 98 14"
          fill="none"
          stroke={p.stroke}
          strokeWidth={1.2}
          opacity={0.55}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "10px 8px 4px",
          boxSizing: "border-box",
          fontFamily: FONT,
          fontSize: 11.5,
          fontWeight: 600,
          lineHeight: 1.3,
          color: p.text,
        }}
      >
        <div>{labelHtml(d.label)}</div>
      </div>
    </div>
  );
}

export function GroupNode({ id, data }: NodeProps) {
  const d = data as DiagramNodeData & { _expanded?: boolean };
  const actions = useDiagramActions();
  const p = d._expanded ? GROUP_EXPANDED : resolvePalette("group", d);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        borderRadius: 10,
        border: `1.5px ${d._expanded ? "solid" : "dashed"} ${p.stroke}`,
        background: p.fill,
      }}
    >
      <AllHandles />
      {d.label ? (
        <div
          style={{
            position: "absolute",
            top: -11,
            left: 12,
            background: "#fff",
            padding: "1px 8px",
            borderRadius: 5,
            border: `1px solid ${p.stroke}`,
            fontFamily: FONT,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.2,
            color: p.text,
          }}
        >
          {d.label.replace(/\n/g, " ")}
        </div>
      ) : null}
      {d._expanded ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            actions?.toggle(id);
          }}
          title="Collapse nested detail"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: FONT,
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1,
            padding: "4px 9px",
            border: `1px solid ${p.stroke}`,
            borderRadius: 999,
            background: "#fff",
            color: p.text,
            boxShadow: CARD_SHADOW,
            cursor: "pointer",
          }}
        >
          <span aria-hidden style={{ fontSize: 13, lineHeight: 1 }}>
            ×
          </span>
          Collapse
        </button>
      ) : null}
    </div>
  );
}

export function LabelNode({ data }: NodeProps) {
  const d = data as DiagramNodeData;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.1,
        color: "#64748B",
      }}
    >
      <AllHandles />
      <div>{labelHtml(d.label)}</div>
    </div>
  );
}

export const nodeTypes: NodeTypes = {
  entity: EntityNode,
  process: ProcessNode,
  datastore: DatastoreNode,
  group: GroupNode,
  label: LabelNode,
};
