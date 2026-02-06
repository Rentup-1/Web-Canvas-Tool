// d:\web-canvas-tool\src\components\ui\renderers\ShapeRenderers.tsx

import {
  CanvasElement,
  CircleShape,
  EllipseShape,
  IconShape,
  LineShape,
  RectangleShape,
  RingShape,
  StarShape,
  TriangleShape,
  WedgeShape,
} from "@/features/canvas/types";
import { useBrandingResolver } from "@/hooks/useBrandingResolver";
import { usePercentConverter } from "@/hooks/usePercentConverter";
import Konva from "konva";
import { forwardRef } from "react";
import {
  Circle,
  Ellipse,
  Line,
  Path,
  Rect,
  RegularPolygon,
  Ring,
  Star,
  Wedge,
} from "react-konva";
import { useSelector } from "react-redux";
import { ElementRendererProps } from "./types";
import { calculateGuidelines, calculateSnappingPosition } from "./utils";

const useShapeProps = (element: CanvasElement) => {
  const { resolveColor } = useBrandingResolver();
  const isBrandingType = (value: any) =>
    value === "fixed" || value === "dynamic";

  const getBrandedFill = (el: CanvasElement) => {
    const brandingType = isBrandingType(el.fillBrandingType)
      ? el.fillBrandingType
      : undefined;
    return resolveColor(el.fill, brandingType);
  };

  const getBrandedStroke = (el: CanvasElement) => {
    const brandingType = isBrandingType(el.strokeBrandingType)
      ? el.strokeBrandingType
      : undefined;
    return resolveColor(el.stroke || "#000000", brandingType);
  };

  return {
    fill: getBrandedFill(element),
    stroke: getBrandedStroke(element),
  };
};

export const RectangleRenderer = forwardRef<Konva.Rect, ElementRendererProps>(
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
    const { toPercent } = usePercentConverter();
    const { fill, stroke } = useShapeProps(element);
    const rectEl = element as RectangleShape;
    const elements = useSelector((state: any) => state.canvas.elements);

    let cornerRadiusValue = rectEl.cornerRadius;
    if (rectEl.borderRadius) {
      const br = rectEl.borderRadius;
      cornerRadiusValue = [
        br.topLeft || 0,
        br.topRight || 0,
        br.bottomRight || 0,
        br.bottomLeft || 0,
      ];
    }

    return (element.visible ?? true) ? (
      <Rect
        ref={ref}
        id={element.id}
        x={rectEl.x}
        y={rectEl.y}
        width={rectEl.width}
        height={rectEl.height}
        fill={fill}
        stroke={stroke}
        strokeWidth={rectEl.strokeWidth}
        rotation={rectEl.rotation}
        cornerRadius={cornerRadiusValue}
        opacity={rectEl.opacity}
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
            width_percent: toPercent(rectEl.width, stageWidth),
            height_percent: toPercent(rectEl.height, stageHeight),
            x_percent: toPercent(node.x(), stageWidth),
            y_percent: toPercent(node.y(), stageHeight),
          });
          setGuides([]);
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          const newWidth = node.width() * node.scaleX();
          const newHeight = node.height() * node.scaleY();
          onChange({
            x: node.x(),
            y: node.y(),
            width: newWidth,
            height: newHeight,
            width_percent: toPercent(newWidth, stageWidth),
            height_percent: toPercent(newHeight, stageHeight),
            x_percent: toPercent(node.x(), stageWidth),
            y_percent: toPercent(node.y(), stageHeight),
            rotation: node.rotation(),
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
    ) : null;
  },
);

