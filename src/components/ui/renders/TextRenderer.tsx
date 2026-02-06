// d:\web-canvas-tool\src\components\ui\renderers\TextRenderer.tsx

import { updateElement } from "@/features/canvas/canvasSlice";
import { CanvasTextElement } from "@/features/canvas/types";
import { useBrandingResolver } from "@/hooks/useBrandingResolver";
import {
  toPercentFontSize,
  usePercentConverter,
} from "@/hooks/usePercentConverter";
import { useAppDispatch } from "@/hooks/useRedux";
import Konva from "konva";
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Group, Rect, Text, Transformer } from "react-konva";
import { Html } from "react-konva-utils";
import { useSelector } from "react-redux";
import { ElementRendererProps } from "./types";
import { calculateGuidelines, loadGoogleFont } from "./utils";

export const TextRenderer = forwardRef<Konva.Text, ElementRendererProps>(
  (
    {
      element,
      onSelect,
      stageWidth,
      stageHeight,
      setGuides,
      stageRef,
      draggable,
    },
    ref,
  ) => {
    const textElement = element as CanvasTextElement;
    const dispatch = useAppDispatch();
    const { toPercent } = usePercentConverter();
    const { resolveFont, resolveColor } = useBrandingResolver();

    const elements = useSelector((state: any) => state.canvas.elements);
    const brandingFamilies = useSelector(
      (state: any) => state.branding.fontFamilies,
    );

    const refText = useRef<Konva.Text>(null);
    const refGroup = useRef<Konva.Group>(null);
    const trRef = useRef<Konva.Transformer>(null);

    const [bgSize, setBgSize] = useState({ width: 0, height: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [editableText, setEditableText] = useState(textElement.text);

    const exists = useSelector((state: any) =>
      state.canvas.elements.some((el: any) => el.id === textElement.id),
    );

    const isSelected = useSelector(
      (state: any) =>
        state.canvas.elements.find((el: any) => el.id === textElement.id)
          ?.selected,
    );
    const textAlign = useSelector(
      (state: any) =>
        state.canvas.elements.find((el: any) => el.id === textElement.id)
          ?.align || "left",
    );
    const fontWeight = useSelector(
      (state: any) =>
        state.canvas.elements.find((el: any) => el.id === textElement.id)
          ?.fontWeight || "normal",
    );
    const fontStyle = useSelector(
      (state: any) =>
        state.canvas.elements.find((el: any) => el.id === textElement.id)
          ?.fontStyle || "normal",
    );

    const brandingType = ["fixed", "dynamic"].includes(
      textElement.fontBrandingType || "",
    )
      ? textElement.fontBrandingType
      : undefined;

    const resolvedFont = resolveFont(
      textElement.fontFamily || "",
      brandingType,
    );

    const isBrandingType = (value: any) =>
      value === "fixed" || value === "dynamic";
    const getBrandedFillText = (element: CanvasTextElement) => {
      const bType = isBrandingType(element.fillBrandingType)
        ? element.fillBrandingType
        : undefined;
      return resolveColor(element.background ?? "#fff", bType);
    };

    useEffect(() => {
      const fontData = brandingFamilies[textElement.fontBrandingType || ""] || {
        isFile: false,
      };
      if (!fontData.isFile && resolvedFont.value) {
        loadGoogleFont(resolvedFont.value);
      }
    }, [resolvedFont.value, textElement.fontBrandingType, brandingFamilies]);

    const borderRadius = textElement.borderRadius || {};
    const textCornerRadius = [
      borderRadius.topLeft || 0,
      borderRadius.topRight || 0,
      borderRadius.bottomRight || 0,
      borderRadius.bottomLeft || 0,
    ];

    useEffect(() => {
      setEditableText(textElement.text);
    }, [textElement.id, textElement.text]);

    useLayoutEffect(() => {
      const node = refText.current;
      if (!node) return;

      const fontStyleFinal =
        fontWeight === "bold"
          ? fontStyle === "italic"
            ? "bold italic"
            : "bold"
          : fontStyle;

      node.fontStyle(fontStyleFinal);
      node.width(textElement.width || 100);
      node._setTextData();

      const box = node.getClientRect({ skipTransform: true });

      setBgSize((prev) => {
        if (
          Math.abs(prev.width - box.width) > 0.5 ||
          Math.abs(prev.height - box.height) > 0.5
        ) {
          return { width: box.width, height: box.height };
        }
        return prev;
      });

      if (
        exists &&
        (Math.abs((textElement.width || 0) - box.width) > 0.5 ||
          Math.abs((textElement.height || 0) - box.height) > 0.5)
      ) {
        dispatch(
          updateElement({
            id: String(textElement.id),
            updates: {
              width: box.width,
              height: box.height,
            },
          }),
        );
      }

      node.getLayer()?.batchDraw();
    }, [
      exists,
      dispatch,
      fontStyle,
      fontWeight,
      textAlign,
      textElement.fontBrandingType,
      textElement.fontFamily,
      textElement.fontSize,
      textElement.padding,
      textElement.text,
      textElement.width,
      textElement.height,
    ]);

    useEffect(() => {
      if (isSelected && refGroup.current && trRef.current && !isEditing) {
        trRef.current.nodes([refGroup.current]);
        trRef.current.getLayer()?.batchDraw();
      } else if (trRef.current) {
        trRef.current.nodes([]);
        trRef.current.getLayer()?.batchDraw();
      }

      return () => {
        if (trRef.current) {
          trRef.current.nodes([]);
          trRef.current.getLayer()?.batchDraw();
        }
        setGuides([]);
      };
    }, [isSelected, isEditing, setGuides]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditableText(e.target.value);
      if (refText.current) {
        refText.current.text(e.target.value);
        refText.current.width(textElement.width || 100);
        refText.current._setTextData();
        const box = refText.current.getClientRect({ skipTransform: true });
        setBgSize({ width: box.width, height: box.height });
      }
    };

    return (
      <>
        {(element.visible ?? true) && (
          <Group
            ref={refGroup}
            id={textElement.id?.toString()}
            x={textElement.x}
            y={textElement.y}
            rotation={textElement.rotation}
            draggable={draggable}
            onClick={(e) => onSelect?.(e, textElement.id as string)}
            onDblClick={() => setIsEditing(true)}
            onDragMove={(e) => {
              const node = e.target as Konva.Group;
              const guides = calculateGuidelines(
                node,
                elements,
                stageWidth,
                stageHeight,
                stageRef,
              );
              setGuides(guides);
            }}
            onDragEnd={(e) => {
              const node = e.target as Konva.Group;
              dispatch(
                updateElement({
                  id: textElement.id,
                  updates: {
                    x: node.x(),
                    y: node.y(),
                    rotation: node.rotation(),
                    width_percent: toPercent(bgSize.width, stageWidth),
                    height_percent: toPercent(bgSize.height, stageHeight),
                    x_percent: toPercent(node.x(), stageWidth),
                    y_percent: toPercent(node.y(), stageHeight),
                    fontSize_percent: toPercentFontSize(
                      Number(textElement.fontSize),
                      stageWidth,
                      stageHeight,
                    ),
                  },
                }),
              );
              setGuides([]);
            }}
            onTransformEnd={() => {
              const group = refGroup.current;
              const text = refText.current;
              if (!group || !text) return;

              const newWidth = Math.max(30, text.width() * group.scaleX());
              text.width(newWidth);

              group.scaleX(1);
              group.scaleY(1);

              text._setTextData();
              const box = text.getClientRect({ skipTransform: true });
              setBgSize({ width: newWidth, height: box.height });

              if (!exists) return;
              dispatch(
                updateElement({
                  id: textElement.id,
                  updates: {
                    x: group.x(),
                    y: group.y(),
                    rotation: group.rotation(),
                    width: newWidth,
                    height: box.height,
                    align: textAlign,
                    width_percent: toPercent(newWidth, stageWidth),
                    height_percent: toPercent(box.height, stageHeight),
                    x_percent: toPercent(group.x(), stageWidth),
                    y_percent: toPercent(group.y(), stageHeight),
                    fontSize_percent: toPercentFontSize(
                      Number(textElement.fontSize),
                      stageWidth,
                      stageHeight,
                    ),
                  },
                }),
              );
            }}
          >
            {textElement.background && (
              <Rect
                x={-(textElement.padding || 0)}
                y={-(textElement.padding || 0)}
                width={bgSize.width + (textElement.padding || 0) * 2}
                height={bgSize.height + (textElement.padding || 0) * 2}
                fill={getBrandedFillText(textElement)}
                opacity={textElement.opacity}
                cornerRadius={textCornerRadius}
              />
            )}
            <Text
              ref={refText}
              id={textElement.id?.toString()}
              x={0}
              y={0}
              text={editableText}
              fill={textElement.fill || "#000"}
              stroke={textElement.stroke}
              padding={textElement.padding}
              fontSize={textElement.fontSize}
              fontFamily={resolvedFont.value}
              fontStyle={resolvedFont.variant || "normal"}
              opacity={textElement.opacity}
              verticalAlign="middle"
              align={textAlign}
              width={textElement.width || 100}
              wrap="word"
            />
          </Group>
        )}

        {isSelected && !isEditing && (
          <Transformer
            ref={trRef}
            rotateEnabled={false}
            enabledAnchors={["middle-left", "middle-right"]}
            boundBoxFunc={(oldBox, newBox) =>
              newBox.width < 30 ? oldBox : newBox
            }
            onClick={(e) => (e.cancelBubble = true)}
          />
        )}

        {isEditing && (
          <Html>
            <textarea
              style={{
                position: "absolute",
                top: textElement.y,
                left: textElement.x,
                width: textElement.width || 100,
                height: bgSize.height,
                fontSize: textElement.fontSize,
                fontFamily: resolvedFont.value || "Arial",
                fontWeight: /bold|700|800|900/.test(resolvedFont.variant || "")
                  ? "bold"
                  : "normal",
                fontStyle: /italic/.test(resolvedFont.variant || "")
                  ? "italic"
                  : "normal",
                padding: textElement.padding || 0,
                color: "black",
                background: "white",
                border: "1px dashed #ccc",
                resize: "none",
                outline: "none",
                overflow: "hidden",
                lineHeight: "1",
                textAlign: textAlign,
              }}
              value={editableText}
              onChange={handleTextChange}
              onBlur={() => {
                setIsEditing(false);
                if (!exists) return;
                dispatch(
                  updateElement({
                    id: String(textElement.id),
                    updates: {
                      text: editableText,
                      width: bgSize.width,
                      height: bgSize.height,
                      align: textAlign,
                    },
                  }),
                );
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  setIsEditing(false);
                  if (!exists) return;
                  dispatch(
                    updateElement({
                      id: String(textElement.id),
                      updates: {
                        text: editableText,
                        width: bgSize.width,
                        height: bgSize.height,
                        align: textAlign,
                      },
                    }),
                  );
                }
              }}
              autoFocus
            />
          </Html>
        )}
      </>
    );
  },
);
