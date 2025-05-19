"use client";

import { forwardRef, useEffect, useState } from "react";
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
} from "../../features/canvas/types";

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
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
      if (element.type === "image") {
        const imageElement = element as CanvasImageElement;
        if (imageElement.src) {
          const img = new Image();
          img.onload = () => {
            setImage(img);
          };
          img.src = imageElement.src;
        } else {
          setImage(null);
        }
      }
    }, [element]);

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

      case "text":
        const textElement = element as CanvasTextElement;
        const borderRadius = textElement.borderRadius || {};
        const textCornerRadius = [
          borderRadius.topLeft || 0,
          borderRadius.topRight || 0,
          borderRadius.bottomRight || 0,
          borderRadius.bottomLeft || 0,
        ];
        return (
          <>
            {textElement.background && (
              <Rect
                x={textElement.x}
                y={textElement.y}
                width={textElement.width}
                height={textElement.height}
                fill={textElement.background}
                opacity={textElement.opacity}
                rotation={textElement.rotation}
                cornerRadius={textCornerRadius}
              />
            )}
            <Text
              ref={ref}
              x={textElement.x}
              y={textElement.y}
              text={textElement.text}
              fill={textElement.fill}
              stroke={textElement.stroke}
              strokeWidth={textElement.strokeWidth}
              padding={textElement.padding}
              fontSize={textElement.fontSize}
              fontFamily={textElement.fontFamily || "Arial"}
              opacity={textElement.opacity}
              draggable
              onClick={onSelect}
              onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
              onTransform={(e) => handleTransform(e.target, element, onChange)}
            />
          </>
        );

      case "image":
        const imageElement = element as CanvasImageElement;
        return (
          <KonvaImage
            ref={ref}
            image={image ?? undefined}
            x={imageElement.x}
            y={imageElement.y}
            width={imageElement.width}
            height={imageElement.height}
            draggable
            rotation={imageElement.rotation}
            opacity={imageElement.opacity}
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => handleTransform(e.target, element, onChange)}
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
