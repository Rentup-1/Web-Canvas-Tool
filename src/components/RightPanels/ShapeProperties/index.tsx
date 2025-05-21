import { useAppDispatch } from "@/hooks/useRedux";
import { updateElement } from "@/features/canvas/canvasSlice";
import type { CanvasElement, RectangleShape } from "@/features/canvas/types";
import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { ColorInput } from "@/components/ui/controlled-inputs/ColorInput";
import { InputRange } from "@/components/ui/controlled-inputs/InputRange";
import { useState, useEffect } from "react";
import { SelectInput } from "@/components/ui/controlled-inputs/SelectInput";

const BRANDING_OPTIONS = [
  "primary",
  "secondary",
  "additional",
  "fixed",
] as const;

const isRectangleElement = (el: CanvasElement): el is RectangleShape => {
  return el.type === "rectangle";
};

export function ShapeProperties({ element }: { element: CanvasElement }) {
  const dispatch = useAppDispatch();
  const [individualCorners, setIndividualCorners] = useState(false);

  // Check if corners are already different when component mounts (for rectangles)
  useEffect(() => {
    if (isRectangleElement(element)) {
      const br = element.borderRadius || {};
      const hasIndividualCorners =
        br.topLeft !== br.topRight ||
        br.topLeft !== br.bottomRight ||
        br.topLeft !== br.bottomLeft;

      if (hasIndividualCorners) {
        setIndividualCorners(true);
      }
    }
  }, [element]);

  const update = <T extends CanvasElement>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
  };

  return (
    <div className="space-y-4">
      {/* Common Shape Properties */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Position & Size</h3>
        <div className="grid grid-cols-2 gap-7">
          <TextInput
            label="X"
            type="number"
            value={element.x.toFixed(0)}
            onChange={(val) => update({ x: Number.parseFloat(val) })}
          />
          <TextInput
            label="Y"
            type="number"
            value={element.y.toFixed(0)}
            onChange={(val) => update({ y: Number.parseFloat(val) })}
          />
          <TextInput
            label="Width"
            type="number"
            value={element.width.toFixed(0)}
            onChange={(val) => update({ width: Number.parseFloat(val) })}
          />
          <TextInput
            label="Height"
            type="number"
            value={element.height.toFixed(0)}
            onChange={(val) => update({ height: Number.parseFloat(val) })}
          />
          <TextInput
            label="Rotation"
            type="number"
            value={(element.rotation ?? 0).toFixed(0)}
            onChange={(val) => update({ rotation: Number.parseFloat(val) })}
          />
          <div className="col-span-full">
            <InputRange
              label="Opacity"
              value={element.opacity ?? 1}
              onChange={(val) => update({ opacity: Number.parseFloat(val) })}
            />
          </div>
          <ColorInput
            label="Fill Color"
            value={element.fill ?? "#000000"}
            onChange={(val) => update({ fill: val })}
          />
          <SelectInput
            label="Fill Branding"
            value={element.fillBrandingType ?? "fixed"}
            onChange={(val) =>
              update({
                fillBrandingType: val as (typeof BRANDING_OPTIONS)[number],
              })
            }
            options={BRANDING_OPTIONS as unknown as string[]}
          />
          <ColorInput
            label="Stroke Color"
            value={element.stroke ?? "#000000"}
            onChange={(val) => update({ stroke: val })}
          />
          <SelectInput
            label="Stroke Branding"
            value={element.strokeBrandingType ?? "fixed"}
            onChange={(val) =>
              update({
                strokeBrandingType: val as (typeof BRANDING_OPTIONS)[number],
              })
            }
            options={BRANDING_OPTIONS as unknown as string[]}
          />
          <TextInput
            label="Stroke Width"
            type="number"
            value={element.strokeWidth?.toString() ?? "0"}
            onChange={(val) => update({ strokeWidth: Number.parseFloat(val) })}
          />
        </div>
      </div>

      {/* Rectangle Corner Radius */}
      {isRectangleElement(element) && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Corner Radius</h3>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="individualCorners"
              checked={individualCorners}
              onChange={(e) => setIndividualCorners(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="individualCorners" className="text-sm">
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
                update<RectangleShape>({
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
            <div className="grid grid-cols-2 gap-2">
              <TextInput
                label="Top Left"
                type="number"
                value={(element.borderRadius?.topLeft ?? 0).toString()}
                onChange={(val) =>
                  update<RectangleShape>({
                    borderRadius: {
                      ...element.borderRadius,
                      topLeft: Number.parseFloat(val),
                    },
                  })
                }
              />
              <TextInput
                label="Top Right"
                type="number"
                value={(element.borderRadius?.topRight ?? 0).toString()}
                onChange={(val) =>
                  update<RectangleShape>({
                    borderRadius: {
                      ...element.borderRadius,
                      topRight: Number.parseFloat(val),
                    },
                  })
                }
              />
              <TextInput
                label="Bottom Right"
                type="number"
                value={(element.borderRadius?.bottomRight ?? 0).toString()}
                onChange={(val) =>
                  update<RectangleShape>({
                    borderRadius: {
                      ...element.borderRadius,
                      bottomRight: Number.parseFloat(val),
                    },
                  })
                }
              />
              <TextInput
                label="Bottom Left"
                type="number"
                value={(element.borderRadius?.bottomLeft ?? 0).toString()}
                onChange={(val) =>
                  update<RectangleShape>({
                    borderRadius: {
                      ...element.borderRadius,
                      bottomLeft: Number.parseFloat(val),
                    },
                  })
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
