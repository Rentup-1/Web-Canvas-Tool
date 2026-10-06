// src/utils/v2DocumentConverter.ts
import type {
  CanvasElement,
  CanvasFrameElement,
  CanvasTextElement,
} from "@/features/canvas/types";
import type {
  BrandColorRole,
  BrandFontRole,
  FrameAssetType,
  FrameElementV2,
  ImageElementV2,
  ShapeElementV2,
  ShapeKind,
  TemplateDocumentV2,
  TemplateElementV2,
  TextContent,
  TextCopySource,
  TextElementV2,
} from "@/types/templateDocumentV2";

/**
 * Checks if a given object is already a valid Schema V2 Template Document.
 */
export const isV2Document = (data: unknown): data is TemplateDocumentV2 => {
  if (!data || typeof data !== "object") return false;
  const doc = data as Record<string, unknown>;
  return doc.schemaVersion === 2 && Array.isArray(doc.elements) && !!doc.stage;
};

/**
 * Converts Redux Canvas state elements into a strictly valid Schema V2 TemplateDocument.
 */
export const canvasToV2Document = (
  elements: CanvasElement[],
  stageWidth: number,
  stageHeight: number,
  _branding?: unknown
): TemplateDocumentV2 => {
  // Sort elements strictly by layer order (zIndex if present, or existing array sequence)
  const sorted = [...elements].sort(
    (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)
  );

  let frameSlotCounter = 1;
  const usedSlotIndices = new Set<number>();

  // Pre-collect existing slot indices to prevent duplicates
  sorted.forEach((el) => {
    if (el.type === "frame") {
      const idx = Number(el.slotIndex || el.frame_position_in_template);
      if (Number.isFinite(idx) && idx > 0) {
        usedSlotIndices.add(idx);
      }
    }
  });

  const getNextFreeSlotIndex = (): number => {
    while (usedSlotIndices.has(frameSlotCounter)) {
      frameSlotCounter++;
    }
    usedSlotIndices.add(frameSlotCounter);
    return frameSlotCounter;
  };

  const v2Elements: TemplateElementV2[] = [];

  for (const el of sorted) {
    const common = {
      id: el.id,
      name: el.name || undefined,
      x: Math.round(el.x ?? 0),
      y: Math.round(el.y ?? 0),
      width: Math.round(el.width ?? 100),
      height: Math.round(el.height ?? 100),
      rotation: Math.round(el.rotation ?? 0),
      opacity: typeof el.opacity === "number" ? el.opacity : 1,
      visible: el.visible !== false,
      locked: el.locked === true,
    };

    if (el.type === "frame") {
      const frameEl = el as CanvasFrameElement;
      let slotIdx = Number(
        frameEl.slotIndex || frameEl.frame_position_in_template
      );
      if (!Number.isFinite(slotIdx) || slotIdx <= 0) {
        slotIdx = getNextFreeSlotIndex();
      }

      const rawAssetType = String(frameEl.assetType || "image").toLowerCase();
      const assetType: FrameAssetType = [
        "image",
        "project_logo",
        "developer_logo",
        "other_logo",
      ].includes(rawAssetType)
        ? (rawAssetType as FrameAssetType)
        : "image";

      const rawFit = String(
        frameEl.fitMode || frameEl.objectFit || "cover"
      ).toLowerCase();
      const fit =
        rawFit === "fit" || rawFit === "contain"
          ? "contain"
          : rawFit === "stretch"
          ? "stretch"
          : "cover";

      const v2Frame: FrameElementV2 = {
        ...common,
        type: "frame",
        slot: {
          index: slotIdx,
          assetType,
          tags: Array.isArray(frameEl.tags) ? frameEl.tags : [],
        },
        fit,
        cornerRadius:
          typeof frameEl.cornerRadius === "number"
            ? frameEl.cornerRadius
            : frameEl.borderRadiusSpecial || 0,
        stroke: frameEl.stroke || null,
        strokeWidth: frameEl.strokeWidth || 0,
        dash: frameEl.dash || undefined,
      };
      v2Elements.push(v2Frame);
    } else if (el.type === "text") {
      const textEl = el as CanvasTextElement;

      // Determine text content binding
      let content: TextContent = { source: "static", key: null };
      if (textEl.content) {
        content = textEl.content;
      } else if (textEl.contentSource === "copy" && textEl.contentKey) {
        content = {
          source: "copy",
          key: textEl.contentKey as TextCopySource,
        };
      } else if (
        textEl.contentSource === "toi" &&
        (textEl.contentKey || textEl.toi_labels)
      ) {
        content = {
          source: "toi",
          key: String(textEl.contentKey || textEl.toi_labels),
        };
      } else if (textEl.toi_labels) {
        content = {
          source: "toi",
          key: String(textEl.toi_labels),
        };
      }

      const fontRole: BrandFontRole =
        textEl.fontRole ||
        (textEl.fontBrandingType === "dynamic" ? "primary" : null);

      const fillRole: BrandColorRole =
        textEl.fillRole ||
        (textEl.fillBrandingType === "dynamic" ? "primary" : null);

      const v2Text: TextElementV2 = {
        ...common,
        type: "text",
        content,
        text: textEl.text ?? "",
        font: {
          family: textEl.fontFamily || "Inter",
          role: fontRole,
          size: textEl.fontSize || 32,
          weight: textEl.fontWeight || 400,
          style: textEl.fontStyle === "italic" ? "italic" : "normal",
        },
        fill: {
          color: textEl.fill || "#000000",
          role: fillRole,
        },
        align: textEl.align || "left",
        verticalAlign: textEl.verticalAlign || "top",
        lineHeight: textEl.lineHeight || 1.2,
        letterSpacing: textEl.letterSpacing || 0,
        direction: textEl.direction || "auto",
        wrap: textEl.wrap || (textEl.white_space === "nowrap" ? "none" : "word"),
        fitText: textEl.fitText || {
          mode: textEl.fitTextMode || "none",
          minSize: textEl.fitTextMinSize ?? null,
        },
        background: textEl.background || null,
        padding: textEl.padding || 0,
        cornerRadius:
          typeof textEl.cornerRadius === "number"
            ? textEl.cornerRadius
            : textEl.borderRadiusSpecial || 0,
        borderWidth: textEl.backgroundStrokeWidth || 0,
        borderColor: textEl.backgroundStroke || null,
      };
      v2Elements.push(v2Text);
    } else if (el.type === "image") {
      const v2Img: ImageElementV2 = {
        ...common,
        type: "image",
        assetId: el.assetId || undefined,
        src: el.src || undefined,
        fit: el.fitMode === "fit" ? "contain" : "cover",
        cornerRadius:
          typeof el.cornerRadius === "number"
            ? el.cornerRadius
            : el.borderRadiusSpecial || 0,
        stroke: el.stroke || null,
        strokeWidth: el.strokeWidth || 0,
      };
      v2Elements.push(v2Img);
    } else {
      // Shapes: rectangle, circle, ellipse, polygon, star, ring, line, etc.
      let shapeKind: ShapeKind = "rect";
      if (el.type === "circle" || el.type === "ellipse") {
        shapeKind = "ellipse";
      } else if (el.type === "star") {
        shapeKind = "star";
      } else if (el.type === "ring") {
        shapeKind = "ring";
      } else if (el.type === "regularPolygon" || el.type === "triangle") {
        shapeKind = "polygon";
      } else if (el.shapeKind) {
        shapeKind = el.shapeKind;
      }

      const fillRole: BrandColorRole =
        el.fillRole ||
        (el.fillBrandingType === "dynamic" ? "primary" : null);

      const v2Shape: ShapeElementV2 = {
        ...common,
        type: "shape",
        shape: shapeKind,
        fill: {
          color: el.fill || "#000000",
          role: fillRole,
        },
        stroke: el.stroke || null,
        strokeWidth: el.strokeWidth || 0,
        dash: el.dash || undefined,
      };

      if (shapeKind === "rect") {
        v2Shape.cornerRadius =
          el.cornerRadius ??
          (el.borderRadius
            ? [
                el.borderRadius.topLeft || 0,
                el.borderRadius.topRight || 0,
                el.borderRadius.bottomRight || 0,
                el.borderRadius.bottomLeft || 0,
              ]
            : el.borderRadiusSpecial || 0);
      } else if (shapeKind === "polygon") {
        v2Shape.sides = el.sides || (el.type === "triangle" ? 3 : 5);
      } else if (shapeKind === "star") {
        v2Shape.points = el.numPoints || 5;
        v2Shape.innerRatio =
          el.innerRatio ||
          (el.innerRadius && el.outerRadius
            ? el.innerRadius / el.outerRadius
            : 0.5);
      } else if (shapeKind === "ring") {
        v2Shape.innerRatio = el.innerRatio || 0.5;
      }

      v2Elements.push(v2Shape);
    }
  }

  return {
    schemaVersion: 2,
    stage: {
      width: stageWidth,
      height: stageHeight,
    },
    elements: v2Elements,
  };
};

