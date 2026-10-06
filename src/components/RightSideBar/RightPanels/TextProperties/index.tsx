// src/components/RightSideBar/RightPanels/TextProperties/index.tsx
import { ColorInput } from "@/components/ui/controlled-inputs/ColorInput";
import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { updateElement } from "@/features/canvas/canvasSlice";
import type {
  CanvasTextElement,
} from "@/features/canvas/types";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import PositionProperties from "../CommonProperties/PositionProperties";
import ScaleProperties from "../CommonProperties/ScaleProperties";
import RotationProperties from "../CommonProperties/RotationProperties";
import { Button } from "@/components/ui/Button";
import {
  FaAlignCenter,
  FaAlignLeft,
  FaAlignRight,
  FaBold,
  FaItalic,
  FaUnderline,
} from "react-icons/fa";
import SelectInput from "@/components/ui/controlled-inputs/SelectInput";
import { MdBlurOn } from "react-icons/md";
import { useGetGoogleFontsQuery } from "@/services/googleFontsApi";
import { useCanvas } from "@/context/CanvasContext";
import { useGetTemplateVocabularyQuery } from "@/services/templateVocabularyApi";
import NumberInput from "@/components/ui/controlled-inputs/NumberInput";
import type {
  BrandColorRole,
  BrandFontRole,
  TextCopySource,
} from "@/types/templateDocumentV2";