export const CircleRenderer = forwardRef<Konva.Circle, ElementRendererProps>(
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
    const { toPercent } = usePercentConverter();
    const { fill, stroke } = useShapeProps(element);
    const circleEl = element as CircleShape;
    const elements = useSelector((state: any) => state.canvas.elements);
    const snapThreshold = 2;

    return (element.visible ?? true) ? (
      <Circle
        ref={ref}
        id={circleEl.id?.toString()}
        x={circleEl.x + circleEl.radius}
        y={circleEl.y + circleEl.radius}
        radius={circleEl.radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={circleEl.strokeWidth}
        rotation={circleEl.rotation}
        opacity={circleEl.opacity}
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
          const { newX, newY } = calculateSnappingPosition(
            node,
            elements,
            element,
            snapThreshold,
            circleEl.radius,
            circleEl.radius,
          );
          const adjustedX = newX - circleEl.radius;
          const adjustedY = newY - circleEl.radius;
          onChange({
            x: adjustedX,
            y: adjustedY,
            x_percent: toPercent(adjustedX, stageWidth),
            y_percent: toPercent(adjustedY, stageHeight),
          });
          setGuides([]);
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          const newRadius =
            (circleEl.radius * (node.scaleX() + node.scaleY())) / 2;
          const adjustedX = node.x() - newRadius;
          const adjustedY = node.y() - newRadius;
          onChange({
            x: adjustedX,
            y: adjustedY,
            radius: newRadius,
            x_percent: toPercent(adjustedX, stageWidth),
            y_percent: toPercent(adjustedY, stageHeight),
            rotation: node.rotation(),
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
    ) : null;
  },
);

export const EllipseRenderer = forwardRef<Konva.Ellipse, ElementRendererProps>(
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
    const { toPercent } = usePercentConverter();
    const { fill, stroke } = useShapeProps(element);
    const ellipseEl = element as EllipseShape;
    const elements = useSelector((state: any) => state.canvas.elements);
    const snapThreshold = 2;

    return (element.visible ?? true) ? (
      <Ellipse
        ref={ref}
        id={ellipseEl.id?.toString()}
        x={ellipseEl.x + ellipseEl.radiusX}
        y={ellipseEl.y + ellipseEl.radiusY}
        radiusX={ellipseEl.radiusX}
        radiusY={ellipseEl.radiusY}
        fill={fill}
        stroke={stroke}
        strokeWidth={ellipseEl.strokeWidth}
        rotation={ellipseEl.rotation}
        opacity={ellipseEl.opacity}
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
          const { newX, newY } = calculateSnappingPosition(
            node,
            elements,
            element,
            snapThreshold,
            ellipseEl.radiusX,
            ellipseEl.radiusY,
          );
          const adjustedX = newX - ellipseEl.radiusX;
          const adjustedY = newY - ellipseEl.radiusY;
          onChange({
            x: adjustedX,
            y: adjustedY,
            x_percent: toPercent(adjustedX, stageWidth),
            y_percent: toPercent(adjustedY, stageHeight),
            width_percent: toPercent(element.width, stageWidth),
            height_percent: toPercent(element.height, stageHeight),
          });
          setGuides([]);
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          const newRadiusX = ellipseEl.radiusX * node.scaleX();
          const newRadiusY = ellipseElement.radiusY * node.scaleY();
          const adjustedX = node.x() - newRadiusX;
          const adjustedY = node.y() - newRadiusY;
          onChange({
            x: adjustedX,
            y: adjustedY,
            x_percent: toPercent(adjustedX, stageWidth),
            y_percent: toPercent(adjustedY, stageHeight),
            radiusX: newRadiusX,
            radiusY: newRadiusY,
            rotation: node.rotation(),
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
    ) : null;
  },
);

export const LineRenderer = forwardRef<Konva.Line, ElementRendererProps>(
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
    const { toPercent } = usePercentConverter();
    const { stroke } = useShapeProps(element);
    const lineEl = element as LineShape;
    const elements = useSelector((state: any) => state.canvas.elements);
    const snapThreshold = 2;

    const [x1, y1, x2, y2] = lineEl.points;
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const adjustedPoints = [
      x1 - centerX,
      y1 - centerY,
      x2 - centerX,
      y2 - centerY,
    ];
    const lineWidth = Math.abs(x2 - x1);
    const lineHeight = Math.abs(y2 - y1);

    return (element.visible ?? true) ? (
      <Line
        ref={ref}
        x={lineEl.x + centerX}
        y={lineEl.y + centerY}
        points={adjustedPoints}
        fill={lineEl.fill}
        stroke={stroke}
        strokeWidth={lineEl.strokeWidth}
        rotation={lineEl.rotation}
        opacity={lineEl.opacity}
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
          const { newX, newY } = calculateSnappingPosition(
            node,
            elements,
            element,
            snapThreshold,
            lineWidth / 2,
            lineHeight / 2,
          );
          onChange({
            x: newX - centerX,
            y: newY - centerY,
            width_percent: toPercent(element.width, stageWidth),
            height_percent: toPercent(element.height, stageHeight),
            x_percent: toPercent(e.target.x() - centerX, stageWidth),
            y_percent: toPercent(e.target.y() - centerY, stageHeight),
          });
          setGuides([]);
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          const newPoints = adjustedPoints.map((point, index) =>
            index % 2 === 0 ? point * scaleX : point * scaleY,
          );
          onChange({
            x: node.x() - centerX,
            y: node.y() - centerY,
            x_percent: toPercent(node.x() - centerX, stageWidth),
            y_percent: toPercent(node.y() - centerY, stageHeight),
            rotation: node.rotation(),
            points: newPoints.map((p, i) =>
              i % 2 === 0 ? p + centerX : p + centerY,
            ),
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
    ) : null;
  },
);

export const TriangleRenderer = forwardRef<
  Konva.RegularPolygon,
  ElementRendererProps
>(
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
    const { toPercent } = usePercentConverter();
    const { fill, stroke } = useShapeProps(element);
    const triangleEl = element as TriangleShape;
    const elements = useSelector((state: any) => state.canvas.elements);
    const snapThreshold = 2;
    const radius =
      triangleEl.radius ?? Math.max(triangleEl.width, triangleEl.height) / 2;

    return (element.visible ?? true) ? (
      <RegularPolygon
        ref={ref}
        id={triangleEl.id?.toString()}
        x={triangleEl.x + radius}
        y={triangleEl.y + radius}
        sides={3}
        radius={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={triangleEl.strokeWidth}
        rotation={triangleEl.rotation}
        opacity={triangleEl.opacity}
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
          const { newX, newY } = calculateSnappingPosition(
            node,
            elements,
            element,
            snapThreshold,
            radius,
            radius,
          );
          const adjustedX = newX - radius;
          const adjustedY = newY - radius;
          onChange({
            x: adjustedX,
            y: adjustedY,
            width: radius * 2,
            height: radius * 2,
            width_percent: toPercent(radius * 2, stageWidth),
            height_percent: toPercent(radius * 2, stageHeight),
            x_percent: toPercent(adjustedX, stageWidth),
            y_percent: toPercent(adjustedY, stageHeight),
            rotation: node.rotation(),
            radius,
          });
          setGuides([]);
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          const newRadius = radius * Math.max(node.scaleX(), node.scaleY());
          const adjustedX = node.x() - newRadius;
          const adjustedY = node.y() - newRadius;
          onChange({
            x: adjustedX,
            y: adjustedY,
            width: newRadius * 2,
            height: newRadius * 2,
            width_percent: toPercent(newRadius * 2, stageWidth),
            height_percent: toPercent(newRadius * 2, stageHeight),
            x_percent: toPercent(adjustedX, stageWidth),
            y_percent: toPercent(adjustedY, stageHeight),
            rotation: node.rotation(),
            radius: newRadius,
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
    ) : null;
  },
);

export const StarRenderer = forwardRef<Konva.Star, ElementRendererProps>(
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
    const { toPercent } = usePercentConverter();
    const { fill, stroke } = useShapeProps(element);
    const starEl = element as StarShape;
    const elements = useSelector((state: any) => state.canvas.elements);
    const snapThreshold = 2;
    const starWidth = starEl.outerRadius * 2;
    const starHeight = starEl.outerRadius * 2;

    return (element.visible ?? true) ? (
      <Star
        ref={ref}
        id={starEl.id?.toString()}
        x={starEl.x + starEl.outerRadius}
        y={starEl.y + starEl.outerRadius}
        innerRadius={starEl.innerRadius}
        outerRadius={starEl.outerRadius}
        numPoints={starEl.numPoints}
        fill={fill}
        stroke={stroke}
        strokeWidth={starEl.strokeWidth}
        rotation={starEl.rotation}
        opacity={starEl.opacity}
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
          const { newX, newY } = calculateSnappingPosition(
            node,
            elements,
            element,
            snapThreshold,
            starWidth / 2,
            starHeight / 2,
          );
          const adjustedX = newX - starEl.outerRadius;
          const adjustedY = newY - starEl.outerRadius;
          onChange({
            x: adjustedX,
            y: adjustedY,
            width_percent: toPercent(starWidth, stageWidth),
            height_percent: toPercent(starHeight, stageHeight),
            x_percent: toPercent(adjustedX, stageWidth),
            y_percent: toPercent(adjustedY, stageHeight),
          });
          setGuides([]);
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          const scale = Math.max(node.scaleX(), node.scaleY());
          const newInnerRadius = starEl.innerRadius * scale;
          const newOuterRadius = starEl.outerRadius * scale;
          const adjustedX = node.x() - newOuterRadius;
          const adjustedY = node.y() - newOuterRadius;
          onChange({
            x: adjustedX,
            y: adjustedY,
            x_percent: toPercent(adjustedX, stageWidth),
            y_percent: toPercent(adjustedY, stageHeight),
            rotation: node.rotation(),
            innerRadius: newInnerRadius,
            outerRadius: newOuterRadius,
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
    ) : null;
  },
);

export const WedgeRenderer = forwardRef<Konva.Wedge, ElementRendererProps>(
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
    const { toPercent } = usePercentConverter();
    const { fill, stroke } = useShapeProps(element);
    const wedgeEl = element as WedgeShape;
    const elements = useSelector((state: any) => state.canvas.elements);
    const snapThreshold = 2;
    const wedgeWidth = wedgeEl.radius * 2;
    const wedgeHeight = wedgeEl.radius * 2;

    return (element.visible ?? true) ? (
      <Wedge
        ref={ref}
        id={wedgeEl.id?.toString()}
        x={wedgeEl.x + wedgeEl.radius}
        y={wedgeEl.y + wedgeEl.radius}
        radius={wedgeEl.radius}
        angle={wedgeEl.angle}
        fill={fill}
        stroke={stroke}
        strokeWidth={wedgeEl.strokeWidth}
        rotation={wedgeEl.rotation}
        opacity={wedgeEl.opacity}
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
          const { newX, newY } = calculateSnappingPosition(
            node,
            elements,
            element,
            snapThreshold,
            wedgeWidth / 2,
            wedgeHeight / 2,
          );
          const adjustedX = newX - wedgeEl.radius;
          const adjustedY = newY - wedgeEl.radius;
          onChange({
            x: adjustedX,
            y: adjustedY,
            width_percent: toPercent(wedgeWidth, stageWidth),
            height_percent: toPercent(wedgeHeight, stageHeight),
            x_percent: toPercent(adjustedX, stageWidth),
            y_percent: toPercent(adjustedY, stageHeight),
          });
          setGuides([]);
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          const scale = (node.scaleX() + node.scaleY()) / 2;
          const newRadius = wedgeEl.radius * scale;
          const adjustedX = node.x() - newRadius;
          const adjustedY = node.y() - newRadius;
          onChange({
            x: adjustedX,
            y: adjustedY,
            x_percent: toPercent(adjustedX, stageWidth),
            y_percent: toPercent(adjustedY, stageHeight),
            radius: newRadius,
            rotation: node.rotation(),
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
    ) : null;
  },
);

export const RingRenderer = forwardRef<Konva.Ring, ElementRendererProps>(
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
    const { toPercent } = usePercentConverter();
    const { fill, stroke } = useShapeProps(element);
    const ringEl = element as RingShape;
    const elements = useSelector((state: any) => state.canvas.elements);
    const snapThreshold = 2;
    const ringWidth = ringEl.outerRadius * 2;
    const ringHeight = ringEl.outerRadius * 2;

    return (element.visible ?? true) ? (
      <Ring
        ref={ref}
        id={ringEl.id?.toString()}
        x={ringEl.x + ringEl.outerRadius}
        y={ringEl.y + ringEl.outerRadius}
        innerRadius={ringEl.innerRadius}
        outerRadius={ringEl.outerRadius}
        fill={fill}
        stroke={stroke}
        strokeWidth={ringEl.strokeWidth}
        rotation={ringEl.rotation}
        opacity={ringEl.opacity}
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
          const { newX, newY } = calculateSnappingPosition(
            node,
            elements,
            element,
            snapThreshold,
            ringWidth / 2,
            ringHeight / 2,
          );
          const adjustedX = newX - ringEl.outerRadius;
          const adjustedY = newY - ringEl.outerRadius;
          onChange({
            x: adjustedX,
            y: adjustedY,
            width_percent: toPercent(ringWidth, stageWidth),
            height_percent: toPercent(ringHeight, stageHeight),
            x_percent: toPercent(adjustedX, stageWidth),
            y_percent: toPercent(adjustedY, stageHeight),
          });
          setGuides([]);
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          const scale = (node.scaleX() + node.scaleY()) / 2;
          const newInnerRadius = ringEl.innerRadius * scale;
          const newOuterRadius = ringEl.outerRadius * scale;
          const adjustedX = node.x() - newOuterRadius;
          const adjustedY = node.y() - newOuterRadius;
          onChange({
            x: adjustedX,
            y: adjustedY,
            x_percent: toPercent(adjustedX, stageWidth),
            y_percent: toPercent(adjustedY, stageHeight),
            innerRadius: newInnerRadius,
            outerRadius: newOuterRadius,
            rotation: node.rotation(),
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
    ) : null;
  },
);

export const IconRenderer = forwardRef<Konva.Path, ElementRendererProps>(
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
    const { toPercent } = usePercentConverter();
    const { fill, stroke } = useShapeProps(element);
    const iconEl = element as IconShape;
    const elements = useSelector((state: any) => state.canvas.elements);

    return (
      <Path
        ref={ref}
        id={element.id}
        x={element.x}
        y={element.y}
        data={iconEl.path}
        fill={fill}
        stroke={stroke}
        strokeWidth={iconEl.strokeWidth}
        scaleX={element.scaleX}
        scaleY={element.scaleY}
        rotation={element.rotation ?? 0}
        draggable={draggable}
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
          const newX = node.x();
          const newY = node.y();
          onChange({
            x: newX,
            y: newY,
            width_percent: toPercent(element.width, stageWidth),
            height_percent: toPercent(element.height, stageHeight),
            x_percent: toPercent(newX, stageWidth),
            y_percent: toPercent(newY, stageHeight),
          });
          setGuides([]);
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          const adjustedX = node.x();
          const adjustedY = node.y();
          onChange({
            x: adjustedX,
            y: adjustedY,
            scaleX: scaleX,
            scaleY: scaleY,
            x_percent: toPercent(adjustedX, stageWidth),
            y_percent: toPercent(adjustedY, stageHeight),
            rotation: node.rotation(),
          });
        }}
        onClick={onSelect}
      />
    );
  },
);
