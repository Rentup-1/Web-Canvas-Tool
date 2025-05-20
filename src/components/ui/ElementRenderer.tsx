import { forwardRef, useState } from "react";
import { Rect, Text, Image as KonvaImage, Group } from "react-konva";
import useImage from "use-image";
import { useSelector } from "react-redux";
import type { CanvasElement } from "../../features/canvas/types";

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
            width={element.width}
            height={element.height}
            text={element.text}
            fill={element.fill}
            padding={element.padding}
            fontSize={element.fontSize}
            align={element.align || "left"}
            verticalAlign={element.verticalAlign || "middle"}
            fontFamily={element.fontFamily || "Arial"}
            wrap="word"
            fillAfterStrokeEnabled
            draggable
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              // const avgScale = (scaleX + scaleY) / 2;

              onChange({
                x: node.x(),
                y: node.y(),
                width: node.width() * scaleX,
                height: node.height() * scaleY,
                rotation: node.rotation(),
                // fontSize: (element.fontSize || 24) * avgScale,
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
            console.log(e.target);
            
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
      const frame = elements.find((f: CanvasElement) => f.id === element.frameId);
      let wasOverFrame = false; // خليها خارج الكومبوننت أو في useRef لو هتعملها persistent

      if (frame) {
        return (
          <Group
            x={frame.x}
            y={frame.y}
            clipFunc={(ctx) => {
              ctx.rect(0, 0, frame.width, frame.height);
            }}>

            <KonvaImage
              ref={ref}
              image={image}
              x={element.x - frame.x} // نحرك الصورة بالنسبة للفريم
              y={element.y - frame.y}
              width={element.width}
              height={element.height}
              draggable
              onClick={onSelect}
              onDragMove={(e) => {
                const imageNode = e.target;
                const newX = imageNode.x();
                const newY = imageNode.y();

                onChange({ x: newX + frame.x, y: newY + frame.y });
              }}
              onTransform={(e) => {
                const node = e.target;
                const newWidth = node.width() * node.scaleX();
                const newHeight = node.height() * node.scaleY();
                const newX = node.x();
                const newY = node.y();

                onChange({
                  x: newX + frame.x,
                  y: newY + frame.y,
                  width: newWidth,
                  height: newHeight,
                  rotation: node.rotation(),
                });

                node.scaleX(1);
                node.scaleY(1);
              }}
            />
          </Group>

        );
      }

      return (
        <KonvaImage
          ref={ref}
          image={image}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          draggable
          onClick={onSelect}
          // باقي الأحداث زي ما هي
          onTransform={(e) => {
            const node = e.target;
            const newWidth = node.width() * node.scaleX();
            const newHeight = node.height() * node.scaleY();
            const newX = node.x();
            const newY = node.y();

            const frame = elements.find((f:CanvasElement) => f.id === element.frameId);
            if (frame) {
              const isInside =
                newX >= frame.x &&
                newY >= frame.y &&
                newX + newWidth <= frame.x + frame.width &&
                newY + newHeight <= frame.y + frame.height;

              if (!isInside) {
                node.scaleX(1);
                node.scaleY(1);
                node.x(element.x);
                node.y(element.y);
                return;
              }
            }

            onChange({
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight,
              rotation: node.rotation(),
            });

            node.scaleX(1);
            node.scaleY(1);
          }}

          // onDragMove={(e) => {
          //   const imageNode = e.target;
          //   const imgX = imageNode.x();
          //   const imgY = imageNode.y();
          //   const imgW = imageNode.width();
          //   const imgH = imageNode.height();

          //   const frame = elements.find((f:CanvasElement) => f.id === element.frameId);
          //   if (!frame) return;

          //   const newRight = imgX + imgW;
          //   const newBottom = imgY + imgH;

          //   const isInside =
          //     imgX >= frame.x &&
          //     imgY >= frame.y &&
          //     newRight <= frame.x + frame.width &&
          //     newBottom <= frame.y + frame.height;

          //   if (!isInside) {
          //     imageNode.x(element.x);
          //     imageNode.y(element.y);
          //     wasOverFrame = false;
          //   } else {
          //     if (!wasOverFrame) {
          //       const frameAspect = frame.width / frame.height;
          //       const imgAspect = imgW / imgH;

          //       let newWidth, newHeight, offsetX, offsetY;

          //       switch (element.fitMode) {
          //         case "fit":
          //           if (imgAspect > frameAspect) {
          //             newWidth = frame.width;
          //             newHeight = frame.width / imgAspect;
          //           } else {
          //             newHeight = frame.height;
          //             newWidth = frame.height * imgAspect;
          //           }
          //           break;

          //         case "fill":
          //         default:
          //           if (imgAspect < frameAspect) {
          //             newWidth = frame.width;
          //             newHeight = frame.width / imgAspect;
          //           } else {
          //             newHeight = frame.height;
          //             newWidth = frame.height * imgAspect;
          //           }
          //           break;

          //         case "stretch":
          //           newWidth = frame.width;
          //           newHeight = frame.height;
          //           break;
          //       }

          //       offsetX = (frame.width - newWidth) / 2;
          //       offsetY = (frame.height - newHeight) / 2;

          //       onChange({
          //         x: frame.x + offsetX,
          //         y: frame.y + offsetY,
          //         width: newWidth,
          //         height: newHeight,
          //         frameId: frame.id,
          //       });

          //       wasOverFrame = true;
          //     }
          //   }
          // }}

          // onDragEnd={(e) => {
          //   const img = e.target;
          //   const imgW = img.width();
          //   const imgH = img.height();

          //   const centerX = img.x() + imgW / 2;
          //   const centerY = img.y() + imgH / 2;

          //   const frame = elements.find(
          //     (el: CanvasElement) =>
          //       el.type === "frame" &&
          //       centerX >= el.x &&
          //       centerX <= el.x + el.width &&
          //       centerY >= el.y &&
          //       centerY <= el.y + el.height
          //   );

          //   if (frame) {
          //   const frameAspect = frame.width / frame.height;
          //   const imgAspect = imgW / imgH;

          //   let newWidth, newHeight, offsetX, offsetY;

          //   switch (element.fitMode) {
          //     case "fit":
          //       if (imgAspect > frameAspect) {
          //         newWidth = frame.width;
          //         newHeight = frame.width / imgAspect;
          //       } else {
          //         newHeight = frame.height;
          //         newWidth = frame.height * imgAspect;
          //       }
          //       break;

          //     case "fill":
          //     default:
          //       if (imgAspect < frameAspect) {
          //         newWidth = frame.width;
          //         newHeight = frame.width / imgAspect;
          //       } else {
          //         newHeight = frame.height;
          //         newWidth = frame.height * imgAspect;
          //       }
          //       break;

          //     case "stretch":
          //       newWidth = frame.width;
          //       newHeight = frame.height;
          //       break;
          //   }

          //   offsetX = (frame.width - newWidth) / 2;
          //   offsetY = (frame.height - newHeight) / 2;

          //   onChange({
          //     x: frame.x + offsetX,
          //     y: frame.y + offsetY,
          //     width: newWidth,
          //     height: newHeight,
          //     frameId: frame.id,
          //   });

          //   } else {
          //     onChange({ x: img.x(), y: img.y(), frameId: null });
          //   }

          //   setIsOverFrame(false);
          // }}

          onDragMove={(e) => {
          const imageNode = e.target;
          const imgX = imageNode.x();
          const imgY = imageNode.y();
          const imgW = imageNode.width();
          const imgH = imageNode.height();

          const centerX = imgX + imgW / 2;
          const centerY = imgY + imgH / 2;

          const frame = elements.find(
            (el: CanvasElement) =>
              el.type === "frame" &&
              centerX >= el.x &&
              centerX <= el.x + el.width &&
              centerY >= el.y &&
              centerY <= el.y + el.height
          );

          if (!frame) {
            wasOverFrame = false;
            return;
          }

          if (!wasOverFrame) {
            const frameAspect = frame.width / frame.height;
            const imgAspect = imgW / imgH;

            let newWidth, newHeight, offsetX, offsetY;

            switch (element.fitMode) {
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
              default:
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
            }

            offsetX = (frame.width - newWidth) / 2;
            offsetY = (frame.height - newHeight) / 2;

            onChange({
              x: frame.x + offsetX,
              y: frame.y + offsetY,
              width: newWidth,
              height: newHeight,
              frameId: frame.id,
            });

            wasOverFrame = true;
          }
        }}

        onDragEnd={(e) => {
          const img = e.target;
          const imgW = img.width();
          const imgH = img.height();

          const centerX = img.x() + imgW / 2;
          const centerY = img.y() + imgH / 2;

          const frame = elements.find(
            (el: CanvasElement) =>
              el.type === "frame" &&
              centerX >= el.x &&
              centerX <= el.x + el.width &&
              centerY >= el.y &&
              centerY <= el.y + el.height
          );

          if (frame) {
            const frameAspect = frame.width / frame.height;
            const imgAspect = imgW / imgH;

            let newWidth, newHeight, offsetX, offsetY;

            switch (element.fitMode) {
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
              default:
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
            }

            offsetX = (frame.width - newWidth) / 2;
            offsetY = (frame.height - newHeight) / 2;

            onChange({
              x: frame.x + offsetX,
              y: frame.y + offsetY,
              width: newWidth,
              height: newHeight,
              frameId: frame.id,
            });
          } else {
            onChange({ x: img.x(), y: img.y(), frameId: null });
          }

          setIsOverFrame(false);
          wasOverFrame = false;
        }}


      />
    );
    }


    default:
      return null;
  }
});
