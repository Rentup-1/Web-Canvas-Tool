export type ElementType = "rect" | "text" | "image" | "frame";
export type FitMode = "fill" | "fit" | "stretch";

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
  name?: string;

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
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  borderRadius?: {
    topLeft?: number;
    topRight?: number;
    bottomRight?: number;
    bottomLeft?: number;
  };

  // frame specific
  stroke?: string;
  strokeWidth?: number;
  dash?: number[];
  frameId?: string | null;
  tags?:string[]
  
  // Image specific
  src?: string;
  fitMode?: FitMode; // default "fill"
  originalWidth?: number;
  originalHeight?: number
  
}

export type AspectRatio = "1:1" | "9:16";
