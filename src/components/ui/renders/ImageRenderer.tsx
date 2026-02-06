// d:\web-canvas-tool\src\components\ui\renderers\ImageRenderer.tsx

import { updateElement } from "@/features/canvas/canvasSlice";
import { CanvasElement } from "@/features/canvas/types";
import { usePercentConverter } from "@/hooks/usePercentConverter";
import { useAppDispatch } from "@/hooks/useRedux";
import Konva from "konva";
import { forwardRef, useRef, useState } from "react";
import { Group, Image as KonvaImage, Rect } from "react-konva";
import { useSelector } from "react-redux";
import useImage from "use-image";
import { ElementRendererProps } from "./types";
import { calculateGuidelines } from "./utils";

export const ImageRenderer = forwardRef<Konva.Image, ElementRendererProps>(
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
    },
    ref,
  ) => {
    const dispatch = useAppDispatch();
    const { toPercent } = usePercentConverter();
    const elements = useSelector((state: any) => state.canvas.elements);

    const [image] = useImage(element.src || "", "anonymous");
    const frame = elements.find((f: CanvasElement) => f.id === element.frameId);
    const wasOverFrameRef = useRef(false);
    const [currentFitMode] = useState(element.fitMode || "fill");
    const isDraggingImageRef = useRef(false);
    const [isMovable, setIsMovable] = useState(false);

    if (frame) {
      const borderRadius = frame.borderRadiusSpecial || 0;
      return (
        <Group
          x={frame.x}
          y={frame.y}
          draggable={draggable}
          onDragMove={(e) => {
            const node = e.target as Konva.Group;
            const guides = calculateGuidelines(
              node,
              elements,
              stageWidth,
              stageHeight,
              stageRef,
            );
            setGuides(guides);
          }}
          onClick={() => {
            if (onSelect) {
              onSelect();
            }
          }}
          onDragEnd={(e) => {
            const node = e.target as Konva.Group;
            const newX = node.x();
            const newY = node.y();

            dispatch(
              updateElement({
                id: frame.id,
                updates: {
                  x: newX,
                  y: newY,
                  width_percent: toPercent(frame.width, stageWidth),
                  height_percent: toPercent(frame.height, stageHeight),
                  x_percent: toPercent(newX, stageWidth),
                  y_percent: toPercent(newY, stageHeight),
                },
              }),
            );
            const offsetX = (frame.width - element.width) / 2;
            const offsetY = (frame.height - element.height) / 2;
            onChange({
              x: newX + offsetX,
              y: newY + offsetY,
              width: element.width,
              height: element.height,
              frameId: frame.id,
              fitMode: currentFitMode,
              width_percent: toPercent(element.width, stageWidth),
              height_percent: toPercent(element.height, stageHeight),
              x_percent: toPercent(newX + offsetX, stageWidth),
              y_percent: toPercent(newY + offsetY, stageHeight),
            });

            setGuides([]);
          }}
        >
          <Rect
            id={frame.id}
            x={0}
            y={0}
            width={frame.width}
            height={frame.height}
            strokeWidth={2}
            fill="transparent"
            cornerRadius={borderRadius}
          />
          <Group
            clipFunc={(ctx) => {
              const r = borderRadius;
              const width = frame.width;
              const height = frame.height;
              ctx.beginPath();
              ctx.moveTo(r, 0);
              ctx.lineTo(width - r, 0);
              ctx.quadraticCurveTo(width, 0, width, r);
              ctx.lineTo(width, height - r);
              ctx.quadraticCurveTo(width, height, width - r, height);
              ctx.lineTo(r, height);
              ctx.quadraticCurveTo(0, height, 0, height - r);
              ctx.lineTo(0, r);
              ctx.quadraticCurveTo(0, 0, r, 0);
              ctx.closePath();
            }}
          >
            <KonvaImage
              id={element.id}
              ref={ref}
              image={image}
              x={element.x - frame.x}
              y={element.y - frame.y}
              width={element.width}
              height={element.height}
              draggable={isMovable}
              onClick={() => {
                if (onSelect) {
                  onSelect();
                }
              }}
              onDblClick={() => {
                setIsMovable((prev) => !prev);
              }}
              onDragStart={() => {
                isDraggingImageRef.current = true;
              }}
              onDragMove={(e) => {
                if (!isDraggingImageRef.current || !isMovable) return;
                const imageNode = e.target as Konva.Image;
                const guides = calculateGuidelines(
                  imageNode,
                  elements,
                  stageWidth,
                  stageHeight,
                  stageRef,
                );
                setGuides(guides);
              }}
              onDragEnd={(e) => {
                const imageNode = e.target as Konva.Image;
                let newX = imageNode.x();
                let newY = imageNode.y();

                const minX = -(element.width - frame.width) / 2;
                const maxX = (element.width - frame.width) / 2;
                const minY = -(element.height - frame.height) / 2;
                const maxY = (element.height - frame.height) / 2;

                newX = Math.max(minX, Math.min(maxX, newX));
                newY = Math.max(minY, Math.min(maxY, newY));

                const newFrameX = frame.x + newX - (element.x - frame.x);
                const newFrameY = frame.y + newY - (element.y - frame.y);

                dispatch(
                  updateElement({
                    id: frame.id,
                    updates: {
                      x: newFrameX,
                      y: newFrameY,
                      width_percent: toPercent(frame.width, stageWidth),
                      height_percent: toPercent(frame.height, stageHeight),
                      x_percent: toPercent(newFrameX, stageWidth),
                      y_percent: toPercent(newFrameY, stageHeight),
                    },
                  }),
                );

                onChange({
                  x: newFrameX + newX,
                  y: newFrameY + newY,
                  width: element.width,
                  height: element.height,
                  width_percent: toPercent(element.width, stageWidth),
                  height_percent: toPercent(element.height, stageHeight),
                  x_percent: toPercent(newFrameX + newX, stageWidth),
                  y_percent: toPercent(newFrameY + newY, stageHeight),
                });
                setGuides([]);
              }}
              onTransformEnd={(e) => {
                const node = e.target;
                const oldWidth = element.width;
                const oldHeight = element.height;
                const newWidth = node.width() * node.scaleX();
                const newHeight = node.height() * node.scaleY();
                const newX = node.x();
                const newY = node.y();

                const newImageX = newX + frame.x;
                const newImageY = newY + frame.y;

                onChange({
                  x: newImageX,
                  y: newImageY,
                  width: newWidth,
                  height: newHeight,
                  rotation: node.rotation(),
                  width_percent: toPercent(newWidth, stageWidth),
                  height_percent: toPercent(newHeight, stageHeight),
                  x_percent: toPercent(newImageX, stageWidth),
                  y_percent: toPercent(newImageY, stageHeight),
                });

                node.scaleX(1);
                node.scaleY(1);

                const scaleX = newWidth / oldWidth;
                const scaleY = newHeight / oldHeight;
                const newFrameWidth = frame.width * scaleX;
                const newFrameHeight = frame.height * scaleY;

                const imageCenterX = newImageX + newWidth / 2;
                const imageCenterY = newImageY + newHeight / 2;
                const newFrameX = imageCenterX - newFrameWidth / 2;
                const newFrameY = imageCenterY - newFrameHeight / 2;

                dispatch(
                  updateElement({
                    id: frame.id,
                    updates: {
                      x: newFrameX,
                      y: newFrameY,
                      width: newFrameWidth,
                      height: newFrameHeight,
                      rotation: node.rotation(),
                      width_percent: toPercent(newFrameWidth, stageWidth),
                      height_percent: toPercent(newFrameHeight, stageHeight),
                      x_percent: toPercent(newFrameX, stageWidth),
                      y_percent: toPercent(newFrameY, stageHeight),
                    },
                  }),
                );
              }}
            />
          </Group>
        </Group>
      );
    }

    return (
      <>
        {(element.visible ?? true) && (
          <KonvaImage
            id={element.id}
            ref={ref}
            image={image}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            draggable={draggable}
            onClick={() => {
              if (onSelect) {
                onSelect();
              }
            }}
            onDragMove={(e) => {
              const imageNode = e.target as Konva.Image;
              const imgX = imageNode.x();
              const imgY = imageNode.y();
              const imgW = imageNode.width();
              const imgH = imageNode.height();
              const centerX = imgX + imgW / 2;
              const centerY = imgY + imgH / 2;

              const guides = calculateGuidelines(
                imageNode,
                elements,
                stageWidth,
                stageHeight,
                stageRef,
              );
              setGuides(guides);

              dispatch(
                updateElement({
                  id: element.id,
                  updates: {
                    x: imgX,
                    y: imgY,
                    width_percent: toPercent(imgW, stageWidth),
                    height_percent: toPercent(imgH, stageHeight),
                    x_percent: toPercent(imgX, stageWidth),
                    y_percent: toPercent(imgY, stageHeight),
                  },
                }),
              );

              const frames = elements
                .filter(
                  (el: CanvasElement) =>
                    el.type === "frame" &&
                    centerX >= el.x &&
                    centerX <= el.x + el.width &&
                    centerY >= el.y &&
                    centerY <= el.y + el.height,
                )
                .sort(
                  (a: CanvasElement, b: CanvasElement) =>
                    elements.indexOf(b) - elements.indexOf(a),
                );

              const frame = frames[0];

              if (!frame) {
                wasOverFrameRef.current = false;
                return;
              }

              const isAlreadyHasImage = elements.some(
                (el: CanvasElement) =>
                  el.type === "image" &&
                  el.frameId === frame.id &&
                  el.id !== element.id,
              );

              if (isAlreadyHasImage) {
                return;
              }

              if (!wasOverFrameRef.current) {
                const frameAspect = frame.width / frame.height;
                const imgAspect = imgW / imgH;

                let newWidth, newHeight, offsetX, offsetY;

                switch (currentFitMode) {
                  case "fit":
                    if (imgAspect > frameAspect) {
                      newWidth = frame.width;
                      newHeight = frame.width / imgAspect;
                    } else {
                      newHeight = frame.height;
                      newWidth = frame.height * imgAspect;
                    }
                    break;

                  case "fill":
                    if (imgAspect < frameAspect) {
                      newWidth = frame.width;
                      newHeight = frame.width / imgAspect;
                    } else {
                      newHeight = frame.height;
                      newWidth = frame.height * imgAspect;
                    }
                    break;

                  case "stretch":
                    newWidth = frame.width;
                    newHeight = frame.height;
                    break;

                  default:
                    if (imgAspect < frameAspect) {
                      newWidth = frame.width;
                      newHeight = frame.width / imgAspect;
                    } else {
                      newHeight = frame.height;
                      newWidth = frame.height * imgAspect;
                    }
                    break;
                }

                offsetX = (frame.width - newWidth) / 2;
                offsetY = (frame.height - newHeight) / 2;

                onChange({
                  x: frame.x + offsetX,
                  y: frame.y + offsetY,
                  width: newWidth,
                  height: newHeight,
                  frameId: frame.id,
                  fitMode: currentFitMode,
                  width_percent: toPercent(newWidth, stageWidth),
                  height_percent: toPercent(newHeight, stageHeight),
                  x_percent: toPercent(frame.x + offsetX, stageWidth),
                  y_percent: toPercent(frame.y + offsetY, stageHeight),
                });

                wasOverFrameRef.current = true;
              }
            }}
            onDragEnd={(e) => {
              const img = e.target;
              const imgW = img.width();
              const imgH = img.height();

              const centerX = img.x() + imgW / 2;
              const centerY = img.y() + imgH / 2;

              const frames = elements
                .filter(
                  (el: CanvasElement) =>
                    el.type === "frame" &&
                    centerX >= el.x &&
                    centerX <= el.x + el.width &&
                    centerY >= el.y &&
                    centerY <= el.y + el.height,
                )
                .sort(
                  (a: CanvasElement, b: CanvasElement) =>
                    elements.indexOf(b) - elements.indexOf(a),
                );

              const frame = frames[0];

              if (frame) {
                const isAlreadyHasImage = elements.some(
                  (el: CanvasElement) =>
                    el.type === "image" &&
                    el.frameId === frame.id &&
                    el.id !== element.id,
                );

                if (isAlreadyHasImage) {
                  onChange({ x: img.x(), y: img.y(), frameId: null });
                  wasOverFrameRef.current = false;
                  return;
                }

                const frameAspect = frame.width / frame.height;
                const imgAspect = imgW / imgH;

                let newWidth, newHeight, offsetX, offsetY;

                switch (currentFitMode) {
                  case "fit":
                    if (imgAspect > frameAspect) {
                      newWidth = frame.width;
                      newHeight = frame.width / imgAspect;
                    } else {
                      newHeight = frame.height;
                      newWidth = frame.height * imgAspect;
                    }
                    break;

                  case "fill":
                    if (imgAspect < frameAspect) {
                      newWidth = frame.width;
                      newHeight = frame.width / imgAspect;
                    } else {
                      newHeight = frame.height;
                      newWidth = frame.height * imgAspect;
                    }
                    break;

                  case "stretch":
                    newWidth = frame.width;
                    newHeight = frame.height;
                    break;

                  default:
                    if (imgAspect < frameAspect) {
                      newWidth = frame.width;
                      newHeight = frame.width / imgAspect;
                    } else {
                      newHeight = frame.height;
                      newWidth = frame.height * imgAspect;
                    }
                    break;
                }

                offsetX = (frame.width - newWidth) / 2;
                offsetY = (frame.height - newHeight) / 2;

                onChange({
                  x: frame.x + offsetX,
                  y: frame.y + offsetY,
                  width: newWidth,
                  height: newHeight,
                  frameId: frame.id,
                  fitMode: currentFitMode,
                  width_percent: toPercent(newWidth, stageWidth),
                  height_percent: toPercent(newHeight, stageHeight),
                  x_percent: toPercent(frame.x + offsetX, stageWidth),
                  y_percent: toPercent(frame.y + offsetY, stageHeight),
                });
              } else {
                onChange({ x: img.x(), y: img.y(), frameId: null });
              }

              wasOverFrameRef.current = false;
            }}
            onTransformEnd={(e) => {
              const node = e.target;
              const newWidth = node.width() * node.scaleX();
              const newHeight = node.height() * node.scaleY();
              const newX = node.x();
              const newY = node.y();

              onChange({
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
                rotation: node.rotation(),
                width_percent: toPercent(newWidth, stageWidth),
                height_percent: toPercent(newHeight, stageHeight),
                x_percent: toPercent(newX, stageWidth),
                y_percent: toPercent(newY, stageHeight),
              });

              node.scaleX(1);
              node.scaleY(1);
            }}
          />
        )}
      </>
    );
  },
);
