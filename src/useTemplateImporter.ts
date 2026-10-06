// src/useTemplateImporter.ts
import { useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  setAspectRatio,
  setElements,
  setStageSize,
} from "./features/canvas/canvasSlice";
import { addColor, addFont } from "./features/branding/brandingSlice";
import { getAssetUrl } from "./services/api";
import { isV2Document, v2DocumentToCanvas } from "./utils/v2DocumentConverter";
import type { AspectRatio } from "./features/canvas/types";

const deriveAspectRatio = (width: number, height: number): AspectRatio => {
  if (!width || !height) return "1:1";
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.05) return "1:1";
  if (Math.abs(ratio - 9 / 16) < 0.05) return "9:16";
  if (Math.abs(ratio - 16 / 9) < 0.05) return "16:9";
  return ratio > 1 ? "16:9" : ratio < 1 ? "9:16" : "1:1";
};

export const useTemplateImporter = () => {
  const dispatch = useDispatch();

  const importTemplate = useCallback(
    async (input: string | Record<string, unknown> | null) => {
      if (!input) return;

      try {
        let importedData: any = input;
        if (typeof input === "string") {
          importedData = JSON.parse(input);
        }

        if (!importedData) return;

        // 1. Check if Schema V2 Template Document
        if (isV2Document(importedData)) {
          const elements = v2DocumentToCanvas(importedData);
          const stageW = importedData.stage?.width || 1080;
          const stageH = importedData.stage?.height || 1080;

          dispatch(setElements(elements));
          dispatch(setStageSize({ width: stageW, height: stageH }));
          dispatch(setAspectRatio(deriveAspectRatio(stageW, stageH)));
          return;
        }

        // 2. Check if object has document inside (e.g. TemplateData with .document)
        if (importedData.document && isV2Document(importedData.document)) {
          const elements = v2DocumentToCanvas(importedData.document);
          const stageW = importedData.document.stage?.width || 1080;
          const stageH = importedData.document.stage?.height || 1080;

          dispatch(setElements(elements));
          dispatch(setStageSize({ width: stageW, height: stageH }));
          dispatch(setAspectRatio(deriveAspectRatio(stageW, stageH)));
          return;
        }

        // 3. Fallback: Legacy Template Importer
        if (!Array.isArray(importedData.elements)) return;

        const elements = [...importedData.elements];
        const imageLoadPromises: Promise<void>[] = [];

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

              const imageUrl = getAssetUrl(frame.assets[0].image_url);

              const imageLoadPromise = new Promise<void>((resolve) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                  const imgW = img.naturalWidth;
                  const imgH = img.naturalHeight;
                  const frameAspect = frameElement.width / frameElement.height;
                  const imgAspect = imgW / imgH;

                  let newWidth = frameElement.width;
                  let newHeight = frameElement.height;
                  let offsetX = 0;
                  let offsetY = 0;

                  switch (fitMode) {
                    case "fit":
                      if (imgAspect > frameAspect) {
                        newWidth = frameElement.width;
                        newHeight = frameElement.width / imgAspect;
                      } else {
                        newHeight = frameElement.height;
                        newWidth = frameElement.height * imgAspect;
                      }
                      break;

                    case "fill":
                    default:
                      if (imgAspect < frameAspect) {
                        newWidth = frameElement.width;
                        newHeight = frameElement.width / imgAspect;
                      } else {
                        newHeight = frameElement.height;
                        newWidth = frameElement.height * imgAspect;
                      }
                      break;

                    case "stretch":
                      newWidth = frameElement.width;
                      newHeight = frameElement.height;
                      break;
                  }

                  offsetX = (frameElement.width - newWidth) / 2;
                  offsetY = (frameElement.height - newHeight) / 2;

                  const imageElement = {
                    id: `image-${frameElement.id}`,
                    type: "image",
                    frameId: frameElement.id,
                    x: frameElement.x + offsetX,
                    y: frameElement.y + offsetY,
                    width: newWidth,
                    height: newHeight,
                    src: imageUrl,
                    originalWidth: imgW,
                    originalHeight: imgH,
                    fitMode,
                    opacity: frameElement.opacity ?? 1,
                    rotation: frameElement.rotation ?? 0,
                    zIndex: 0,
                  };
                  elements.splice(frameIndex + 1, 0, imageElement);
                  resolve();
                };
                img.onerror = () => {
                  resolve();
                };
                img.src = imageUrl;
              });

              imageLoadPromises.push(imageLoadPromise);
            }
          }
        });

        await Promise.all(imageLoadPromises);

        elements.sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0));

        dispatch(setElements(elements));
        if (importedData.width && importedData.height) {
          dispatch(
            setStageSize({
              width: importedData.width,
              height: importedData.height,
            })
          );
        } else if (importedData.stage?.width && importedData.stage?.height) {
          dispatch(
            setStageSize({
              width: importedData.stage.width,
              height: importedData.stage.height,
            })
          );
        }

        if (importedData.scale || importedData.stage?.aspectRatio) {
          dispatch(
            setAspectRatio(
              importedData.scale || importedData.stage?.aspectRatio
            )
          );
        }

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
