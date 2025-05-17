export type ElementType = "rect" | "text" | "image";

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  selected?: boolean;
  fill?: string;
  opacity?: number;

  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  background?: string;
  padding?: number;
  colorBrandingType?: "primary" | "secondary" | "additional" | "fixed";
  backgroundBrandingType?: "primary" | "secondary" | "additional" | "fixed";
  fontBrandingType?: "primary" | "secondary" | "additional" | "fixed";
  label?: string;

  // Image specific
  src?: string;
}
