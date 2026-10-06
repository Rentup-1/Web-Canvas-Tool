// src/context/CanvasContext.tsx
import {
  createContext,
  useContext,
  useState,
  type FC,
  type RefObject,
} from "react";
import Konva from "konva";
import { useAppSelector } from "@/hooks/useRedux";
import { useDispatch } from "react-redux";
import {
  setAspectRatio,
  setElements,
  setStageSize,
  deselectAllElements,
} from "@/features/canvas/canvasSlice";
import { addColor, addFont } from "@/features/branding/brandingSlice";
import {
  canvasToV2Document,
  isV2Document,
  v2DocumentToCanvas,
} from "@/utils/v2DocumentConverter";
import type { TemplateDocumentV2 } from "@/types/templateDocumentV2";
import type { AspectRatio } from "@/features/canvas/types";

const deriveAspectRatio = (width: number, height: number): AspectRatio => {
  if (!width || !height) return "1:1";
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.05) return "1:1";
  if (Math.abs(ratio - 9 / 16) < 0.05) return "9:16";
  if (Math.abs(ratio - 16 / 9) < 0.05) return "16:9";
  return ratio > 1 ? "16:9" : ratio < 1 ? "9:16" : "1:1";
};

interface CanvasContextType {
  stageRef: RefObject<Konva.Stage>;
  handleExportJSON: () => void;
  handleExportPNG: () => void;
  handleExportSVG: () => void;
  handleExportSummary: () => void;
  handleImport: (jsonData: string | Record<string, unknown>) => void;
  getV2Document: () => TemplateDocumentV2;
  getV2DocumentJSON: () => string;
  projectIdMixer: number;
  setProjectIdMixer: (val: number) => void;
  imageSrc: string;
  setImageSrc: (val: string) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: FC<{
  children: React.ReactNode;
  stageRef: RefObject<Konva.Stage>;
}> = ({ children, stageRef }) => {
  const dispatch = useDispatch();
  const elements = useAppSelector((state) => state.canvas.elements);
  const stageHeight = useAppSelector((state) => state.canvas.stageHeight);
  const stageWidth = useAppSelector((state) => state.canvas.stageWidth);
  const aspectRatio = useAppSelector((state) => state.canvas.aspectRatio);
  const brandingColors = useAppSelector((state) => state.branding.colors);
  const brandingFonts = useAppSelector((state) => state.branding.fontFamilies);
  const [projectIdMixer, setProjectIdMixer] = useState(0);
  const [imageSrc, setImageSrc] = useState("");

  const waitForNextFrame = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  const getV2Document = (): TemplateDocumentV2 => {
    return canvasToV2Document(elements, stageWidth, stageHeight, {
      colors: brandingColors,
      fonts: brandingFonts,
    });
  };

  const getV2DocumentJSON = (): string => {
    return JSON.stringify(getV2Document(), null, 2);
  };

  const handleExportJSON = () => {
    const v2Doc = getV2Document();
    const dataStr = JSON.stringify(v2Doc, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "canvas-template-v2.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = async () => {
    if (!stageRef.current) {
      alert("Stage is not available.");
      return;
    }
    try {
      dispatch(deselectAllElements());
      await waitForNextFrame();
      const dataURL = stageRef.current.toDataURL({
        mimeType: "image/png",
        quality: 1,
      });
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "canvas-design.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Failed to export PNG.");
      console.error(error);
    }
  };

  const handleExportSVG = () => {
    if (!stageRef.current) {
      alert("Stage is not available.");
      return;
    }
    try {
      const dataURL = stageRef.current.toDataURL({
        mimeType: "image/svg+xml",
      });
      const blob = new Blob([dataURL], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "canvas-design.svg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to export SVG.");
      console.error(error);
    }
  };

  const handleImport = (input: string | Record<string, unknown>) => {
    try {
      let importedData: any = input;
      if (typeof input === "string") {
        importedData = JSON.parse(input);
      }

      if (!importedData) {
        alert("Invalid input data.");
        return;
      }

      // Check if Schema V2 document
      if (isV2Document(importedData)) {
        const convertedElements = v2DocumentToCanvas(importedData);
        const stageW = importedData.stage?.width || 1080;
        const stageH = importedData.stage?.height || 1080;

        dispatch(setElements(convertedElements));
        dispatch(setStageSize({ width: stageW, height: stageH }));
        dispatch(setAspectRatio(deriveAspectRatio(stageW, stageH)));
        return;
      }

      // Check if wrapper object has .document (v2)
      if (importedData.document && isV2Document(importedData.document)) {
        const convertedElements = v2DocumentToCanvas(importedData.document);
        const stageW = importedData.document.stage?.width || 1080;
        const stageH = importedData.document.stage?.height || 1080;

        dispatch(setElements(convertedElements));
        dispatch(setStageSize({ width: stageW, height: stageH }));
        dispatch(setAspectRatio(deriveAspectRatio(stageW, stageH)));
        return;
      }

      // Legacy document format
      if (
        Array.isArray(importedData.elements) &&
        importedData.stage &&
        importedData.stage.height &&
        importedData.stage.width
      ) {
        dispatch(setElements(importedData.elements));
        dispatch(
          setStageSize({
            height: importedData.stage.height,
            width: importedData.stage.width,
          })
        );
        dispatch(
          setAspectRatio(
            importedData.stage.aspectRatio ||
              deriveAspectRatio(
                importedData.stage.width,
                importedData.stage.height
              )
          )
        );

        if (importedData.branding?.colors) {
          Object.entries(importedData.branding.colors).forEach(
            ([key, value]) => {
              dispatch(addColor({ key, value: String(value) }));
            }
          );
        }

        if (importedData.branding?.fonts) {
          Object.entries(importedData.branding.fonts).forEach(
            ([key, fontData]: [string, any]) => {
              dispatch(
                addFont({
                  key,
                  value: fontData.value,
                  isFile: fontData.isFile,
                  variant: fontData.variant,
                })
              );
            }
          );
        }
      } else {
        alert("Invalid template structure.");
      }
    } catch (error) {
      alert("Failed to import template. Invalid format.");
      console.error("Import error:", error);
    }
  };

  const handleExportSummary = () => {
    const v2Doc = getV2Document();
    const frames = v2Doc.elements
      .filter((el) => el.type === "frame")
      .map((el) => {
        const f = el as import("@/types/templateDocumentV2").FrameElementV2;
        return {
          slotIndex: f.slot.index,
          assetType: f.slot.assetType,
          tags: f.slot.tags,
          fit: f.fit,
        };
      });

    const texts = v2Doc.elements
      .filter((el) => el.type === "text")
      .map((el) => {
        const t = el as import("@/types/templateDocumentV2").TextElementV2;
        return {
          id: t.id,
          content: t.content,
          text: t.text,
          fontFamily: t.font.family,
          fontRole: t.font.role,
        };
      });

    const summary = {
      stage: v2Doc.stage,
      frames,
      texts,
    };

    const dataStr = JSON.stringify(summary, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "template-v2-summary.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const value: CanvasContextType = {
    stageRef,
    handleExportSummary,
    handleExportJSON,
    handleExportPNG,
    handleExportSVG,
    handleImport,
    getV2Document,
    getV2DocumentJSON,
    projectIdMixer,
    setProjectIdMixer,
    imageSrc,
    setImageSrc,
  };

  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};
