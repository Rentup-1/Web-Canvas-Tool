export type ElementType =
  | "text"
  | "image"
  | "circle"
  | "rectangle"
  | "ellipse"
  | "line"
  | "triangle"
  | "star"
  | "custom"
  | "regularPolygon"
  | "arc"
  | "wedge"
  | "ring"
  | "arrow";

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  background?: string;
  label?: string;
  selected?: boolean;
  fill?: string;
  opacity?: number;
  stroke?: string;
  strokeWidth?: number;
  fillBrandingType?: BrandingType;
  strokeBrandingType?: BrandingType;
}

export interface CanvasTextElement extends CanvasElement {
  type: "text";
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  background?: string;
  padding?: number;
  colorBrandingType?: "primary" | "secondary" | "additional" | "fixed";
  backgroundBrandingType?: "primary" | "secondary" | "additional" | "fixed";
  fontBrandingType?: "primary" | "secondary" | "additional" | "fixed";
  label?: string;
  borderRadius?: {
    topLeft?: number;
    topRight?: number;
    bottomRight?: number;
    bottomLeft?: number;
  };
}

export interface CanvasImageElement extends CanvasElement {
  type: "image";
  src?: string;
}

// ===== Shapes Elements =====
export interface CircleShape extends CanvasElement {
  type: "circle";
  radius: number;
}

export interface RectangleShape extends CanvasElement {
  type: "rectangle";
  width: number;
  height: number;
  cornerRadius?: number | number[];
  borderRadius?: {
    topLeft?: number;
    topRight?: number;
    bottomRight?: number;
    bottomLeft?: number;
  };
}

export interface EllipseShape extends CanvasElement {
  type: "ellipse";
  radiusX: number;
  radiusY: number;
}

export interface LineShape extends CanvasElement {
  type: "line";
  points: number[];
}

export interface TriangleShape extends CanvasElement {
  type: "triangle";
  points: number[];
}

export interface StarShape extends CanvasElement {
  type: "star";
  innerRadius: number;
  outerRadius: number;
  numPoints: number;
}

export interface CustomShape extends CanvasElement {
  type: "custom";
  points: number[];
}

export interface RegularPolygonShape extends CanvasElement {
  type: "regularPolygon";
  sides: number;
  radius: number;
}

export interface ArcShape extends CanvasElement {
  type: "arc";
  innerRadius: number;
  outerRadius: number;
  angle: number;
}

export interface WedgeShape extends CanvasElement {
  type: "wedge";
  radius: number;
  angle: number;
}

export interface RingShape extends CanvasElement {
  type: "ring";
  innerRadius: number;
  outerRadius: number;
}

export interface ArrowShape extends CanvasElement {
  type: "arrow";
  points: number[];
  pointerLength?: number;
  pointerWidth?: number;
}

export type CanvasElementUnion =
  | CanvasElement
  | CanvasTextElement
  | CanvasImageElement
  | CircleShape
  | RectangleShape
  | EllipseShape
  | LineShape
  | TriangleShape
  | StarShape
  | CustomShape
  | RegularPolygonShape
  | ArcShape
  | WedgeShape
  | RingShape
  | ArrowShape;

export type AspectRatio = "1:1" | "9:16";
export type BrandingType = "primary" | "secondary" | "additional" | "fixed";
