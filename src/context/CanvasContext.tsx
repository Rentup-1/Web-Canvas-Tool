import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useMemo,
  type FC,
  type RefObject,
} from "react";
import Konva from "konva";
import { useAppSelector } from "@/hooks/useRedux";
import transformElementsKeys from "@/utils/transformElementKeys";
import { useDispatch } from "react-redux";
import {
  setAspectRatio,
  setElements,
  setStageSize,
  deselectAllElements,
} from "@/features/canvas/canvasSlice";
import { addColor, addFont } from "@/features/branding/brandingSlice";

interface CanvasContextType {
  stageRef: RefObject<Konva.Stage>;
  handleExportJSON: () => void;
  handleExportTemplateToParent: () => void;
  handleExportPNG: () => void;
  handleExportSVG: () => void;
  handleExportSummary: () => void;
  handleImport: (jsonData: string) => void;
  projectIdMixer: number;
  setProjectIdMixer: (val: number) => void;
  imageSrc: string;
  setImageSrc: (val: string) => void;
  isTemplateEditMode: boolean;
  setIsTemplateEditMode: (val: boolean) => void;
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
  const [isTemplateEditMode, setIsTemplateEditMode] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      return (
        searchParams.get("intent") === "templateEdit" ||
        searchParams.get("mode") === "template-generator"
      );
    } catch {
      return false;
    }
  });

  const stateRef = useRef({
    elements,
    stageHeight,
    stageWidth,
    aspectRatio,
    brandingColors,
    brandingFonts,
  });
  stateRef.current = {
    elements,
    stageHeight,
    stageWidth,
    aspectRatio,
    brandingColors,
    brandingFonts,
  };

  const waitForNextFrame = useCallback(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
    [],
  );

  const handleExportJSON = useCallback(() => {
    const { elements: currentElements, stageHeight: currentHeight, stageWidth: currentWidth, aspectRatio: currentAspect, brandingColors: currentColors, brandingFonts: currentFonts } = stateRef.current;
    const keyMappingsByType = {
      text: {
        backgroundStrokeWidth: "borderWidth",
        backgroundStroke: "borderColor",
        dashed: "borderStyle",
      },
      frame: {
        dash: "borderStyle",
        strokeWidth: "borderWidth",
        stroke: "borderColor",
      },
    };

    const fallbackMapping = {
      stroke: "borderColor",
      strokeWidth: "borderWidth",
      backgroundStroke: "borderColor",
      backgroundStrokeWidth: "borderWidth",
      dashed: "borderStyle",
    };

    const transformedElements = transformElementsKeys(
      currentElements,
      keyMappingsByType,
      fallbackMapping,
    );

    const exportData = {
      elements: transformedElements,
      stage: {
        height: currentHeight,
        width: currentWidth,
        aspectRatio: currentAspect,
      },
      branding: {
        colors: currentColors,
        fonts: currentFonts,
      },
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "canvas-design.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleExportTemplateToParent = useCallback(() => {
    const { elements: currentElements, stageHeight: currentHeight, stageWidth: currentWidth, aspectRatio: currentAspect, brandingColors: currentColors, brandingFonts: currentFonts } = stateRef.current;
    const keyMappingsByType = {
      text: {
        backgroundStrokeWidth: "borderWidth",
        backgroundStroke: "borderColor",
        dashed: "borderStyle",
      },
      frame: {
        dash: "borderStyle",
        strokeWidth: "borderWidth",
        stroke: "borderColor",
      },
    };

    const fallbackMapping = {
      stroke: "borderColor",
      strokeWidth: "borderWidth",
      backgroundStroke: "borderColor",
      backgroundStrokeWidth: "borderWidth",
      dashed: "borderStyle",
    };

    // Filter out temporary image elements that were placed inside frames
    const filteredElements = currentElements.filter((el) => el.type !== "image");

    const transformedElements = transformElementsKeys(
      filteredElements,
      keyMappingsByType,
      fallbackMapping,
    );

    const exportData = {
      elements: transformedElements,
      stage: {
        height: currentHeight,
        width: currentWidth,
        aspectRatio: currentAspect,
      },
      branding: {
        colors: currentColors,
        fonts: currentFonts,
      },
    };

    window.parent.postMessage(
      {
        type: "TEMPLATE_EXPORTED",
        payload: {
          json: JSON.stringify(exportData, null, 2),
        },
      },
      "*",
    );
  }, []);

  const handleExportPNG = useCallback(async () => {
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
  }, [dispatch, stageRef, waitForNextFrame]);

  const handleExportSVG = useCallback(() => {
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
  }, [stageRef]);

  const handleImport = useCallback(
    (jsonData: string) => {
      try {
        const importedData = JSON.parse(jsonData);

        if (
          importedData &&
          Array.isArray(importedData.elements) &&
          importedData.stage &&
          importedData.stage.height &&
          importedData.stage.width &&
          importedData.stage.aspectRatio
        ) {
          dispatch(setElements(importedData.elements));
          dispatch(
            setStageSize({
              height: importedData.stage.height,
              width: importedData.stage.width,
            }),
          );
          dispatch(setAspectRatio(importedData.stage.aspectRatio));

          if (importedData.branding?.colors) {
            Object.entries(importedData.branding.colors).forEach(
              ([key, value]) => {
                dispatch(addColor({ key, value: String(value) }));
              },
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
                  }),
                );
              },
            );
          }

          console.log("✅ Import successful");
        } else {
          alert("❌ Invalid file structure.");
        }
      } catch (error) {
        alert("❌ Failed to import. Invalid JSON format.");
        console.error("Import error:", error);
      }
    },
    [dispatch],
  );

  const handleExportSummary = useCallback(() => {
    const { elements: currentElements } = stateRef.current;
    const frames: {
      assetType: string | null;
      fitMode: string | null;
      objectFit: string | null;
      tags: string[];
      frame_position_in_template: number | null;
    }[] = [];

    const texts: {
      id: string;
      tags: string[];
      toi_labels: string[];
    }[] = [];

    currentElements.forEach((el) => {
      if (el.type === "frame") {
        const frameEl = el as {
          assetType?: string;
          fitMode?: string;
          objectFit?: string;
          tags?: string[];
          frame_position_in_template?: number;
        };

        frames.push({
          assetType: frameEl.assetType || null,
          fitMode: frameEl.fitMode || null,
          objectFit: frameEl.objectFit || null,
          tags: frameEl.tags || [],
          frame_position_in_template:
            frameEl.frame_position_in_template ?? null,
        });
      } else if (el.type === "text") {
        const textEl = el as {
          id: string;
          tags: string[];
          toi_labels?: string[];
        };

        texts.push({
          id: textEl.id,
          tags: textEl.tags || [],
          toi_labels: textEl.toi_labels || [],
        });
      }
    });

    const summary = {
      frames,
      texts,
    };

    const dataStr = JSON.stringify(summary, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "canvas-summary.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const value: CanvasContextType = useMemo(
    () => ({
      stageRef,
      handleExportSummary,
      handleExportJSON,
      handleExportTemplateToParent,
      handleExportPNG,
      handleExportSVG,
      handleImport,
      projectIdMixer,
      setProjectIdMixer,
      imageSrc,
      setImageSrc,
      isTemplateEditMode,
      setIsTemplateEditMode,
    }),
    [
      stageRef,
      handleExportSummary,
      handleExportJSON,
      handleExportTemplateToParent,
      handleExportPNG,
      handleExportSVG,
      handleImport,
      projectIdMixer,
      imageSrc,
      isTemplateEditMode,
    ],
  );

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
