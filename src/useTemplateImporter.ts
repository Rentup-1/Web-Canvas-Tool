import { useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  setAspectRatio,
  setElements,
  setStageSize,
} from "./features/canvas/canvasSlice";
import { addColor, addFont } from "./features/branding/brandingSlice";

export const useTemplateImporter = () => {
  const dispatch = useDispatch();

  const importTemplate = useCallback(
    (json: string | null) => {
      if (!json) return;

      try {
        const importedData = JSON.parse(json);
        if (!importedData || !Array.isArray(importedData.elements)) return;

        const elements = [...importedData.elements];

        importedData.frames?.forEach((frame: any) => {
          const frameIndex = elements.findIndex(
            (el: any) =>
              Number(el.frame_position_in_template) ===
              Number(frame.frame_position_in_template)
          );

          if (frameIndex !== -1) {
            const frameElement = elements[frameIndex];
            elements[frameIndex] = {
              ...frameElement,
              type: "frame",
              zIndex: 1,
            };

            if (frame.assets?.[0]?.image_url) {
              const fitMode =
                frame.objectFit === "contain"
                  ? "fit"
                  : frame.objectFit === "cover"
                  ? "fill"
                  : "stretch";
              const imageElement = {
                id: `image-${frameElement.id}`,
                type: "image",
                frameId: frameElement.id,
                x: frameElement.x,
                y: frameElement.y,
                width: frameElement.width,
                height: frameElement.height,
                src: `https://api.markomlabs.com${frame.assets[0].image_url}`,
                originalWidth: frame.assets[0].width || frameElement.width,
                originalHeight: frame.assets[0].height || frameElement.height,
                fitMode,
                opacity: frameElement.opacity ?? 1,
                zIndex: 0,
              };
              elements.splice(frameIndex + 1, 0, imageElement);
            }
          }
        });

        elements.sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0));

        dispatch(setElements(elements));
        dispatch(
          setStageSize({
            width: importedData.width,
            height: importedData.height,
          })
        );
        dispatch(setAspectRatio(importedData.scale));

        if (importedData.branding) {
          const { colors, fonts } = importedData.branding;
          colors &&
            Object.entries(colors).forEach(([key, value]) => {
              dispatch(addColor({ key, value: String(value) }));
            });
          fonts &&
            Object.entries(fonts).forEach(([key, fontData]: [string, any]) => {
              dispatch(
                addFont({
                  key,
                  value: fontData.value,
                  isFile: fontData.isFile,
                  variant: fontData.variant,
                })
              );
            });
        }
      } catch (error) {
        console.error("Template import error:", error);
      }
    },
    [dispatch]
  );

  return { importTemplate };
};
