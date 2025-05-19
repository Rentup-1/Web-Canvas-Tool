import { forwardRef, useState } from "react";
import { Rect, Text, Image as KonvaImage } from "react-konva";
<<<<<<< HEAD:src/components/ElementRenderer.tsx
import { type CanvasElement, type Frame } from "../features/canvas/types";
=======
import { type CanvasElement } from "../../features/canvas/types";
>>>>>>> e5fa3177fbe1b83d6cd70bcdbb280578f6dc3d9b:src/components/ui/ElementRenderer.tsx
import useImage from "use-image";
import { useSelector } from "react-redux";

interface Props {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CanvasElement>) => void;
}



export const ElementRenderer = forwardRef<any, Props>(({ element, onSelect, onChange }, ref) => {
  const elements = useSelector((store:any) => store.canvas.elements);
  const [isOverFrame, setIsOverFrame] = useState(false);

  switch (element.type) {
    case "rect":
      return (
        <Rect
          ref={ref}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          fill={element.fill}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
          dash={element.dash}
          rotation={element.rotation}
          draggable
          onClick={onSelect}
          onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
          onTransform={(e) => {
            const node = e.target;
            onChange({
              x: node.x(),
              y: node.y(),
              width: node.width() * node.scaleX(),
              height: node.height() * node.scaleY(),
              rotation: node.rotation(),
            });
            node.scaleX(1);
            node.scaleY(1);
          }}
        />
      );

    case "text": {
      const borderRadius = element.borderRadius || {};
      const cornerRadius = [
        borderRadius.topLeft || 0,
        borderRadius.topRight || 0,
        borderRadius.bottomRight || 0,
        borderRadius.bottomLeft || 0,
      ];
      return (
        <>
          {element.background && (
            <Rect
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              fill={element.background}
              opacity={element.opacity}
              rotation={element.rotation}
              cornerRadius={cornerRadius}
            />
          )}
          <Text
            ref={ref}
            x={element.x}
            y={element.y}
            text={element.text}
            fill={element.fill}
            padding={element.padding}
            fontSize={element.fontSize}
            fontFamily={element.fontFamily || "Arial"}
            // align={element.align || "left"}
            fillAfterStrokeEnabled
            draggable
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              const avgScale = (scaleX + scaleY) / 2;

              onChange({
                x: node.x(),
                y: node.y(),
                width: node.width() * scaleX,
                height: node.height() * scaleY,
                rotation: node.rotation(),
                fontSize: (element.fontSize || 24) * avgScale,
              });

              node.scaleX(1);
              node.scaleY(1);
            }}
          />
        </>
      );
    }

    case "frame": {
      const isFrame = element.type === "frame";
      
      return (
        <Rect
          ref={ref}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          fill={element.fill}
          stroke={isFrame ? (isOverFrame ? "blue" : "#000") : element.stroke}
          strokeWidth={element.strokeWidth}
          dash={element.dash}
          rotation={element.rotation}
          draggable
          onClick={onSelect}
          onTransform={(e) => {
            const node = e.target;
            const newWidth = node.width() * node.scaleX();
            const newHeight = node.height() * node.scaleY();

            onChange({
              x: node.x(),
              y: node.y(),
              width: newWidth,
              height: newHeight,
              rotation: node.rotation(),
            });

            node.scaleX(1);
            node.scaleY(1);
          }}
      />

      );
    }

    case "image": {
      const [image] = useImage(element.src || "");

      return (
        <KonvaImage
          ref={ref}
          image={image}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          draggable={!element.frameId}
          rotation={element.rotation}
          onClick={onSelect}
          onTransform={(e) => {
            const node = e.target;
            onChange({
              x: node.x(),
              y: node.y(),
              width: node.width() * node.scaleX(),
              height: node.height() * node.scaleY(),
              rotation: node.rotation(),
            });
            node.scaleX(1);
            node.scaleY(1);
          }}

          onDragMove={(e) => {
            const imgX = e.target.x();
            const imgY = e.target.y();
            const imgW = e.target.width();
            const imgH = e.target.height();

            const centerX = imgX + imgW / 2;
            const centerY = imgY + imgH / 2;
            const overFrame = elements.find((f : Frame) =>
              centerX >= f.x &&
              centerX <= f.x + f.width &&
              centerY >= f.y &&
              centerY <= f.y + f.height
            );

            setIsOverFrame(!!overFrame);
          }}

          onDragEnd={(e) => {
            const imgX = e.target.x();
            const imgY = e.target.y();
            const imgW = e.target.width();
            const imgH = e.target.height();

            const centerX = imgX + imgW / 2;
            const centerY = imgY + imgH / 2;

            const frame = elements.find((el:Frame) => el.type === "frame" &&
                centerX >= el.x &&
                centerX <= el.x + el.width &&
                centerY >= el.y &&
                centerY <= el.y + el.height
            );

            if (frame) {
              onChange({
                x: frame.x,
                y: frame.y,
                width: frame.width,
                height: frame.height,
                frameId: frame.id,
              });
            } else {
              onChange({ x: imgX, y: imgY, frameId: null });
            }

            setIsOverFrame(false);
          }}


        />
      );
    }

    default:
      return null;
  }
});
