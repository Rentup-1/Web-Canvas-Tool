"use client";

import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { updateElement } from "../../features/canvas/canvasSlice";
import type {
  CanvasElement,
  CanvasTextElement,
  CanvasImageElement,
  RectangleShape,
  BrandingType,
} from "../../features/canvas/types";
import { TextInput } from "../ui/controlled-inputs/TextInput";
import { ColorInput } from "../ui/controlled-inputs/ColorInput";
import { SelectInput } from "../ui/controlled-inputs/SelectInput";
import { InputRange } from "../ui/controlled-inputs/InputRange";
import { CanvasSettings } from "../ui/controlled-inputs/CanvasSettings";
import { AspectRatioSelector } from "../ui/controlled-inputs/ApectRatioSelector";
import { useState, useEffect } from "react";

export const BRAND_OPTIONS: BrandingType[] = ["primary", "secondary", "additional", "fixed"];
export const FONT_FAMILY_OPTIONS = [
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Comic Sans MS",
  "Trebuchet MS",
  "Verdana",
  "Impact",
] as const;

// Add a new component for shape styling controls
function ShapeStyleControls({
  element,
  update,
}: {
  element: CanvasElement;
  update: (updates: Partial<CanvasElement>) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-4">
        <ColorInput label="Fill Color" value={element.fill ?? "#000000"} onChange={(val) => update({ fill: val })} />
        <ColorInput
          label="Stroke Color"
          value={element.stroke ?? "#000000"}
          onChange={(val) => update({ stroke: val })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextInput
          label="Stroke Width"
          type="number"
          value={(element.strokeWidth ?? 0).toString()}
          onChange={(val) => update({ strokeWidth: Number.parseFloat(val) })}
        />
        <InputRange
          label="Opacity"
          value={element.opacity ?? 1}
          onChange={(val) =>
            update({
              opacity: Math.min(1, Math.max(0, val)),
            })
          }
          className="w-full"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <SelectInput
          label="Fill Branding"
          value={element.fillBrandingType ?? "fixed"}
          onChange={(val) => update({ fillBrandingType: val as BrandingType })}
          options={BRAND_OPTIONS}
        />
        <SelectInput
          label="Stroke Branding"
          value={element.strokeBrandingType ?? "fixed"}
          onChange={(val) => update({ strokeBrandingType: val as BrandingType })}
          options={BRAND_OPTIONS}
        />
      </div>
    </>
  );
}

// Add a new component for rectangle corner radius controls
function RectangleCornerControls({
  element,
  update,
}: {
  element: RectangleShape;
  update: (updates: Partial<RectangleShape>) => void;
}) {
  const [individualCorners, setIndividualCorners] = useState(false);

  // Check if corners are already different when component mounts
  useEffect(() => {
    const br = element.borderRadius || {};
    const hasIndividualCorners =
      br.topLeft !== br.topRight || br.topLeft !== br.bottomRight || br.topLeft !== br.bottomLeft;

    if (hasIndividualCorners) {
      setIndividualCorners(true);
    }
  }, [element.id]); // Only run when element changes

  return (
    <>
      <h3 className="text-md font-medium mt-4 mb-2">Corner Radius</h3>

      <div className="flex items-center mb-2">
        <input
          type="checkbox"
          id="individualCorners"
          checked={individualCorners}
          onChange={(e) => setIndividualCorners(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="individualCorners" className="text-sm font-medium">
          Edit corners individually
        </label>
      </div>

      {!individualCorners ? (
        <TextInput
          label="All Corners"
          type="number"
          value={((element.cornerRadius as number) || 0).toString()}
          onChange={(val) => {
            const radius = Number.parseFloat(val);
            update({
              cornerRadius: radius,
              borderRadius: {
                topLeft: radius,
                topRight: radius,
                bottomRight: radius,
                bottomLeft: radius,
              },
            });
          }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 mt-2">
          <TextInput
            label="Top Left"
            type="number"
            value={(element.borderRadius?.topLeft ?? 0).toString()}
            onChange={(val) =>
              update({
                borderRadius: {
                  ...element.borderRadius,
                  topLeft: Number.parseFloat(val),
                },
                cornerRadius: [
                  Number.parseFloat(val),
                  element.borderRadius?.topRight ?? 0,
                  element.borderRadius?.bottomRight ?? 0,
                  element.borderRadius?.bottomLeft ?? 0,
                ],
              })
            }
          />
          <TextInput
            label="Top Right"
            type="number"
            value={(element.borderRadius?.topRight ?? 0).toString()}
            onChange={(val) =>
              update({
                borderRadius: {
                  ...element.borderRadius,
                  topRight: Number.parseFloat(val),
                },
                cornerRadius: [
                  element.borderRadius?.topLeft ?? 0,
                  Number.parseFloat(val),
                  element.borderRadius?.bottomRight ?? 0,
                  element.borderRadius?.bottomLeft ?? 0,
                ],
              })
            }
          />
          <TextInput
            label="Bottom Right"
            type="number"
            value={(element.borderRadius?.bottomRight ?? 0).toString()}
            onChange={(val) =>
              update({
                borderRadius: {
                  ...element.borderRadius,
                  bottomRight: Number.parseFloat(val),
                },
                cornerRadius: [
                  element.borderRadius?.topLeft ?? 0,
                  element.borderRadius?.topRight ?? 0,
                  Number.parseFloat(val),
                  element.borderRadius?.bottomLeft ?? 0,
                ],
              })
            }
          />
          <TextInput
            label="Bottom Left"
            type="number"
            value={(element.borderRadius?.bottomLeft ?? 0).toString()}
            onChange={(val) =>
              update({
                borderRadius: {
                  ...element.borderRadius,
                  bottomLeft: Number.parseFloat(val),
                },
                cornerRadius: [
                  element.borderRadius?.topLeft ?? 0,
                  element.borderRadius?.topRight ?? 0,
                  element.borderRadius?.bottomRight ?? 0,
                  Number.parseFloat(val),
                ],
              })
            }
          />
        </div>
      )}
    </>
  );
}

export function PropertiesPanel() {
  const element = useAppSelector((state) => state.canvas.elements.find((el) => el.selected)) as
    | CanvasElement
    | undefined;
  const dispatch = useAppDispatch();

  if (!element) {
    return (
      <div className="p-4 shadow">
        <p className="mt-4 text-gray-500">No element selected</p>
      </div>
    );
  }

  const update = <T extends CanvasElement>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
  };

  // Type guard for text element
  const isTextElement = (el: CanvasElement): el is CanvasTextElement => {
    return el.type === "text";
  };

  // Type guard for image element
  const isImageElement = (el: CanvasElement): el is CanvasImageElement => {
    return el.type === "image";
  };

  // Type guard for rectangle element
  const isRectangleElement = (el: CanvasElement): el is RectangleShape => {
    return el.type === "rectangle";
  };

  return (
    <div className="p-4 shadow space-y-5">
      {/* Canvas Settings: Width, Height */}
      <CanvasSettings />
      <AspectRatioSelector />

      {/* Shared: Position, Rotation */}
      <div className="grid grid-cols-2 gap-4">
        <TextInput
          label="X"
          type="number"
          value={element.x.toFixed(2)}
          onChange={(val) => update({ x: Number.parseFloat(val) })}
        />
        <TextInput
          label="Y"
          type="number"
          value={element.y.toFixed(2)}
          onChange={(val) => update({ y: Number.parseFloat(val) })}
        />
        <TextInput
          label="Width"
          type="number"
          value={element.width.toFixed(2)}
          onChange={(val) => update({ width: Number.parseFloat(val) })}
        />
        <TextInput
          label="Height"
          type="number"
          value={element.height.toFixed(2)}
          onChange={(val) => update({ height: Number.parseFloat(val) })}
        />
        <TextInput
          label="Rotation"
          type="number"
          value={(element.rotation ?? 0).toFixed(2)}
          onChange={(val) => update({ rotation: Number.parseFloat(val) })}
        />
      </div>

      {/* Common styling for all elements except images */}
      {!isImageElement(element) && <ShapeStyleControls element={element} update={update} />}

      {isRectangleElement(element) && <RectangleCornerControls element={element} update={update} />}

      {/* Text-specific Fields */}
      {isTextElement(element) && (
        <>
          <div className="flex items-center gap-4">
            <ColorInput
              label="Text Color"
              value={element.fill ?? "#000000"}
              onChange={(val) => update({ fill: val })}
            />
            <ColorInput
              label="Background"
              value={element.stroke ?? "#000000"}
              onChange={(val) => update({ background: val })}
            />
          </div>

          <TextInput
            label="Text"
            value={element.text ?? ""}
            onChange={(val) => update<CanvasTextElement>({ text: val })}
          />
          <TextInput
            label="Font Size"
            type="number"
            value={(parseInt(element.fontSize!.toString() || "") ?? 24).toString()}
            onChange={(val) =>
              update({
                fontSize: Number.parseInt(val),
              } as Partial<CanvasTextElement>)
            }
          />
          <SelectInput
            label="Font Family"
            value={element.fontFamily ?? "Arial"}
            onChange={(val) => update({ fontFamily: val } as Partial<CanvasTextElement>)}
            options={Array.from(FONT_FAMILY_OPTIONS)}
          />
          <TextInput
            label="Padding"
            type="number"
            value={(element.padding ?? 10).toString()}
            onChange={(val) => update<CanvasTextElement>({ padding: Number.parseFloat(val) })}
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

      {/* Image Preview */}
      {isImageElement(element) && element.src && (
        <div className="space-y-1">
          <label className="text-sm font-medium">Image Preview</label>
          <img src={element.src || "/placeholder.svg"} alt="Preview" className="w-full h-auto rounded border" />
        </div>
      )}
      {isImageElement(element) && (
        <InputRange
          label="Opacity"
          value={element.opacity ?? 1}
          onChange={(val) =>
            update({
              opacity: Math.min(1, Math.max(0, val)),
            })
          }
          className="w-full"
        />
      )}
    </div>
  );
}
