// d:\web-canvas-tool\src\components\ui\renderers\GroupRenderer.tsx

import {
  CanvasElementUnion,
  CanvasGroupElement,
} from "@/features/canvas/types";
import { usePercentConverter } from "@/hooks/usePercentConverter";
import Konva from "konva";
import { forwardRef } from "react";
import { Group } from "react-konva";
import { ElementRenderer } from "../ElementRenderer"; // Circular import handled by React
import { useSelector } from "react-redux";
import { ElementRendererProps } from "./types";
import { calculateGuidelines } from "./utils";

export const GroupRenderer = forwardRef<Konva.Group, ElementRendererProps>(
  (
    {
      element,
      onSelect,
      onChange,
      stageWidth,
      stageHeight,
      setGuides,
      stageRef,
      draggable,
      ChildEl,
    },
    ref,
  ) => {
    const { toPercent } = usePercentConverter();
    const groupEl = element as CanvasGroupElement;
    const children = (groupEl.children ?? []) as CanvasElementUnion[];
    const elements = useSelector((state: any) => state.canvas.elements);

    const scaleChild = (
      c: CanvasElementUnion,
      sx: number,
      sy: number,
    ): CanvasElementUnion => {
      const common = { ...c, x: (c.x ?? 0) * sx, y: (c.y ?? 0) * sy };
      switch (c.type) {
        case "rectangle":
        case "frame":
        case "image":
        case "custom":
          return {
            ...common,
            width: (c.width ?? 0) * sx,
            height: (c.height ?? 0) * sy,
          };
        case "circle":
          return { ...common, radius: (c.radius ?? 0) * Math.max(sx, sy) };
        case "ellipse":
          return {
            ...common,
            ...("radiusX" in c && "radiusY" in c
              ? {
                  radiusX: (c.radiusX ?? 0) * sx,
                  radiusY: (c.radiusY ?? 0) * sy,
                }
              : {}),
          };
        case "triangle":
          return {
            ...common,
            radius:
              (c.radius ?? Math.max(c.width ?? 0, c.height ?? 0) / 2) *
              Math.max(sx, sy),
          };
        case "star":
          const k = Math.max(sx, sy);
          return {
            ...common,
            innerRadius: (c.innerRadius ?? 0) * k,
            outerRadius: (c.outerRadius ?? 0) * k,
          };
        case "ring":
        case "arc":
        case "wedge":
          const k2 = Math.max(sx, sy);
          const updates: any = { ...common };
          if ("innerRadius" in c)
            updates.innerRadius = (c.innerRadius ?? 0) * k2;
          if ("outerRadius" in c)
            updates.outerRadius = (c.outerRadius ?? 0) * k2;
          if ("radius" in c) updates.radius = (c.radius ?? 0) * k2;
          return updates;
        case "line":
          if (Array.isArray(c.points)) {
            const pts = [...c.points];
            for (let i = 0; i < pts.length; i += 2) {
              pts[i] = pts[i] * sx;
              pts[i + 1] = pts[i + 1] * sy;
            }
            return { ...common, points: pts };
          }
          return {
            ...common,
            width: (c.width ?? 0) * sx,
            height: (c.height ?? 0) * sy,
          };
        case "icon":
          return {
            ...common,
            scaleX: (c.scaleX ?? 1) * sx,
            scaleY: (c.scaleY ?? 1) * sy,
          };
        default:
          return common;
      }
    };

    return (element.visible ?? true) ? (
      <Group
        key={groupEl.id}
        id={groupEl.id}
        x={groupEl.x}
        y={groupEl.y}
        rotation={groupEl.rotation ?? 0}
        draggable={draggable}
        onClick={onSelect}
        onDragMove={(e) =>
          setGuides(
            calculateGuidelines(
              e.target,
              elements,
              stageWidth,
              stageHeight,
              stageRef,
            ),
          )
        }
        onDragEnd={(e) => {
          const node = e.target;
          onChange({
            x: node.x(),
            y: node.y(),
            x_percent: toPercent(node.x(), stageWidth),
            y_percent: toPercent(node.y(), stageHeight),
          });
          setGuides([]);
        }}
        onTransformEnd={(e) => {
          const node = e.target as Konva.Group;
          const sx = node.scaleX();
          const sy = node.scaleY();
          const newW = (groupEl.width ?? 0) * sx;
          const newH = (groupEl.height ?? 0) * sy;
          const newChildren = children.map((c) => scaleChild(c, sx, sy));

          onChange({
            x: node.x(),
            y: node.y(),
            width: newW,
            height: newH,
            x_percent: toPercent(node.x(), stageWidth),
            y_percent: toPercent(node.y(), stageHeight),
            width_percent: toPercent(newW, stageWidth),
            height_percent: toPercent(newH, stageHeight),
            rotation: node.rotation(),
            children: newChildren,
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      >
        {children.map((child, i) => (
          <ElementRenderer
            key={child.id ?? i}
            element={child}
            ChildEl={ChildEl}
            stageWidth={stageWidth}
            stageHeight={stageHeight}
            onSelect={onSelect}
            onChange={(updates) => {
              const newChildren = children.map((c) =>
                c.id === child.id ? { ...c, ...updates } : c,
              );
              onChange({ children: newChildren });
            }}
            setGuides={setGuides}
            draggable={false}
            stageRef={stageRef}
          />
        ))}
      </Group>
    ) : null;
  },
);