export default function TextProperties({
  element,
}: {
  element: CanvasTextElement;
}) {
  const { projectIdMixer } = useCanvas();
  const { data: vocabData, isLoading: vocabLoading } =
    useGetTemplateVocabularyQuery(
      { projectId: projectIdMixer },
      { skip: !projectIdMixer }
    );

  const {
    data: fontsData,
    isLoading: fontsLoading,
  } = useGetGoogleFontsQuery();

  const dispatch = useAppDispatch();

  const update = (updates: Partial<CanvasTextElement>) => {
    dispatch(updateElement({ id: element.id, updates }));
  };

  // Content Source
  const currentSource: "static" | "copy" | "toi" =
    element.content?.source ||
    element.contentSource ||
    (element.toi_labels ? "toi" : "static");

  const currentCopyKey =
    element.content?.source === "copy"
      ? element.content.key
      : (element.contentKey as TextCopySource) || "headline";

  const currentToiKey =
    element.content?.source === "toi"
      ? element.content.key
      : element.toi_labels || element.contentKey || "";

  const copyKeyOptions = (
    Array.isArray(vocabData?.copy_keys)
      ? vocabData.copy_keys
      : ["headline", "punchline", "cta"]
  ).map((key) => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
  }));

  const toiOptions = (
    Array.isArray(vocabData?.toi_labels) ? vocabData.toi_labels : []
  ).map((toi) => ({
    value: toi.label,
    label: `${toi.label}${!toi.has_value ? " (No value for project)" : ""}`,
    hasValue: toi.has_value,
    example: toi.example_en || toi.example_ar || "",
  }));

  const brandColorRoleOptions = [
    { value: "none", label: "Custom Hex Color" },
    { value: "primary", label: "Brand Primary" },
    { value: "secondary", label: "Brand Secondary" },
    { value: "accent", label: "Brand Accent" },
  ];

  const brandFontRoleOptions = [
    { value: "none", label: "Custom Font Family" },
    { value: "primary", label: "Brand Primary Font" },
    { value: "secondary", label: "Brand Secondary Font" },
  ];

  const googleFontOptions = Array.isArray(fontsData)
    ? fontsData.map((f: any) => ({
        value: f.family,
        label: f.family,
      }))
    : [
        { value: "Inter", label: "Inter" },
        { value: "Montserrat", label: "Montserrat" },
        { value: "Roboto", label: "Roboto" },
      ];

  const handleSourceChange = (newSource: "static" | "copy" | "toi") => {
    if (newSource === "static") {
      update({
        contentSource: "static",
        contentKey: null,
        content: { source: "static", key: null },
        toi_labels: "",
      });
    } else if (newSource === "copy") {
      const key = (vocabData?.copy_keys?.[0] as TextCopySource) || "headline";
      update({
        contentSource: "copy",
        contentKey: key,
        content: { source: "copy", key },
        toi_labels: "",
      });
    } else if (newSource === "toi") {
      const key = vocabData?.toi_labels?.[0]?.label || "Price";
      update({
        contentSource: "toi",
        contentKey: key,
        content: { source: "toi", key },
        toi_labels: key,
      });
    }
  };

  return (
    <div className="space-y-4">
      <PositionProperties element={element} />
      <ScaleProperties element={element} />
      <RotationProperties element={element} />

      {/* Text Binding / Source Section */}
      <div className="p-3 border rounded-md space-y-3 bg-card">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Text Content & Binding
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-md text-xs">
          <button
            type="button"
            className={`py-1.5 rounded text-center transition-all ${
              currentSource === "static"
                ? "bg-background shadow font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => handleSourceChange("static")}
          >
            Static
          </button>
          <button
            type="button"
            className={`py-1.5 rounded text-center transition-all ${
              currentSource === "copy"
                ? "bg-background shadow font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => handleSourceChange("copy")}
          >
            Ad Copy
          </button>
          <button
            type="button"
            className={`py-1.5 rounded text-center transition-all ${
              currentSource === "toi"
                ? "bg-background shadow font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => handleSourceChange("toi")}
          >
            Fact (TOI)
          </button>
        </div>

        {currentSource === "copy" && (
          <SelectInput
            isSearchable
            label="Ad Copy Slot"
            value={currentCopyKey}
            options={copyKeyOptions}
            onChange={(val) => {
              if (typeof val === "string") {
                const copyKey = val as TextCopySource;
                update({
                  contentSource: "copy",
                  contentKey: copyKey,
                  content: { source: "copy", key: copyKey },
                });
              }
            }}
          />
        )}

        {currentSource === "toi" && (
          <SelectInput
            isLoading={vocabLoading}
            isSearchable
            label="Project Fact (TOI Label)"
            value={String(currentToiKey)}
            options={toiOptions}
            onChange={(val) => {
              if (typeof val === "string") {
                update({
                  contentSource: "toi",
                  contentKey: val,
                  content: { source: "toi", key: val },
                  toi_labels: val,
                });
              }
            }}
            placeholder="Select TOI Label..."
          />
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">
            {currentSource === "static" ? "Text Content" : "Fallback / Sample Preview Text"}
          </label>
          <TextInput
            value={element.text ?? ""}
            onChange={(val) => update({ text: val })}
            placeholder="Type text here..."
          />
        </div>
      </div>

      {/* Typography & Font Section */}
      <div className="p-3 border rounded-md space-y-3 bg-card">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Typography & Styling
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SelectInput
            className="col-span-full"
            label="Brand Font Role"
            value={element.fontRole || "none"}
            options={brandFontRoleOptions}
            onChange={(val) => {
              const role = val === "none" ? null : (val as BrandFontRole);
              update({
                fontRole: role,
                fontBrandingType: role ? "dynamic" : "fixed",
              });
            }}
          />

          {!element.fontRole && (
            <SelectInput
              isLoading={fontsLoading}
              isSearchable
              className="col-span-full"
              label="Font Family"
              value={element.fontFamily || "Inter"}
              options={googleFontOptions}
              onChange={(val) => {
                if (typeof val === "string") {
                  update({ fontFamily: val });
                }
              }}
            />
          )}

          <NumberInput
            label="Font Size"
            value={element.fontSize ?? 32}
            onChange={(val) => update({ fontSize: Number(val) || 12 })}
            min={8}
            max={200}
          />

          <NumberInput
            label="Line Height"
            value={element.lineHeight ?? 1.2}
            onChange={(val) => update({ lineHeight: Number(val) || 1.2 })}
            min={0.5}
            max={4}
          />

          <NumberInput
            label="Letter Spacing"
            value={element.letterSpacing ?? 0}
            onChange={(val) => update({ letterSpacing: Number(val) || 0 })}
            min={-10}
            max={50}
          />

          <SelectInput
            label="Direction"
            value={element.direction || "auto"}
            options={[
              { value: "auto", label: "Auto" },
              { value: "ltr", label: "LTR (English)" },
              { value: "rtl", label: "RTL (Arabic)" },
            ]}
            onChange={(val) => {
              if (typeof val === "string") {
                update({ direction: val as "auto" | "ltr" | "rtl" });
              }
            }}
          />

          <SelectInput
            label="Wrap Mode"
            value={element.wrap || (element.white_space === "nowrap" ? "none" : "word")}
            options={[
              { value: "word", label: "Word Wrap" },
              { value: "none", label: "Single Line (None)" },
            ]}
            onChange={(val) => {
              if (typeof val === "string") {
                update({
                  wrap: val as "word" | "none",
                  white_space: val === "none" ? "nowrap" : "normal",
                });
              }
            }}
          />

          <SelectInput
            label="Auto-Fit (Shrink)"
            value={element.fitTextMode || "none"}
            options={[
              { value: "none", label: "None" },
              { value: "shrink", label: "Shrink to Fit" },
            ]}
            onChange={(val) => {
              if (typeof val === "string") {
                update({
                  fitTextMode: val as "none" | "shrink",
                  fitText: {
                    mode: val as "none" | "shrink",
                    minSize: element.fitTextMinSize ?? 12,
                  },
                });
              }
            }}
          />
        </div>

        {/* Alignment and Style Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={element.align === "left" || !element.align ? "default" : "outline"}
              onClick={() => update({ align: "left" })}
            >
              <FaAlignLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant={element.align === "center" ? "default" : "outline"}
              onClick={() => update({ align: "center" })}
            >
              <FaAlignCenter className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant={element.align === "right" ? "default" : "outline"}
              onClick={() => update({ align: "right" })}
            >
              <FaAlignRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={
                element.fontWeight === "bold" || element.fontWeight === "700"
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                update({
                  fontWeight:
                    element.fontWeight === "bold" || element.fontWeight === "700"
                      ? "normal"
                      : "bold",
                })
              }
            >
              <FaBold className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant={element.fontStyle === "italic" ? "default" : "outline"}
              onClick={() =>
                update({
                  fontStyle: element.fontStyle === "italic" ? "normal" : "italic",
                })
              }
            >
              <FaItalic className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant={element.textDecoration === "underline" ? "default" : "outline"}
              onClick={() =>
                update({
                  textDecoration: element.textDecoration === "underline" ? "none" : "underline",
                })
              }
            >
              <FaUnderline className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Colors & Background */}
      <div className="p-3 border rounded-md space-y-3 bg-card">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Colors & Background
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SelectInput
            className="col-span-full"
            label="Text Color Brand Role"
            value={element.fillRole || "none"}
            options={brandColorRoleOptions}
            onChange={(val) => {
              const role = val === "none" ? null : (val as BrandColorRole);
              update({
                fillRole: role,
                fillBrandingType: role ? "dynamic" : "fixed",
              });
            }}
          />

          {!element.fillRole && (
            <ColorInput
              className="col-span-full"
              label="Text Color"
              value={element.fill ?? "#000000"}
              onChange={(val) => update({ fill: val })}
            />
          )}

          <div className="col-span-full flex items-center justify-between">
            <ColorInput
              label="Background Color"
              value={element.background || "#ffffff"}
              onChange={(val) => update({ background: val })}
            />
            <div>
              <div className="text-xs font-medium mb-1">Transparent</div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => update({ background: "transparent" })}
              >
                <MdBlurOn className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <NumberInput
            label="Padding"
            value={element.padding ?? 0}
            onChange={(val) => update({ padding: Number(val) || 0 })}
            min={0}
            max={100}
          />

          <NumberInput
            label="Corner Radius"
            value={
              typeof element.cornerRadius === "number"
                ? element.cornerRadius
                : element.borderRadiusSpecial ?? 0
            }
            onChange={(val) =>
              update({
                cornerRadius: Number(val) || 0,
                borderRadiusSpecial: Number(val) || 0,
              })
            }
            min={0}
            max={100}
          />
        </div>
      </div>
    </div>
  );
}
