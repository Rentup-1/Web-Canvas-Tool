import { forwardRef, useEffect, useRef, useState } from "react";
import {
  Rect,
  Text,
  Image as KonvaImage,
  Circle,
  Ellipse,
  Line,
  RegularPolygon,
  Star,
  Wedge,
  Ring,
  Group,
  Transformer,
} from "react-konva";
import type {
  CanvasElementUnion,
  CanvasTextElement,
  RectangleShape,
  CircleShape,
  EllipseShape,
  LineShape,
  TriangleShape,
  StarShape,
  WedgeShape,
  RingShape,
  CanvasElement,
} from "../../features/canvas/types";
import { useSelector } from "react-redux";
import useImage from "use-image";
import { updateElement } from "@/features/canvas/canvasSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { Html } from 'react-konva-utils';
import * as MdIcons from 'react-icons/md';
import { Icon } from "@iconify/react/dist/iconify.js";
import { QRCodeCanvas } from "qrcode.react";

interface Props {
  element: CanvasElementUnion;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CanvasElementUnion>) => void;
}

// Update the ElementRenderer to apply stroke and strokeWidth to all shapes
export const ElementRenderer = forwardRef<any, Props>(
  ({ element, onSelect, onChange }, ref) => {
    const elements = useSelector((store:any) => store.canvas.elements);
    const [isOverFrame, setIsOverFrame] = useState(false);
    const dispatch = useAppDispatch();

    switch (element.type) {

      case "text":
        const textElement = element as CanvasTextElement;
        const refText = useRef(null);
        const [bgSize, setBgSize] = useState({ width: 0, height: 0 });
        const trRef = useRef(null);
        const [isSelected, setIsSelected] = useState(false);
        const [isEditing, setIsEditing] = useState(false);
        const [editableText, setEditableText] = useState(textElement.text);

        const textAlign = useSelector((state) =>
          state.canvas.elements.find((el) => el.id === textElement.id)?.align || 'left'
        );
        const fontStyle = useSelector((state) =>
          state.canvas.elements.find((el) => el.id === textElement.id)?.fontStyle || 'normal'
        );
        const textDecoration = useSelector((state) =>
          state.canvas.elements.find((el) => el.id === textElement.id)?.textDecoration || 'none'
        );

        const borderRadius = textElement.borderRadius || {};
        const textCornerRadius = [
          borderRadius.topLeft || 0,
          borderRadius.topRight || 0,
          borderRadius.bottomRight || 0,
          borderRadius.bottomLeft || 0,
        ];

        useEffect(() => {
          if (refText.current) {
            refText.current.align(textAlign);
            refText.current.fontStyle(fontStyle);
            refText.current.textDecoration(textDecoration);
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
          textAlign,
          fontStyle,
          textDecoration,
        ]);

        useEffect(() => {
          if (isSelected && trRef.current && !isEditing) {
            trRef.current.nodes([refText.current]);
            trRef.current.getLayer().batchDraw();
          }
        }, [isSelected, isEditing]);

        const handleSelect = (e) => {
          setIsSelected(true);
          if (onSelect) onSelect(e, textElement.id);
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
          dispatch(updateElement({
            id: textElement.id,
            updates: {
              text: editableText,
              width: bgSize.width,
              height: bgSize.height,
              align: textAlign,
              fontStyle,
              textDecoration,
            },
          }));
        };

        const handleKeyPress = (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            setIsEditing(false);
            dispatch(updateElement({
              id: textElement.id,
              updates: {
                text: editableText,
                width: bgSize.width,
                height: bgSize.height,
                align: textAlign,
                fontStyle,
                textDecoration,
              },
            }));
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
                fill={textElement.background}
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
              stroke={textElement.stroke}
              padding={textElement.padding}
              fontSize={textElement.fontSize}
              fontFamily={textElement.fontFamily || "Arial"}
              opacity={textElement.opacity}
              verticalAlign="middle"
              align={textAlign}
              fontStyle={fontStyle}
              textDecoration={textDecoration}
              draggable
              width={textElement.width}
              wrap="word"
              onClick={handleSelect}
              onDblClick={handleDoubleClick}
              onDragMove={(e) => dispatch(updateElement({
                id: textElement.id,
                updates: { x: e.target.x(), y: e.target.y() },
              }))}
              onTransform={(e) => {
                const node = refText.current;
                const newWidth = Math.max(30, e.target.width() * e.target.scaleX());
                node.width(newWidth);
                node.scaleX(1);
                node.scaleY(1);
                const newHeight = node.height();
                setBgSize({ width: newWidth, height: newHeight });
              }}
              onTransformEnd={(e) => {
                const node = refText.current;
                const newWidth = Math.max(30, node.width());
                node.width(newWidth);
                const newHeight = node.height();

                setBgSize({ width: newWidth, height: newHeight });

                dispatch(updateElement({
                  id: textElement.id,
                  updates: {
                    x: node.x(),
                    y: node.y(),
                    width: newWidth,
                    height: newHeight,
                    align: textAlign,
                    fontStyle,
                    textDecoration,
                  },
                }));

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
                    lineHeight: '1',
                    textAlign: textAlign,
                    fontWeight: fontStyle.includes('bold') ? 'bold' : 'normal',
                    fontStyle: fontStyle.includes('italic') ? 'italic' : 'normal',
                    textDecoration: textDecoration,
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
            offsetX={rectangleElement.width / 2}
            offsetY={rectangleElement.height / 2}
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
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
            onDragMove={(e) => {
              onChange({ x: e.target.x(), y: e.target.y() });
            }}
            onTransform={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();

              // ناخد متوسط مقياس X و Y علشان نعدل radius
              const newRadius = (circleElement.radius * (scaleX + scaleY)) / 2;

              onChange({
                x: node.x(),
                y: node.y(),
                radius: newRadius,
                rotation: node.rotation(),
              });

              // نرجع الـ scale علشان منكررهاش
              node.scaleX(1);
              node.scaleY(1);
            }}
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
             onDragMove={(e) => {
              onChange({ x: e.target.x(), y: e.target.y() });
            }}
            onTransform={(e) => {
              const node = e.target;

              const newRadiusX = ellipseElement.radiusX * node.scaleX();
              const newRadiusY = ellipseElement.radiusY * node.scaleY();

              onChange({
                x: node.x(),
                y: node.y(),
                radiusX: newRadiusX,
                radiusY: newRadiusY,
                rotation: node.rotation(),
              });

              // Reset scale to 1 to avoid compounding transforms
              node.scaleX(1);
              node.scaleY(1);
            }}
          />
        );

      case "line":
        const lineElement = element as LineShape;

        // حساب منتصف الخط (لو خط بسيط بنقطتين فقط)
        const [x1, y1, x2, y2] = lineElement.points;
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;

        // نعدل الـ points علشان نرسم الخط حوالين (0, 0)، ونستخدم offset
        const adjustedPoints = [
          x1 - centerX,
          y1 - centerY,
          x2 - centerX,
          y2 - centerY,
        ];

        return (
          <Line
            ref={ref}
            x={lineElement.x + centerX}
            y={lineElement.y + centerY}
            points={adjustedPoints}
            fill={lineElement.fill}
            stroke={lineElement.stroke}
            strokeWidth={lineElement.strokeWidth}
            rotation={lineElement.rotation}
            opacity={lineElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) =>
              onChange({ x: e.target.x() - centerX, y: e.target.y() - centerY })
            }
            onTransform={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();

              const newPoints = adjustedPoints.map((point, index) =>
                index % 2 === 0 ? point * scaleX : point * scaleY
              );

              onChange({
                x: node.x() - centerX,
                y: node.y() - centerY,
                rotation: node.rotation(),
                points: newPoints.map((p, i) =>
                  i % 2 === 0 ? p + centerX : p + centerY
                ),
              });

              node.scaleX(1);
              node.scaleY(1);
            }}
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
            onDragMove={(e) =>
              onChange({
                x: e.target.x(),
                y: e.target.y(),
              })
            }
            onTransform={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();

              // نحسب نصف القطر الجديد من التحجيم
              const newRadius =
                (Math.max(triangleElement.width, triangleElement.height) / 2) *
                Math.max(scaleX, scaleY);

              onChange({
                x: node.x(),
                y: node.y(),
                rotation: node.rotation(),
                width: newRadius * 2,
                height: newRadius * 2,
              });

              node.scaleX(1);
              node.scaleY(1);
            }}
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
             onDragMove={(e) =>
              onChange({
                x: e.target.x(),
                y: e.target.y(),
              })
            }
            onDragMove={(e) =>
              onChange({
                x: e.target.x(),
                y: e.target.y(),
              })
            }
            onTransform={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();

              // نحسب الأنصاف الجديدة بعد التحجيم
              const newInnerRadius =
                starElement.innerRadius * Math.min(scaleX, scaleY);
              const newOuterRadius =
                starElement.outerRadius * Math.max(scaleX, scaleY);

              onChange({
                x: node.x(),
                y: node.y(),
                rotation: node.rotation(),
                innerRadius: newInnerRadius,
                outerRadius: newOuterRadius,
              });

              node.scaleX(1);
              node.scaleY(1);
            }}
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
            onTransform={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              const scale = (scaleX + scaleY) / 2; // Average scale for uniform scaling

              onChange({
                x: node.x(),
                y: node.y(),
                radius: wedgeElement.radius * scale,
                rotation: node.rotation(),
              });

              node.scaleX(1);
              node.scaleY(1);
            }}
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
            onTransform={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              const scale = (scaleX + scaleY) / 2; // Average scale for uniform scaling

              onChange({
                x: node.x(),
                y: node.y(),
                innerRadius: ringElement.innerRadius * scale,
                outerRadius: ringElement.outerRadius * scale,
                rotation: node.rotation(),
              });

              node.scaleX(1);
              node.scaleY(1);
            }}
          />
        );

      /* qr code */
      // case "qrcode": {
      //   const qrElement = element as QRCodeElement;
      //   const [qrError, setQrError] = useState<string | null>(null);

      //   // Validate QR code data
      //   const isValidQRData = qrElement.value && qrElement.value.trim() !== "";

      //   if (!isValidQRData) {
      //     return (
      //       <Html
      //         groupProps={{
      //           x: qrElement.x,
      //           y: qrElement.y,
      //           draggable: true,
      //           onClick: onSelect,
      //         }}
      //       >
      //         <div
      //           style={{
      //             width: qrElement.width,
      //             height: qrElement.height,
      //             cursor: "move",
      //             display: "flex",
      //             alignItems: "center",
      //             justifyContent: "center",
      //             border: "2px dashed #ccc",
      //             backgroundColor: "#f5f5f5",
      //             color: "#666",
      //             fontSize: "12px",
      //             textAlign: "center",
      //           }}
      //         >
      //           Invalid QR Data
      //         </div>
      //       </Html>
      //     );
      //   }

      default:
        return null;
    }
});
