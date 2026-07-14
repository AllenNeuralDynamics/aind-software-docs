import { createContext, useContext } from "react";

/** Lets custom node components trigger expand/collapse without prop-drilling. */
export interface DiagramActions {
  toggle: (nodeId: string) => void;
}

export const DiagramActionsContext = createContext<DiagramActions | null>(null);

export function useDiagramActions(): DiagramActions | null {
  return useContext(DiagramActionsContext);
}
