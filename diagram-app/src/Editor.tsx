import { useCallback, useEffect, useState } from "react";
import {
  addEdge,
  Background,
  ConnectionMode,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { loadDiagram, saveDiagram } from "./lib/loadDiagram";
import { toFlowEdges, toFlowNodes } from "./lib/toFlow";
import { nodeTypes } from "./nodes";
import type { Diagram, DiagramNode, NodeKind } from "./types";

const KINDS: NodeKind[] = ["entity", "process", "datastore", "group", "label"];

/** Serialise the current React Flow graph back into the canonical Diagram JSON. */
function toDiagram(id: string, level: Diagram["level"], nodes: Node[], edges: Edge[]): Diagram {
  return {
    id,
    level,
    nodes: nodes.map((n): DiagramNode => {
      const d = n.data as Record<string, unknown>;
      const w = typeof n.width === "number" ? n.width : (n.style?.width as number | undefined);
      const h = typeof n.height === "number" ? n.height : (n.style?.height as number | undefined);
      return {
        id: n.id,
        type: (n.type as NodeKind) ?? "entity",
        position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
        width: w ? Math.round(w) : undefined,
        height: h ? Math.round(h) : undefined,
        ...(n.parentId ? { parentId: n.parentId } : {}),
        data: {
          label: String(d.label ?? ""),
          fill: (d.fill as string) || undefined,
          stroke: (d.stroke as string) || undefined,
          childDiagram: (d.childDiagram as string) || undefined,
        },
      };
    }),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label ? String(e.label) : undefined,
    })),
  };
}

function EditorInner() {
  const [diagramId, setDiagramId] = useState("high_level/general_data_flow");
  const [level, setLevel] = useState<Diagram["level"]>("high");
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const { fitView, screenToFlowPosition } = useReactFlow();

  const load = useCallback(
    (id: string) => {
      setStatus("Loading…");
      loadDiagram(id)
        .then((d) => {
          setLevel(d.level);
          setNodes(toFlowNodes(d));
          setEdges(toFlowEdges(d));
          setSelectedId(null);
          setStatus(`Loaded ${id}`);
          requestAnimationFrame(() => fitView({ padding: 0.15 }));
        })
        .catch((e) => setStatus(String(e)));
    },
    [setNodes, setEdges, fitView],
  );

  useEffect(() => {
    load(diagramId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onConnect = useCallback(
    (c: Connection) =>
      setEdges((eds) =>
        addEdge({ ...c, id: `e-${c.source}-${c.target}-${eds.length}`, markerEnd: { type: MarkerType.ArrowClosed } }, eds),
      ),
    [setEdges],
  );

  const addNode = useCallback(() => {
    const id = `n-${Date.now().toString(36)}`;
    const pos = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setNodes((ns) =>
      ns.concat({
        id,
        type: "entity",
        position: pos,
        width: 120,
        height: 60,
        style: { width: 120, height: 60 },
        data: { label: "New node" },
      }),
    );
    setSelectedId(id);
  }, [screenToFlowPosition, setNodes]);

  const save = useCallback(async () => {
    setStatus("Saving…");
    try {
      await saveDiagram(toDiagram(diagramId, level, nodes, edges));
      setStatus(`Saved ${diagramId} ✓`);
    } catch (e) {
      setStatus(String(e));
    }
  }, [diagramId, level, nodes, edges]);

  const selected = nodes.find((n) => n.id === selectedId) ?? null;

  const patchSelected = useCallback(
    (patch: Partial<{ type: NodeKind; label: string; fill: string; stroke: string; childDiagram: string }>) => {
      setNodes((ns) =>
        ns.map((n) => {
          if (n.id !== selectedId) return n;
          const { type, ...dataPatch } = patch;
          return {
            ...n,
            ...(type ? { type } : {}),
            data: { ...n.data, ...dataPatch },
          };
        }),
      );
    },
    [selectedId, setNodes],
  );

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setNodes((ns) => ns.filter((n) => n.id !== selectedId));
    setEdges((es) => es.filter((e) => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
  }, [selectedId, setNodes, setEdges]);

  const inputStyle = { width: "100%", boxSizing: "border-box" as const, marginBottom: 8 };

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ flex: 1, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            zIndex: 10,
            top: 8,
            left: 8,
            display: "flex",
            gap: 8,
            alignItems: "center",
            background: "rgba(255,255,255,0.95)",
            padding: "6px 10px",
            borderRadius: 6,
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            fontSize: 13,
          }}
        >
          <input
            value={diagramId}
            onChange={(e) => setDiagramId(e.target.value)}
            style={{ width: 260 }}
            onKeyDown={(e) => e.key === "Enter" && load(diagramId)}
          />
          <button onClick={() => load(diagramId)}>Load</button>
          <button onClick={addNode}>+ Node</button>
          <button onClick={save} style={{ fontWeight: 600 }}>Save</button>
          <span style={{ color: "#666" }}>{status}</span>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_e, n) => setSelectedId(n.id)}
          onPaneClick={() => setSelectedId(null)}
          connectionMode={ConnectionMode.Loose}
          deleteKeyCode={["Backspace", "Delete"]}
          minZoom={0.1}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      <div style={{ width: 260, borderLeft: "1px solid #ddd", padding: 12, fontSize: 13, overflowY: "auto" }}>
        <h3 style={{ marginTop: 0 }}>Inspector</h3>
        {selected ? (
          <>
            <label>Type</label>
            <select
              value={selected.type}
              onChange={(e) => patchSelected({ type: e.target.value as NodeKind })}
              style={inputStyle}
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>

            <label>Label</label>
            <textarea
              value={String(selected.data.label ?? "")}
              onChange={(e) => patchSelected({ label: e.target.value })}
              rows={3}
              style={inputStyle}
            />

            <label>Fill</label>
            <input
              value={String(selected.data.fill ?? "")}
              placeholder="#dae8fc"
              onChange={(e) => patchSelected({ fill: e.target.value })}
              style={inputStyle}
            />

            <label>Stroke</label>
            <input
              value={String(selected.data.stroke ?? "")}
              placeholder="#6c8ebf"
              onChange={(e) => patchSelected({ stroke: e.target.value })}
              style={inputStyle}
            />

            <label>Child diagram (expand link)</label>
            <input
              value={String(selected.data.childDiagram ?? "")}
              placeholder="mid_level/QC"
              onChange={(e) => patchSelected({ childDiagram: e.target.value })}
              style={inputStyle}
            />

            <button onClick={deleteSelected} style={{ color: "#b00", marginTop: 8 }}>
              Delete node
            </button>
          </>
        ) : (
          <p style={{ color: "#888" }}>
            Select a node to edit. Drag to move, drag between nodes to connect, Delete to remove.
          </p>
        )}
      </div>
    </div>
  );
}

export default function Editor() {
  return (
    <ReactFlowProvider>
      <EditorInner />
    </ReactFlowProvider>
  );
}
