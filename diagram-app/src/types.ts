/** Canonical diagram format — the source of truth (replaces draw.io). */

export type NodeKind = "entity" | "process" | "datastore" | "group" | "label";

export type DiagramLevel = "high" | "mid" | "low" | "domain";

export interface DiagramNodeData {
  label: string;
  /** Node fill colour (CSS), carried over from the original diagram. */
  fill?: string;
  /** Node border colour (CSS). */
  stroke?: string;
  /** Click-to-expand link: id of another diagram to reveal nested inside this node. */
  childDiagram?: string;
  [key: string]: unknown;
}

export interface DiagramNode {
  id: string;
  type: NodeKind;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  /** id of a sibling node in the SAME diagram that visually contains this one. */
  parentId?: string;
  data: DiagramNodeData;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  /** true if the original edge had no arrowhead. */
  noArrow?: boolean;
}

export interface Diagram {
  id: string;
  level: DiagramLevel;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}
