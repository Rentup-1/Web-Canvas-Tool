import { ColorInput } from "@/components/ui/controlled-inputs/ColorInput";
import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { updateElement } from "@/features/canvas/canvasSlice";
import type {
  BrandingType,
  CanvasElement,
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
} from "react-icons/fa";
import SelectInput from "@/components/ui/controlled-inputs/SelectInput";
import { MdBlurOn } from "react-icons/md";
import { toPercentFontSize } from "@/hooks/usePercentConverter";
import { useGetGoogleFontsQuery } from "@/services/googleFontsApi";
import {
  useGetTextLabelQuery,
  usePostTextLabelMutation,
} from "@/services/textLabelsApi";
// Utility type guard for text elements
const loadGoogleFont = (fontFamily: string) => {
  // Check if font is already loaded
  if (
    document.querySelector(`link[href*="${fontFamily.replace(/\s+/g, "+")}"]`)
  ) {
    return;
  }

  // Create link element to load the font
  const link = document.createElement("link");
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
    /\s+/g,
    "+"
  )}:wght@400;700&display=swap`;
  link.rel = "stylesheet";
  document.head.appendChild(link);
};
function isTextElement(element: CanvasElement): element is CanvasTextElement {
  return element.type === "text";
}
export const BRAND_OPTIONS: BrandingType[] = [
  "primary",
  "secondary",
  "additional",
  "fixed",
];
export default function TextProperties({
  element,
}: {
  element: CanvasTextElement;
}) {
  const {
    data: fontsData,
    isLoading: fontsLoading,
    error: fontsError,
  } = useGetGoogleFontsQuery();
  const {
    data: labelsData,
    isLoading: labelsLoading,
    error: errorLabels,
  } = useGetTextLabelQuery();
  const [
    postTextLabel,
    { isLoading: postTextLabelLoading, error: postTextLabelError },
  ] = usePostTextLabelMutation();
  // Normalize labelsData.results to options format
  const labelOptions = labelsData?.results
    ? labelsData.results.map((item) => ({
        id: String(item.id),
        label: item.label,
      }))
    : [];
  // Handle tag creation and selection
  const handleLabelsChange = async (val: string | string[]) => {
    const values = Array.isArray(val) ? val : val ? [val] : [];
    const currentTags = labelOptions.map((opt) => opt.label);
    // Identify new label (not in tagOptions)
    const newLabels = values.filter(
      (tag) => tag && !currentTags.includes(tag) && tag.trim().length > 0
    );
    console.log("New tags:", newLabels);

    // Post new tags to the API
    for (const newLabel of newLabels) {
      console.log("Attempting to create label:", newLabel);
      try {
        await postTextLabel({ label: newLabel }).unwrap();
      } catch (err) {
        console.error("Failed to create label:", newLabel, err);
      }
    }

    // Update element.tags with the final values
    update({ label: values });
  };
  const stageWidth = useAppSelector((s) => s.canvas.stageWidth);
  const stageHeight = useAppSelector((s) => s.canvas.stageHeight);
  const dispatch = useAppDispatch();
  const update = <T extends CanvasTextElement>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
  };
  console.log(postTextLabelError);
  return (
    <div className="space-y-4">
      <PositionProperties element={element} />
      <ScaleProperties element={element} />
      <RotationProperties element={element} />
      {isTextElement(element) && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <ColorInput
              className="col-span-full"
              showOpacity
              label="Text Color"
              value={element.fill ?? "#000000"}
              onChange={(val) => update({ fill: val })}
            />
            <ColorInput
              className="col-span-full"
              showOpacity
              label="Background"
              value={element.background ?? "#000000"}
              onChange={(val) => update({ background: val })}
            />
          </div>

          <div className="text-sm font-medium mb-1">
            <div>Transparent</div>
            <Button
              size="sm"
              variant={"outline"}
              className="mr-2 text-gray-500 font-bold"
              onClick={() => update({ background: "transparent" })}
            >
              <MdBlurOn />
            </Button>
          </div>

          <Button
            size="sm"
            variant={"outline"}
            className="mr-2 text-gray-500 font-bold"
            onClick={() => update({ align: "left" })}
          >
            <FaAlignLeft />
          </Button>
          <Button
            size="sm"
            variant={"outline"}
            className="mr-2 text-gray-500 font-bold"
            onClick={() => update({ align: "center" })}
          >
            <FaAlignCenter />
          </Button>
          <Button
            size="sm"
            variant={"outline"}
            className="mr-2 text-gray-500 font-bold"
            onClick={() => update({ align: "right" })}
          >
            <FaAlignRight />
          </Button>

          <Button
            size="sm"
            variant={"outline"}
            className="mr-2 text-gray-400 font-bold"
            onClick={() =>
              update({
                fontWeight: element.fontWeight === "bold" ? "normal" : "bold",
              })
            }
          >
            <FaBold />
          </Button>

          <Button
            size="sm"
            variant={"outline"}
            className="mr-2 text-gray-400 font-bold"
            onClick={() =>
              update({
                fontStyle: element.fontStyle === "italic" ? "normal" : "italic",
              })
            }
          >
            <FaItalic />
          </Button>

          {/* <TextInput
            label="Stroke width"
            type="number"
            value={(element.backgroundStrokeWidth ?? 10).toString()}
            onChange={(val) =>
              update<CanvasTextElement>({
                backgroundStrokeWidth: Number.parseFloat(val),
              })
            }
          />

          <ColorInput
            label="Stroke Color"
            value={element.backgroundStroke ?? "#000000"} // backgroundStroke rect
            onChange={(val) => update({ backgroundStroke: val })}
          /> */}

          <TextInput
            label="Font Size"
            type="number"
            value={(
              parseInt(element.fontSize!.toString() || "") ?? 24
            ).toString()}
            onChange={(val) =>
              update({
                fontSize: Number.parseInt(val),
                fontSize_percent: toPercentFontSize(
                  Number(Number.parseInt(val)),
                  stageWidth,
                  stageHeight
                ),
              } as Partial<CanvasTextElement>)
            }
          />
          <SelectInput
            isClearable={false}
            isLoading={fontsLoading}
            error={fontsError ? "Sonthing wrong happend" : null}
            label="Font Family"
            value={element.fontFamily ?? "Arial"}
            onChange={(val) => {
              // Load the Google Font dynamically
              if (typeof val === "string") {
                loadGoogleFont(val);
              }

              // Update the element with the new font family
              update({ fontFamily: val } as Partial<CanvasTextElement>);
            }}
            options={
              fontsData?.items.map((font) => ({
                label: font.family,
                value: font.family,
              })) ?? []
            }
          />

          <TextInput
            label="Padding"
            type="number"
            value={(element.padding ?? 10).toString()}
            onChange={(val) =>
              update<CanvasTextElement>({ padding: Number.parseFloat(val) })
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Top Left Radius"
              type="number"
              value={(element.borderRadius?.topLeft ?? 0).toString()}
              onChange={(val) =>
                update<CanvasTextElement>({
                  borderRadius: {
                    ...element.borderRadius,
                    topLeft: Number.parseFloat(val),
                  },
                })
              }
            />
            <TextInput
              label="Top Right Radius"
              type="number"
              value={(element.borderRadius?.topRight ?? 0).toString()}
              onChange={(val) =>
                update<CanvasTextElement>({
                  borderRadius: {
                    ...element.borderRadius,
                    topRight: Number.parseFloat(val),
                  },
                })
              }
            />
            <TextInput
              label="Bottom Right Radius"
              type="number"
              value={(element.borderRadius?.bottomRight ?? 0).toString()}
              onChange={(val) =>
                update<CanvasTextElement>({
                  borderRadius: {
                    ...element.borderRadius,
                    bottomRight: Number.parseFloat(val),
                  },
                })
              }
            />
            <TextInput
              label="Bottom Left Radius"
              type="number"
              value={(element.borderRadius?.bottomLeft ?? 0).toString()}
              onChange={(val) =>
                update<CanvasTextElement>({
                  borderRadius: {
                    ...element.borderRadius,
                    bottomLeft: Number.parseFloat(val),
                  },
                })
              }
            />
          </div>

          <SelectInput
            creatable
            isMulti
            isSearchable
            className="col-span-full"
            label="Label"
            value={element.label ?? []}
            options={labelOptions}
            valueKey="label"
            labelKey="label"
            isLoading={labelsLoading || postTextLabelLoading}
            onChange={handleLabelsChange}
            error={
              errorLabels || postTextLabelError ? "somthing error happen" : null
            }
            placeholder="Create or select labels..."
          />
          <SelectInput
            label="Branding Color"
            value={element.colorBrandingType ?? "fixed"}
            onChange={(val) =>
              update<CanvasTextElement>({
                colorBrandingType: val as BrandingType,
              })
            }
            options={BRAND_OPTIONS}
          />
          <SelectInput
            label="Branding Background"
            value={element.backgroundBrandingType ?? "fixed"}
            onChange={(val) =>
              update<CanvasTextElement>({
                backgroundBrandingType: val as BrandingType,
              })
            }
            options={BRAND_OPTIONS}
          />
          <SelectInput
            label="Branding Font"
            value={element.fontBrandingType ?? "fixed"}
            onChange={(val) =>
              update<CanvasTextElement>({
                fontBrandingType: val as BrandingType,
              })
            }
            options={BRAND_OPTIONS}
          />
        </>
      )}
    </div>
  );
}
