"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import {
  Rect,
  Text,
  Image as KonvaImage,
  Arc,
  Circle,
  Ellipse,
  Line,
  RegularPolygon,
  Star,
  Wedge,
  Ring,
  Arrow,
  Group,
  Transformer,
} from "react-konva";
import type {
  ArcShape,
  CanvasElementUnion,
  CanvasImageElement,
  CanvasTextElement,
  RectangleShape,
  CircleShape,
  EllipseShape,
  LineShape,
  TriangleShape,
  StarShape,
  CustomShape,
  RegularPolygonShape,
  WedgeShape,
  RingShape,
  ArrowShape,
  CanvasElement,
} from "../../features/canvas/types";
import { useSelector } from "react-redux";
import useImage from "use-image";
import { updateElement } from "@/features/canvas/canvasSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { Html } from 'react-konva-utils';
import * as MdIcons from 'react-icons/md';
import { Icon } from "@iconify/react/dist/iconify.js";

interface Props {
  element: CanvasElementUnion;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CanvasElementUnion>) => void;
}

// Update the handleTransform function to properly handle rotation for all shapes
const handleTransform = (
  node: any,
  element: CanvasElementUnion,
  onChange: (updates: Partial<CanvasElementUnion>) => void
) => {
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();
  const avgScale = (scaleX + scaleY) / 2;

  const updates: Partial<CanvasElementUnion> = {
    x: node.x(),
    y: node.y(),
    width: node.width() * scaleX,
    height: node.height() * scaleY,
    rotation: node.rotation(),
  };

  if (element.type === "text") {
    const textElement = element as CanvasTextElement;
    (updates as Partial<CanvasTextElement>).fontSize =
      (textElement.fontSize || 24) * avgScale;
  }

  // Handle shape-specific properties
  switch (element.type) {
    case "circle":
      (updates as Partial<CircleShape>).radius =
        (element as CircleShape).radius * avgScale;
      break;
    case "ellipse":
      (updates as Partial<EllipseShape>).radiusX =
        (element as EllipseShape).radiusX * scaleX;
      (updates as Partial<EllipseShape>).radiusY =
        (element as EllipseShape).radiusY * scaleY;
      break;
    case "regularPolygon":
      (updates as Partial<RegularPolygonShape>).radius =
        (element as RegularPolygonShape).radius * avgScale;
      break;
    case "star":
      (updates as Partial<StarShape>).innerRadius =
        (element as StarShape).innerRadius * avgScale;
      (updates as Partial<StarShape>).outerRadius =
        (element as StarShape).outerRadius * avgScale;
      break;
    case "arc":
    case "ring":
      (updates as Partial<ArcShape | RingShape>).innerRadius =
        (element as ArcShape | RingShape).innerRadius * avgScale;
      (updates as Partial<ArcShape | RingShape>).outerRadius =
        (element as ArcShape | RingShape).outerRadius * avgScale;
      break;
    case "wedge":
      (updates as Partial<WedgeShape>).radius =
        (element as WedgeShape).radius * avgScale;
      break;
  }

  onChange(updates);

  node.scaleX(1);
  node.scaleY(1);
};

