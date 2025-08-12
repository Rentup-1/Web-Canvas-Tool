type ImportedData = {
  elements: any[];
  width: number;
  height: number;
  scale: number;
  frames?: any[];
  branding?: {
    colors?: Record<string, string>;
    fonts?: Record<
      string,
      {
        value: string;
        isFile?: boolean;
        variant?: string;
      }
    >;
  };
};

type TemplateResult = {
  elements: any[];
  stageSize: { width: number; height: number };
  aspectRatio: number;
  branding?: {
    colors?: Record<string, string>;
    fonts?: Record<
      string,
      {
        value: string;
        isFile?: boolean;
        variant?: string;
      }
    >;
  };
};

export const buildTemplateFromJson = (
  importedData: ImportedData
): TemplateResult => {
  if (
    !importedData ||
    !Array.isArray(importedData.elements) ||
    !importedData.width ||
    !importedData.height ||
    !importedData.scale
  ) {
    throw new Error(
      "Invalid JSON format. Required fields: elements (array), width, height, scale."
    );
  }

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

  // Process frames
  importedData.frames?.forEach((frame) => {
    const frameIndex = elements.findIndex(
      (el) =>
        Number(el.frame_position_in_template) ===
        Number(frame.frame_position_in_template)
    );

    if (frameIndex !== -1) {
      const frameElement = elements[frameIndex];

      // Update frame element
      elements[frameIndex] = {
        ...frameElement,
        type: "frame",
        zIndex: 1,
      };

      // Add image element if asset exists
      if (frame.assets?.[0]?.image_url) {
        const fitMode = mapFitMode(frame.objectFit || frame.fitMode || "fill");

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

  elements.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return {
    elements,
    stageSize: {
      width: importedData.width,
      height: importedData.height,
    },
    aspectRatio: importedData.scale,
    branding: importedData.branding,
  };
};
