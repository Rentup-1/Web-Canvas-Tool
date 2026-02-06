// d:\web-canvas-tool\src\components\ui\renderers\types.ts

import Konva from "konva";
import type {
  CanvasElement,
  CanvasElementUnion,
} from "@/features/canvas/types";

export type GuideLineType = {
  points: number[];
  text?: string;
  textPosition?: { x: number; y: number };
};

export interface ElementRendererProps {
  element: CanvasElementUnion;
  isSelected?: boolean;
  onSelect?: (e?: Konva.KonvaEventObject<MouseEvent>, id?: string) => void;
  onChange: (updates: Partial<CanvasElementUnion>) => void;
  stageWidth: number;
  stageHeight: number;
  draggable?: boolean;
  ChildEl?: CanvasElement[];
  setGuides: (guides: GuideLineType[]) => void;
  stageRef: React.RefObject<Konva.Stage>;
}
