// src/components/RightSideBar/RightPanels/ShapeProperties/index.tsx
import { useAppDispatch } from "@/hooks/useRedux";
import { updateElement } from "@/features/canvas/canvasSlice";
import type { CanvasElement, RectangleShape } from "@/features/canvas/types";
import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { ColorInput } from "@/components/ui/controlled-inputs/ColorInput";
import { InputRange } from "@/components/ui/controlled-inputs/InputRange";
import { useState, useEffect } from "react";
import { BsBorderWidth } from "react-icons/bs";
import { Button } from "@/components/ui/Button";
import { FaLock, FaUnlock } from "react-icons/fa";
import {
  RxCornerBottomLeft,
  RxCornerBottomRight,
  RxCorners,
  RxCornerTopLeft,
  RxCornerTopRight,
} from "react-icons/rx";
import PositionProperties from "../CommonProperties/PositionProperties";
import ScaleProperties from "../CommonProperties/ScaleProperties";
import RotationProperties from "../CommonProperties/RotationProperties";
import SelectInput from "@/components/ui/controlled-inputs/SelectInput";
import NumberInput from "@/components/ui/controlled-inputs/NumberInput";
import type { BrandColorRole } from "@/types/templateDocumentV2";

const isRectangleElement = (el: CanvasElement): el is RectangleShape => {
  return el.type === "rectangle" || el.shapeKind === "rect";
};

export function ShapeProperties({ element }: { element: CanvasElement }) {
  const dispatch = useAppDispatch();
  const [individualCorners, setIndividualCorners] = useState(false);

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

  const brandColorRoleOptions = [
    { value: "none", label: "Custom Hex Color" },
    { value: "primary", label: "Brand Primary" },
    { value: "secondary", label: "Brand Secondary" },
    { value: "accent", label: "Brand Accent" },
  ];

  return (
    <div className="space-y-4">
      <PositionProperties element={element} />
      <ScaleProperties element={element} />
      <RotationProperties element={element} />

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-full my-2">
            <InputRange
              label="Opacity"
              value={element.opacity ?? 1}
              onChange={(val) => update({ opacity: val })}
            />
          </div>

          <div className="grid grid-cols-2 col-span-full gap-4">
            <SelectInput
              className="col-span-full"
              label="Fill Brand Role"
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
                showOpacity
                label="Fill Color"
                value={element.fill}
                onChange={(val) => update({ fill: val })}
              />
            )}

            <SelectInput
              className="col-span-full"
              label="Stroke Brand Role"
              value={element.strokeRole || "none"}
              options={brandColorRoleOptions}
              onChange={(val) => {
                const role = val === "none" ? null : (val as BrandColorRole);
                update({
                  strokeRole: role,
                  strokeBrandingType: role ? "dynamic" : "fixed",
                });
              }}
            />

            {!element.strokeRole && (
              <ColorInput
                showOpacity
                className="col-span-full"
                label="Stroke Color"
                value={element.stroke ?? "#000000"}
                onChange={(val) => update({ stroke: val })}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-4 col-span-full items-center text-sm">
            <h4 className="col-span-full mb-2">Stroke Width</h4>
            <TextInput
              label={<BsBorderWidth />}
              type="number"
              min={0}
              value={element.strokeWidth?.toString() ?? "0"}
              onChange={(val) =>
                update({ strokeWidth: Number.parseFloat(val) || 0 })
              }
            />
          </div>
        </div>
      </div>

      {/* Polygon Specific (Sides) */}
      {(element.type === "regularPolygon" || element.shapeKind === "polygon") && (
        <div className="space-y-2">
          <NumberInput
            label="Polygon Sides"
            value={element.sides ?? 5}
            onChange={(val) => update({ sides: Number(val) || 3 })}
            min={3}
            max={20}
          />
        </div>
      )}

      {/* Star Specific (Points & Inner Ratio) */}
      {(element.type === "star" || element.shapeKind === "star") && (
        <div className="space-y-3">
          <NumberInput
            label="Star Points"
            value={element.numPoints ?? 5}
            onChange={(val) => update({ numPoints: Number(val) || 3 })}
            min={3}
            max={30}
          />
          <InputRange
            label="Inner Radius Ratio"
            value={element.innerRatio ?? 0.5}
            onChange={(val) => update({ innerRatio: val })}
            min={0.1}
            max={0.9}
            step={0.05}
          />
        </div>
      )}

      {/* Ring Specific (Inner Ratio) */}
      {(element.type === "ring" || element.shapeKind === "ring") && (
        <div className="space-y-2">
          <InputRange
            label="Inner Radius Ratio"
            value={element.innerRatio ?? 0.5}
            onChange={(val) => update({ innerRatio: val })}
            min={0.1}
            max={0.9}
            step={0.05}
          />
        </div>
      )}

      {/* Rectangle Corner Radius */}
      {isRectangleElement(element) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Corner Radius</h4>

          <div className="flex flex-row-reverse gap-4 items-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIndividualCorners(!individualCorners)}
              aria-label="Toggle Corners"
            >
              {individualCorners === false ? <FaLock /> : <FaUnlock />}
            </Button>
            {!individualCorners ? (
              <TextInput
                label={<RxCorners />}
                type="number"
                value={((element.cornerRadius as number) || 0).toString()}
                onChange={(val) => {
                  const radius = Number.parseFloat(val) || 0;
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
                  label={<RxCornerTopLeft />}
                  type="number"
                  value={(element.borderRadius?.topLeft ?? 0).toString()}
                  onChange={(val) =>
                    update<RectangleShape>({
                      borderRadius: {
                        ...element.borderRadius,
                        topLeft: Number.parseFloat(val) || 0,
                      },
                    })
                  }
                />
                <TextInput
                  label={<RxCornerTopRight />}
                  type="number"
                  value={(element.borderRadius?.topRight ?? 0).toString()}
                  onChange={(val) =>
                    update<RectangleShape>({
                      borderRadius: {
                        ...element.borderRadius,
                        topRight: Number.parseFloat(val) || 0,
                      },
                    })
                  }
                />
                <TextInput
                  label={<RxCornerBottomLeft />}
                  type="number"
                  value={(element.borderRadius?.bottomLeft ?? 0).toString()}
                  onChange={(val) =>
                    update<RectangleShape>({
                      borderRadius: {
                        ...element.borderRadius,
                        bottomLeft: Number.parseFloat(val) || 0,
                      },
                    })
                  }
                />
                <TextInput
                  label={<RxCornerBottomRight />}
                  type="number"
                  value={(element.borderRadius?.bottomRight ?? 0).toString()}
                  onChange={(val) =>
                    update<RectangleShape>({
                      borderRadius: {
                        ...element.borderRadius,
                        bottomRight: Number.parseFloat(val) || 0,
                      },
                    })
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
