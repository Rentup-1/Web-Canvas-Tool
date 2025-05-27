import { ColorInput } from "@/components/ui/controlled-inputs/ColorInput";
import { SelectInput } from "@/components/ui/controlled-inputs/SelectInput";
import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { updateElement } from "@/features/canvas/canvasSlice";
import type {
  BrandingType,
  CanvasElement,
  CanvasTextElement,
} from "@/features/canvas/types";
import { useAppDispatch } from "@/hooks/useRedux";
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
import { MdBlurOn } from "react-icons/md";

// Utility type guard for text elements
function isTextElement(element: CanvasElement): element is CanvasTextElement {
  return element.type === "text";
}
export const BRAND_OPTIONS: BrandingType[] = [
  "primary",
  "secondary",
  "additional",
  "fixed",
];
export const FONT_FAMILY_OPTIONS = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Oswald",
  "Merriweather",
  "Playfair Display",
  "Nunito",
  "Ubuntu",
  "PT Sans",
  "Inter",
  "Quicksand",
  "Source Sans Pro",
  "Cabin",
  "Rubik",
  "Fira Sans",
  "Inconsolata",
  "Manrope",
] as const;

export default function TextProperties({
  element,
}: {
  element: CanvasElement;
}) {
  const dispatch = useAppDispatch();
  const update = <T extends CanvasTextElement>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
  };
  return (
    <div className="space-y-4">
      <PositionProperties element={element} />
      <ScaleProperties element={element} />
      <RotationProperties element={element} />
      {isTextElement(element) && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <ColorInput
              label="Text Color"
              value={element.fill ?? "#000000"}
              onChange={(val) => update({ fill: val })}
            />
            <ColorInput
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
              onClick={() => update({ background: "transparent" })}>
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
              } as Partial<CanvasTextElement>)
            }
          />
          <SelectInput
            label="Font Family"
            value={element.fontFamily ?? "Arial"}
            onChange={(val) =>
              update({ fontFamily: val } as Partial<CanvasTextElement>)
            }
            options={Array.from(FONT_FAMILY_OPTIONS)}
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

          <TextInput
            label="Label"
            type="text"
            value={element.label ?? ""}
            onChange={(val) => update<CanvasTextElement>({ label: val })}
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
