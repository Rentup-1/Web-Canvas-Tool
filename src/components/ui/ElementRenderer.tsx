import { forwardRef } from "react";
import { Rect, Text, Image as KonvaImage } from "react-konva";
import { type CanvasElement } from "../../features/canvas/types";
import useImage from "use-image";

interface Props {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CanvasElement>) => void;
}

export const ElementRenderer = forwardRef<any, Props>(({ element, onSelect, onChange }, ref) => {
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
          draggable
          rotation={element.rotation}
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
    }

    default:
      return null;
  }
});
