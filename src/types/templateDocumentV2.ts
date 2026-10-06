// src/types/templateDocumentV2.ts

export type BrandColorRole = "primary" | "secondary" | "accent" | null;
export type BrandFontRole = "primary" | "secondary" | null;

export type FrameAssetType =
  | "image"
  | "project_logo"
  | "developer_logo"
  | "other_logo";

export type FrameFit = "cover" | "contain" | "stretch";

export interface FrameSlot {
  index: number;
  assetType: FrameAssetType;
  tags: string[];
}

export interface FrameElementV2 {
  id: string;
  type: "frame";
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  slot: FrameSlot;
  fit: FrameFit;
  cornerRadius?: number;
  stroke?: string | null;
  strokeWidth?: number;
  dash?: number[];
}

export type ShapeKind = "rect" | "ellipse" | "polygon" | "star" | "ring";

export interface ShapeFill {
  color: string;
  role: BrandColorRole;
}

export interface ShapeElementV2 {
  id: string;
  type: "shape";
  shape: ShapeKind;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  fill: ShapeFill;
  stroke?: string | null;
  strokeWidth?: number;
  dash?: number[];
  // rect specific:
  cornerRadius?: number | [number, number, number, number];
  // polygon specific:
  sides?: number;
  // star specific:
  points?: number;
  innerRatio?: number;
}

export interface ImageElementV2 {
  id: string;
  type: "image";
  name?: string;
  assetId?: number;
  src?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  fit: "contain" | "cover" | "stretch";
  cornerRadius?: number;
  stroke?: string | null;
  strokeWidth?: number;
}

export type TextCopySource = "headline" | "punchline" | "cta";

export type TextContent =
  | { source: "copy"; key: TextCopySource }
  | { source: "toi"; key: string }
  | { source: "static"; key: null };

export interface TextFont {
  family: string;
  role: BrandFontRole;
  size: number;
  weight: number | string;
  style: "normal" | "italic";
}

export interface TextFitText {
  mode: "none" | "shrink";
  minSize: number | null;
}

export interface TextElementV2 {
  id: string;
  type: "text";
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  content: TextContent;
  text: string;
  font: TextFont;
  fill: ShapeFill;
  align: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  lineHeight?: number;
  letterSpacing?: number;
  direction?: "auto" | "ltr" | "rtl";
  wrap?: "word" | "none";
  fitText?: TextFitText;
  background?: string | null;
  padding?: number;
  cornerRadius?: number;
  borderWidth?: number;
  borderColor?: string | null;
  borderStyle?: number[];
}

export type TemplateElementV2 =
  | FrameElementV2
  | ShapeElementV2
  | ImageElementV2
  | TextElementV2;

export interface TemplateStageV2 {
  width: number;
  height: number;
}

export interface TemplateDocumentV2 {
  schemaVersion: 2;
  stage: TemplateStageV2;
  elements: TemplateElementV2[];
  meta?: {
    warnings?: string[];
  };
}

// Vocabulary interface
export interface ToiLabelVocabulary {
  label: string;
  example_en: string | null;
  example_ar: string | null;
  has_value: boolean;
}

export interface TagVocabulary {
  tag: string;
  count: number;
}

export interface BrandVocabulary {
  colors: {
    primary: string | null;
    secondary: string | null;
    accent: string | null;
  };
  fonts: {
    primary: string | null;
    secondary: string | null;
  };
}

export interface TemplateVocabularyResponse {
  copy_keys: string[];
  toi_labels: ToiLabelVocabulary[];
  asset_types: FrameAssetType[];
  tags: TagVocabulary[];
  brand: BrandVocabulary;
}

// Revisions interface
export interface TemplateRevisionItem {
  revision: number;
  source: string;
  created_by?: string | number | null;
  created_at: string;
  document?: TemplateDocumentV2;
}
