// d:\web-canvas-tool\src\components\ui\renderers\FrameRenderer.tsx

import { updateElement } from "@/features/canvas/canvasSlice";
import { CanvasElement } from "@/features/canvas/types";
import { usePercentConverter } from "@/hooks/usePercentConverter";
import { useAppDispatch } from "@/hooks/useRedux";
import Konva from "konva";
import { forwardRef } from "react";
import { Rect } from "react-konva";
import { useSelector } from "react-redux";
import { ElementRendererProps } from "./types";
import { calculateGuidelines } from "./utils";

export const FrameRenderer = forwardRef<Konva.Rect, ElementRendererProps>(
  (
    {
      element,
      onSelect,
      stageWidth,
      stageHeight,
      setGuides,
      stageRef,
      draggable,
    },
    ref,
  ) => {
    const dispatch = useAppDispatch();
    const { toPercent } = usePercentConverter();
    const elements = useSelector((state: any) => state.canvas.elements);

    const imageInFrame = elements.find(
      (el: CanvasElement) => el.type === "image" && el.frameId === element.id,
    );

    // If there's an image, skip rendering the frame here as it will be rendered in the image case
    if (imageInFrame) {
      return null;
    }

    return (
      <>
        {(element.visible ?? true) && (
          <Rect
            id={element.id}
            ref={ref}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            fill={element.fill}
            dash={[4, 4]}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            rotation={element.rotation}
            draggable={draggable}
            onClick={onSelect}
            onDragMove={(e) => {
              const node = e.target as Konva.Rect;
              const guides = calculateGuidelines(
                node,
                elements,
                stageWidth,
                stageHeight,
                stageRef,
              );
              setGuides(guides);
            }}
            onDragEnd={(e) => {
              const node = e.target as Konva.Rect;
              const newX = node.x();
              const newY = node.y();

              dispatch(
                updateElement({
                  id: element.id,
                  updates: {
                    x: newX,
                    y: newY,
                    width_percent: toPercent(element.width, stageWidth),
                    height_percent: toPercent(element.height, stageHeight),
                    x_percent: toPercent(newX, stageWidth),
                    y_percent: toPercent(newY, stageHeight),
                  },
                }),
              );
              setGuides([]);
            }}
            onTransformEnd={(e) => {
              const node = e.target;
              const newWidth = node.width() * node.scaleX();
              const newHeight = node.height() * node.scaleY();
              const newX = node.x();
              const newY = node.y();

              dispatch(
                updateElement({
                  id: element.id,
                  updates: {
                    x: newX,
                    y: newY,
                    width: newWidth,
                    height: newHeight,
                    rotation: node.rotation(),
                    width_percent: toPercent(newWidth, stageWidth),
                    height_percent: toPercent(newHeight, stageHeight),
                    x_percent: toPercent(newX, stageWidth),
                    y_percent: toPercent(newY, stageHeight),
                  },
                }),
              );

              node.scaleX(1);
              node.scaleY(1);
            }}
          />
        )}
      </>
    );
  },
);
