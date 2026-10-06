// src/features/canvas/types.ts
import type {
  BrandColorRole,
  BrandFontRole,
  FrameAssetType,
  FrameFit,
  ShapeKind,
  TextContent,
  TextCopySource,
  TextFitText,
} from "@/types/templateDocumentV2";

export type ElementType =
  | "text"
  | "frame"
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
  | "arrow"
  | "icon"
  | "shape"
  | "group";

export type FitMode = "fill" | "fit" | "stretch";
export type BrandingType = "fixed" | "dynamic";

export interface CanvasElement {
  id: string;
  name?: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  x_percent?: number;
  y_percent?: number;
  width_percent?: number;
  height_percent?: number;
  rotation?: number;
  selected?: boolean;
  fill: string;
  opacity?: number;
  stroke?: string;
  strokeWidth?: number;
  fillBrandingType?: string;
  strokeBrandingType?: string;
  fillRole?: BrandColorRole;
  strokeRole?: BrandColorRole;
  locked?: boolean;
  visible?: boolean;
  zIndex?: number;

  // Frame specific
  dash?: number[];
  frameId?: string | null;
  tags?: string[];
  slotIndex?: number;
  assetType?: FrameAssetType | string;
  fitMode?: string;
  objectFit?: "cover" | "contain" | "fill";
  frame_position_in_template?: string | number;
  label?: string;

  // Image specific
  src?: string;
  assetId?: number;
  originalWidth?: number;
  originalHeight?: number;

  // Icon specific
  icon?: string;
  iconName?: string;
  color?: string;
  path?: string;

  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontVariant?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  fontRole?: BrandFontRole;
  fontBrandingType?: BrandingType;
  background?: string;
  backgroundStroke?: string;
  backgroundStrokeWidth?: number;
  padding?: number;
  textDecoration?: "none" | "underline";
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  lineHeight?: number;
  letterSpacing?: number;
  direction?: "auto" | "ltr" | "rtl";
  wrap?: "word" | "none";
  white_space?: string;
  contentSource?: "copy" | "toi" | "static";
  contentKey?: TextCopySource | string | null;
  content?: TextContent;
  toi_labels?: string;
  fitTextMode?: "none" | "shrink";
  fitTextMinSize?: number | null;
  fitText?: TextFitText;

  // Shapes & Geometry
  shapeKind?: ShapeKind;
  sides?: number;
  numPoints?: number;
  innerRadius?: number;
  outerRadius?: number;
  innerRatio?: number;
  radius?: number;
  radiusX?: number;
  radiusY?: number;
  angle?: number;
  points?: number[];
  pointerLength?: number;
  pointerWidth?: number;
  cornerRadius?: number | [number, number, number, number];
  borderRadiusSpecial?: number;
  borderRadius?: {
    topLeft?: number;
    topRight?: number;
    bottomRight?: number;
    bottomLeft?: number;
  };

  // Grouping
  groupId?: string;
  childEl?: CanvasElement[];
  grouped?: boolean;
  parentGroupId?: string;

  // Dynamic / Transformation
  scaleX?: number;
  scaleY?: number;
  newWidth?: number;
  newHeight?: number;
  fontSize_percent?: number;
  isSelected?: string;
}

export interface CanvasFrameElement extends CanvasElement {
  type: "frame";
  dash: number[];
  frameId: string | null;
  tags: string[];
  label: string;
  assetType: FrameAssetType | string;
  frame_position_in_template: string;
  slotIndex?: number;
}

export interface CanvasTextElement extends CanvasElement {
  type: "text";
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontVariant?: string;
  background?: string;
  padding?: number;
  backgroundStroke?: string;
  backgroundStrokeWidth: number;
  fontBrandingType?: BrandingType;
  fontRole?: BrandFontRole;
  contentSource?: "copy" | "toi" | "static";
  contentKey?: TextCopySource | string | null;
  content?: TextContent;
  toi_labels?: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration?: "none" | "underline";
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  lineHeight?: number;
  letterSpacing?: number;
  direction?: "auto" | "ltr" | "rtl";
  wrap?: "word" | "none";
  fitText?: TextFitText;
  borderRadius?: {
    topLeft?: number;
    topRight?: number;
    bottomRight?: number;
    bottomLeft?: number;
  };
  white_space?: string;
}

export interface CanvasImageElement extends CanvasElement {
  type: "image";
  src?: string;
  assetId?: number;
  fitMode?: FitMode;
  originalWidth?: number;
}

// ===== Shapes Elements =====
export interface CircleShape extends CanvasElement {
  type: "circle";
  radius: number;
}

export interface IconShape extends CanvasElement {
  type: "icon";
  iconName: string;
  color: string;
}

export interface RectangleShape extends CanvasElement {
  type: "rectangle";
  width: number;
  height: number;
  cornerRadius?: number | [number, number, number, number];
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
  radius: number;
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

export interface CanvasGroupElement extends CanvasElement {
  type: "group";
  children: CanvasElement[];
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
  | ArrowShape
  | IconShape
  | CanvasFrameElement
  | CanvasGroupElement;

export type AspectRatio = "1:1" | "9:16" | "16:9";
