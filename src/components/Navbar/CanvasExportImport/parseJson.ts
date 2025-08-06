export type ProcessedCanvasData = {
  elements: any[];
  stage: {
    width: number;
    height: number;
  };
  aspectRatio: number;
  branding?: {
    colors?: Record<string, string>;
    fonts?: Record<string, { value: string; isFile: boolean; variant: string }>;
  };
};

export const processImportedJson = (importedData: any) => {
  const mapFitMode = (backendFit: string): "fit" | "fill" | "stretch" => {
    switch (backendFit) {
      case "contain":
        return "fit";
      case "cover":
        return "fill";
      case "stretch":
        return "stretch";
      default:
        return "fill";
    }
  };

  const elements = [...importedData.elements];

  importedData.frames?.forEach((frame: any) => {
    const frameIndex = elements.findIndex(
      (el: any) =>
        Number(el.frame_position_in_template) === Number(frame.frame_position_in_template)
    );

    if (frameIndex !== -1) {
      const frameElement = elements[frameIndex];

      elements[frameIndex] = {
        ...frameElement,
        type: "frame",
        zIndex: 1,
      };

      const image = frame.assets?.[0];
      if (image?.image_url) {
        const fitMode = mapFitMode(frame.objectFit || frame.fitMode || "fill");

        const imageElement = {
          id: `image-${frameElement.id}`,
          type: "image",
          frameId: frameElement.id,
          x: frameElement.x,
          y: frameElement.y,
          width: frameElement.width,
          height: frameElement.height,
          src: `https://api.markomlabs.com${image.image_url}`,
          originalWidth: image.width || frameElement.width,
          originalHeight: image.height || frameElement.height,
          fitMode,
          opacity: frameElement.opacity ?? 1,
          zIndex: 0,
        };

        elements.splice(frameIndex + 1, 0, imageElement);
      }
    }
  });

  elements.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return {
    elements,
    width: importedData.width,
    height: importedData.height,
    scale: importedData.scale,
    branding: importedData.branding,
  };
};