// Update the ElementRenderer to apply stroke and strokeWidth to all shapes
export const ElementRenderer = forwardRef<any, Props>(
  ({ element, onSelect, onChange }, ref) => {
    const elements = useSelector((store:any) => store.canvas.elements);
    const [isOverFrame, setIsOverFrame] = useState(false);
    const dispatch = useAppDispatch();

    switch (element.type) {
      case "arc":
        const arcElement = element as ArcShape;
        return (
          <Arc
            ref={ref}
            x={arcElement.x}
            y={arcElement.y}
            fill={arcElement.fill}
            stroke={arcElement.stroke}
            strokeWidth={arcElement.strokeWidth}
            rotation={arcElement.rotation}
            angle={arcElement.angle || 360}
            innerRadius={arcElement.innerRadius || 0}
            outerRadius={
              arcElement.outerRadius ||
              Math.max(arcElement.width, arcElement.height) / 2
            }
            opacity={arcElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => handleTransform(e.target, element, onChange)}
          />
        );

      case "rectangle":
        const rectangleElement = element as RectangleShape;
        // Convert borderRadius object to cornerRadius array if it exists
        let cornerRadiusValue = rectangleElement.cornerRadius;
        if (rectangleElement.borderRadius) {
          const br = rectangleElement.borderRadius;
          cornerRadiusValue = [
            br.topLeft || 0,
            br.topRight || 0,
            br.bottomRight || 0,
            br.bottomLeft || 0,
          ];
        }
        return (
          <Rect
            ref={ref}
            x={rectangleElement.x}
            y={rectangleElement.y}
            width={rectangleElement.width}
            height={rectangleElement.height}
            fill={rectangleElement.fill}
            stroke={rectangleElement.stroke}
            strokeWidth={rectangleElement.strokeWidth}
            
            rotation={rectangleElement.rotation}
            cornerRadius={cornerRadiusValue}
            opacity={rectangleElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => handleTransform(e.target, element, onChange)}
          />
        );

      // case "text":
      //   const textElement = element as CanvasTextElement;
      //   const refText = useRef(null);
      //   const [bgSize, setBgSize] = useState({ width: 0, height: 0 });
      //   const trRef = useRef(null);
      //   const [isSelected, setIsSelected] = useState(false);
      //   const [isEditing, setIsEditing] = useState(false);
      //   const [editableText, setEditableText] = useState(textElement.text);

      //   const borderRadius = textElement.borderRadius || {};
      //   const textCornerRadius = [
      //     borderRadius.topLeft || 0,
      //     borderRadius.topRight || 0,
      //     borderRadius.bottomRight || 0,
      //     borderRadius.bottomLeft || 0,
      //   ];

      //   useEffect(() => {
      //     if (refText.current) {
      //       const box = refText.current.getClientRect({ skipTransform: true });
      //       setBgSize({ width: box.width, height: box.height });
      //     }
      //   }, [
      //     textElement.text,
      //     textElement.fontSize,
      //     textElement.fontFamily,
      //     textElement.padding,
      //     textElement.width,    // 🟢 أضف ده
      //     textElement.height,   // 🟢 وأضف ده
      //   ]);

      //   useEffect(() => {
      //     if (isSelected && trRef.current) {
      //       trRef.current.nodes([refText.current]);
      //       trRef.current.getLayer().batchDraw();
      //     }
      //   }, [isSelected]);

      //   const handleSelect = (e) => {
      //     setIsSelected(true);
      //     if (onSelect) onSelect(e);
      //   };
        
      //   return (
      //     <>
      //       {textElement.background && (
      //         <Rect
      //           x={textElement.x - (textElement.padding || 0)}
      //           y={textElement.y - (textElement.padding || 0)}
      //           width={textElement.width + (textElement.padding || 0) * 2}
      //           height={bgSize.height + (textElement.padding || 0) * 2}
      //           fill={textElement.background}
      //           stroke={textElement.backgroundStroke}
      //           strokeWidth={textElement.backgroundStrokeWidth}
      //           opacity={textElement.opacity}
      //           rotation={textElement.rotation}
      //           cornerRadius={textCornerRadius}
      //         />
      //       )}
      //       <Text
      //         ref={refText}
      //         x={textElement.x}
      //         y={textElement.y}
      //         text={textElement.text}
      //         fill={textElement.fill}
      //         stroke={textElement.stroke}
      //         padding={textElement.padding}
      //         fontSize={textElement.fontSize}
      //         fontFamily={textElement.fontFamily || "Arial"}
      //         opacity={textElement.opacity}
      //         verticalAlign="middle"
      //         draggable
      //         width={textElement.width}
      //         onClick={handleSelect}
      //         onDragMove={(e) => onChange({ ...textElement, x: e.target.x(), y: e.target.y() })}
      //         onTransformEnd={(e) => {
      //           const node = refText.current;
      //           const scaleX = node.scaleX();
      //           const scaleY = node.scaleY();

      //           // نغير العرض بحسب الـ scaleX
      //           const newWidth = Math.max(30, node.width() * scaleX);

      //           // نطبق العرض الجديد على النص مؤقتاً عشان نحصل على ارتفاع النص الجديد
      //           node.width(newWidth);

      //           // نحصل على ارتفاع النص مع العرض الجديد
      //           const newHeight = node.height();

      //           // نبعت التحديث للـ state أو للأب
      //           onChange({
      //             ...textElement,
      //             x: node.x(),
      //             y: node.y(),
      //             width: newWidth,
      //             height: newHeight,
      //           });

      //           // نرجع الـ scale لوحده 1
      //           node.scaleX(1);
      //           node.scaleY(1);
      //       }}

      //       />
      //       {isSelected && (
      //         <Transformer
      //           ref={trRef}
      //           rotateEnabled={false}
      //           enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
      //           boundBoxFunc={(oldBox, newBox) => {
      //             if (newBox.width < 30 || newBox.height < 30) {
      //               return oldBox;
      //             }
      //             return newBox;
      //           }}
      //           onClick={(e) => e.cancelBubble = true} // منع التحديد إذا ضغط على الـ transformer نفسه
      //         />
      //       )}
      //     </>

      //   );

      case "text":
        const textElement = element as CanvasTextElement;
        const refText = useRef(null);
        const [bgSize, setBgSize] = useState({ width: 0, height: 0 });
        const trRef = useRef(null);
        const [isSelected, setIsSelected] = useState(false);
        const [isEditing, setIsEditing] = useState(false);
        const [editableText, setEditableText] = useState(textElement.text);

        const borderRadius = textElement.borderRadius || {};
        const textCornerRadius = [
          borderRadius.topLeft || 0,
          borderRadius.topRight || 0,
          borderRadius.bottomRight || 0,
          borderRadius.bottomLeft || 0,
        ];

        useEffect(() => {
          if (refText.current) {
            const box = refText.current.getClientRect({ skipTransform: true });
            setBgSize({ width: box.width, height: box.height });
          }
        }, [
          textElement.text,
          textElement.fontSize,
          textElement.fontFamily,
          textElement.padding,
          textElement.width,
          textElement.height,
          editableText,
        ]);

        useEffect(() => {
          if (isSelected && trRef.current && !isEditing) {
            trRef.current.nodes([refText.current]);
            trRef.current.getLayer().batchDraw();
          }
        }, [isSelected, isEditing]);

        const handleSelect = (e) => {
          setIsSelected(true);
          if (onSelect) onSelect(e);
        };

        const handleDoubleClick = () => {
          setIsEditing(true);
        };

        const handleTextChange = (e) => {
          setEditableText(e.target.value);
          if (refText.current) {
            refText.current.text(e.target.value);
            const box = refText.current.getClientRect({ skipTransform: true });
            setBgSize({ width: box.width, height: box.height });
          }
        };

        const handleTextBlur = () => {
          setIsEditing(false);
          onChange({
            ...textElement,
            text: editableText,
            width: bgSize.width,
            height: bgSize.height,
          });
        };

        const handleKeyPress = (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            setIsEditing(false);
            onChange({
              ...textElement,
              text: editableText,
              width: bgSize.width,
              height: bgSize.height,
            });
          }
        };

        return (
          <>
            {textElement.background && (
              <Rect
                x={textElement.x - (textElement.padding || 0)}
                y={textElement.y - (textElement.padding || 0)}
                width={bgSize.width + (textElement.padding || 0) * 2}
                height={bgSize.height + (textElement.padding || 0) * 2}
                fill={textElement.background} // background rect
                stroke={textElement.backgroundStroke}
                strokeWidth={textElement.backgroundStrokeWidth}
                opacity={textElement.opacity}
                rotation={textElement.rotation}
                cornerRadius={textCornerRadius}
              />
            )}
            <Text
              ref={refText}
              x={textElement.x}
              y={textElement.y}
              text={editableText}
              fill={textElement.fill || "#000"}
              backgroundStroke={textElement.backgroundStroke}
              stroke={textElement.stroke}
              padding={textElement.padding}
              fontSize={textElement.fontSize}
              fontFamily={textElement.fontFamily || "Arial"}
              opacity={textElement.opacity}
              verticalAlign="middle"
              draggable
              width={textElement.width}
              wrap="word"
              onClick={handleSelect}
              onDblClick={handleDoubleClick}
              onDragMove={(e) => onChange({ ...textElement, x: e.target.x(), y: e.target.y() })}
              onTransform={(e) => {
                const node = refText.current;
                const newWidth = Math.max(30, e.target.width() * e.target.scaleX());
                node.width(newWidth);
                node.scaleX(1); // 🟢 Reset scaleX to prevent pixelation
                node.scaleY(1); // 🟢 Reset scaleY to prevent pixelation
                const newHeight = node.height();
                setBgSize({ width: newWidth, height: newHeight });
              }}
              onTransformEnd={(e) => {
                const node = refText.current;
                const newWidth = Math.max(30, node.width());
                node.width(newWidth);
                const newHeight = node.height();

                setBgSize({ width: newWidth, height: newHeight });

                onChange({
                  ...textElement,
                  x: node.x(),
                  y: node.y(),
                  width: newWidth,
                  height: newHeight,
                });

                node.scaleX(1);
                node.scaleY(1);
              }}
            />
            {isSelected && !isEditing && (
              <Transformer
                ref={trRef}
                rotateEnabled={false}
                enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 30 || newBox.height < 30) {
                    return oldBox;
                  }
                  return newBox;
                }}
                onClick={(e) => e.cancelBubble = true}
              />
            )}
            {isEditing && (
              <Html>
                <textarea
                  style={{
                    position: 'absolute',
                    top: textElement.y,
                    left: textElement.x,
                    width: bgSize.width,
                    height: bgSize.height,
                    fontSize: textElement.fontSize,
                    fontFamily: textElement.fontFamily || 'Arial',
                    padding: textElement.padding || 0,
                    color: textElement.fill,
                    background: 'white',
                    border: '1px dashed #ccc',
                    resize: 'none',
                    outline: 'none',
                    overflow: 'hidden',
                    lineHeight: "1"
                  }}
                  value={editableText}
                  onChange={handleTextChange}
                  onBlur={handleTextBlur}
                  onKeyPress={handleKeyPress}
                  autoFocus
                />
              </Html>
            )}
          </>
        );

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
            dash={[4, 4]}
            stroke={isFrame ? (isOverFrame ? "blue" : "#000") : element.stroke}
            strokeWidth={element.strokeWidth}
            rotation={element.rotation}
            draggable
            onClick={onSelect}
            onDragMove={(e) => {
              const node = e.target;
              const newX = node.x();
              const newY = node.y();
              dispatch(updateElement({ id: element.id, updates: { x: newX, y: newY } }));
            }}
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
              x={element.x - frame.x} 
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

          onDragMove={(e) => {

          const imageNode = e.target;
          const imgX = imageNode.x();
          const imgY = imageNode.y();
          const imgW = imageNode.width();
          const imgH = imageNode.height();

          const centerX = imgX + imgW / 2;
          const centerY = imgY + imgH / 2;
          dispatch(updateElement({ id: element.id, updates: { x: imgX, y: imgY } }));

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

      case "icon": {
        const IconComponent = MdIcons[element.iconName as keyof typeof MdIcons];
        console.log(IconComponent);
        
        return (
          <Html
            groupProps={{
              x: element.x,
              y: element.y,
              draggable: true,
              onDragMove: (e) => {
                const node = e.target;
                const newX = node.x();
                const newY = node.y();
                dispatch(updateElement({ id: element.id, updates: { x: newX, y: newY } }));
              },
              onClick: onSelect,
            }}
          >
            <div
              style={{
                width: element.width,
                height: element.height,
                fontSize: element.width,
                color: element.color || 'black',
                border: "2px solid #000",
                cursor: 'move',
              }}
            >
              <Icon icon="mdi:home" width={50} height={50} color="#000000" />
              {/* {IconComponent ? <IconComponent color={element.color || "black"} /> : null} */}
            </div>
          </Html>
        );
      }


      case "circle":
        const circleElement = element as CircleShape;
        return (
          <Circle
            ref={ref}
            x={circleElement.x}
            y={circleElement.y}
            radius={circleElement.radius}
            fill={circleElement.fill}
            stroke={circleElement.stroke}
            strokeWidth={circleElement.strokeWidth}
            rotation={circleElement.rotation}
            opacity={circleElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => handleTransform(e.target, element, onChange)}
          />
        );

      case "ellipse":
        const ellipseElement = element as EllipseShape;
        return (
          <Ellipse
            ref={ref}
            x={ellipseElement.x}
            y={ellipseElement.y}
            radiusX={ellipseElement.radiusX}
            radiusY={ellipseElement.radiusY}
            fill={ellipseElement.fill}
            stroke={ellipseElement.stroke}
            strokeWidth={ellipseElement.strokeWidth}
            rotation={ellipseElement.rotation}
            opacity={ellipseElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => handleTransform(e.target, element, onChange)}
          />
        );

      case "line":
        const lineElement = element as LineShape;
        return (
          <Line
            ref={ref}
            x={lineElement.x}
            y={lineElement.y}
            points={lineElement.points}
            fill={lineElement.fill}
            stroke={lineElement.stroke}
            strokeWidth={lineElement.strokeWidth}
            rotation={lineElement.rotation}
            opacity={lineElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => handleTransform(e.target, element, onChange)}
          />
        );

      case "triangle":
        const triangleElement = element as TriangleShape;
        return (
          <RegularPolygon
            ref={ref}
            x={triangleElement.x}
            y={triangleElement.y}
            sides={3}
            radius={Math.max(triangleElement.width, triangleElement.height) / 2}
            fill={triangleElement.fill}
            stroke={triangleElement.stroke}
            strokeWidth={triangleElement.strokeWidth}
            rotation={triangleElement.rotation}
            opacity={triangleElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => handleTransform(e.target, element, onChange)}
          />
        );

      case "star":
        const starElement = element as StarShape;
        return (
          <Star
            ref={ref}
            x={starElement.x}
            y={starElement.y}
            innerRadius={starElement.innerRadius}
            outerRadius={starElement.outerRadius}
            numPoints={starElement.numPoints}
            fill={starElement.fill}
            stroke={starElement.stroke}
            strokeWidth={starElement.strokeWidth}
            rotation={starElement.rotation}
            opacity={starElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => handleTransform(e.target, element, onChange)}
          />
        );

      case "regularPolygon":
        const polygonElement = element as RegularPolygonShape;
        return (
          <RegularPolygon
            ref={ref}
            x={polygonElement.x}
            y={polygonElement.y}
            sides={polygonElement.sides}
            radius={polygonElement.radius}
            fill={polygonElement.fill}
            stroke={polygonElement.stroke}
            strokeWidth={polygonElement.strokeWidth}
            rotation={polygonElement.rotation}
            opacity={polygonElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => handleTransform(e.target, element, onChange)}
          />
        );

      case "wedge":
        const wedgeElement = element as WedgeShape;
        return (
          <Wedge
            ref={ref}
            x={wedgeElement.x}
            y={wedgeElement.y}
            radius={wedgeElement.radius}
            angle={wedgeElement.angle}
            fill={wedgeElement.fill}
            stroke={wedgeElement.stroke}
            strokeWidth={wedgeElement.strokeWidth}
            rotation={wedgeElement.rotation}
            opacity={wedgeElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => handleTransform(e.target, element, onChange)}
          />
        );

      case "ring":
        const ringElement = element as RingShape;
        return (
          <Ring
            ref={ref}
            x={ringElement.x}
            y={ringElement.y}
            innerRadius={ringElement.innerRadius}
            outerRadius={ringElement.outerRadius}
            fill={ringElement.fill}
            stroke={ringElement.stroke}
            strokeWidth={ringElement.strokeWidth}
            rotation={ringElement.rotation}
            opacity={ringElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => handleTransform(e.target, element, onChange)}
          />
        );

      case "arrow":
        const arrowElement = element as ArrowShape;
        return (
          <Arrow
            ref={ref}
            x={arrowElement.x}
            y={arrowElement.y}
            points={arrowElement.points}
            fill={arrowElement.fill}
            stroke={arrowElement.stroke}
            strokeWidth={arrowElement.strokeWidth}
            pointerLength={arrowElement.pointerLength}
            pointerWidth={arrowElement.pointerWidth}
            rotation={arrowElement.rotation}
            opacity={arrowElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => handleTransform(e.target, element, onChange)}
          />
        );

      case "custom":
        const customElement = element as CustomShape;
        return (
          <Line
            ref={ref}
            x={customElement.x}
            y={customElement.y}
            points={customElement.points}
            fill={customElement.fill}
            stroke={customElement.stroke}
            strokeWidth={customElement.strokeWidth}
            rotation={customElement.rotation}
            closed
            opacity={customElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => handleTransform(e.target, element, onChange)}
          />
        );

      default:
        return null;
    }
  }
);
