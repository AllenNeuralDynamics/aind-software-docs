import { useCallback, useEffect, type MouseEvent } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Node,
  type Edge,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { loadDiagram } from "./lib/loadDiagram";
import { collapseNode, expandNode, toFlowEdges, toFlowNodes } from "./lib/toFlow";
import { nodeTypes } from "./nodes";
import { DiagramActionsContext } from "./DiagramActions";
import type { DiagramNodeData } from "./types";

function Viewer({ diagramId }: { diagramId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();

  useEffect(() => {
    let cancelled = false;
    loadDiagram(diagramId)
      .then((d) => {
        if (cancelled) return;
        setNodes(toFlowNodes(d));
        setEdges(toFlowEdges(d));
        requestAnimationFrame(() => fitView({ padding: 0.15 }));
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(`[diagram] failed to load "${diagramId}"`, e);
      });
    return () => {
      cancelled = true;
    };
  }, [diagramId, setNodes, setEdges, fitView]);

  // Expand a node's nested child diagram, or collapse it if already expanded.
  const toggle = useCallback(
    async (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const data = node.data as DiagramNodeData & { _expanded?: boolean };
      if (data._expanded) {
        const r = collapseNode(nodes, edges, nodeId);
        setNodes(r.nodes);
        setEdges(r.edges);
        requestAnimationFrame(() => fitView({ padding: 0.15, duration: 300 }));
        return;
      }
      if (!data.childDiagram) return;
      const r = await expandNode(nodes, edges, nodeId, data.childDiagram);
      setNodes(r.nodes);
      setEdges(r.edges);
      requestAnimationFrame(() => fitView({ padding: 0.2, duration: 400, nodes: [{ id: nodeId }] }));
    },
    [nodes, edges, setNodes, setEdges, fitView],
  );

  const onNodeClick = useCallback((_e: MouseEvent, node: Node) => toggle(node.id), [toggle]);

  return (
    <DiagramActionsContext.Provider value={{ toggle }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        minZoom={0.1}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </DiagramActionsContext.Provider>
  );
}

export default function App({ diagramId }: { diagramId: string }) {
  return (
    <ReactFlowProvider>
      <Viewer diagramId={diagramId} />
    </ReactFlowProvider>
  );
}