/**
 * Converts a Schema V2 TemplateDocument into CanvasElement items for Redux state.
 */
export const v2DocumentToCanvas = (doc: TemplateDocumentV2): CanvasElement[] => {
  if (!doc || !Array.isArray(doc.elements)) return [];

  return doc.elements.map((el, index) => {
    const base: CanvasElement = {
      id: el.id || `el-${index + 1}`,
      name: el.name || "",
      type: el.type,
      x: el.x || 0,
      y: el.y || 0,
      width: el.width || 100,
      height: el.height || 100,
      rotation: el.rotation || 0,
      opacity: el.opacity ?? 1,
      visible: el.visible !== false,
      locked: el.locked === true,
      zIndex: index, // Array order mapped to layer sequence
      fill: "#000000",
    };

    if (el.type === "frame") {
      const frameEl = el as FrameElementV2;
      return {
        ...base,
        type: "frame",
        slotIndex: frameEl.slot?.index ?? index + 1,
        frame_position_in_template: String(frameEl.slot?.index ?? index + 1),
        assetType: frameEl.slot?.assetType || "image",
        tags: frameEl.slot?.tags || [],
        fitMode: frameEl.fit || "cover",
        objectFit: frameEl.fit === "contain" ? "contain" : "cover",
        cornerRadius: frameEl.cornerRadius || 0,
        stroke: frameEl.stroke || undefined,
        strokeWidth: frameEl.strokeWidth || 0,
        dash: frameEl.dash,
        fill: "transparent",
      };
    }

    if (el.type === "text") {
      const textEl = el as TextElementV2;
      const content = textEl.content || { source: "static", key: null };
      return {
        ...base,
        type: "text",
        text: textEl.text || "",
        content,
        contentSource: content.source,
        contentKey: content.key,
        toi_labels: content.source === "toi" ? content.key || "" : "",
        fontFamily: textEl.font?.family || "Inter",
        fontSize: textEl.font?.size || 32,
        fontWeight: String(textEl.font?.weight || "400"),
        fontStyle: textEl.font?.style || "normal",
        fontRole: textEl.font?.role || null,
        fontBrandingType: textEl.font?.role ? "dynamic" : "fixed",
        fill: textEl.fill?.color || "#000000",
        fillRole: textEl.fill?.role || null,
        fillBrandingType: textEl.fill?.role ? "dynamic" : "fixed",
        align: textEl.align || "left",
        verticalAlign: textEl.verticalAlign || "top",
        lineHeight: textEl.lineHeight || 1.2,
        letterSpacing: textEl.letterSpacing || 0,
        direction: textEl.direction || "auto",
        wrap: textEl.wrap || "word",
        white_space: textEl.wrap === "none" ? "nowrap" : "normal",
        fitText: textEl.fitText,
        fitTextMode: textEl.fitText?.mode || "none",
        fitTextMinSize: textEl.fitText?.minSize || null,
        background: textEl.background || undefined,
        padding: textEl.padding || 0,
        cornerRadius: textEl.cornerRadius || 0,
        backgroundStroke: textEl.borderColor || undefined,
        backgroundStrokeWidth: textEl.borderWidth || 0,
      };
    }

    if (el.type === "image") {
      const imgEl = el as ImageElementV2;
      return {
        ...base,
        type: "image",
        assetId: imgEl.assetId,
        src: imgEl.src,
        fitMode: imgEl.fit === "contain" ? "fit" : "fill",
        cornerRadius: imgEl.cornerRadius || 0,
        stroke: imgEl.stroke || undefined,
        strokeWidth: imgEl.strokeWidth || 0,
      };
    }

    if (el.type === "shape") {
      const shapeEl = el as ShapeElementV2;
      const typeMap: Record<ShapeKind, CanvasElement["type"]> = {
        rect: "rectangle",
        ellipse: "ellipse",
        polygon: "regularPolygon",
        star: "star",
        ring: "ring",
      };

      return {
        ...base,
        type: typeMap[shapeEl.shape] || "rectangle",
        shapeKind: shapeEl.shape,
        fill: shapeEl.fill?.color || "#000000",
        fillRole: shapeEl.fill?.role || null,
        fillBrandingType: shapeEl.fill?.role ? "dynamic" : "fixed",
        stroke: shapeEl.stroke || undefined,
        strokeWidth: shapeEl.strokeWidth || 0,
        dash: shapeEl.dash,
        cornerRadius: shapeEl.cornerRadius,
        sides: shapeEl.sides,
        numPoints: shapeEl.points,
        innerRatio: shapeEl.innerRatio,
      };
    }

    return base;
  });
};
