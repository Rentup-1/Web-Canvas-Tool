import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { updateElement } from "@/features/canvas/canvasSlice";
import type {
  CanvasElement,
  CanvasElementUnion,
} from "@/features/canvas/types";
// import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import PositionProperties from "../CommonProperties/PositionProperties";
import IconScaleProperties from "../CommonProperties/IconScaleProperties";
// import RotationProperties from "../CommonProperties/RotationProperties";
import { ColorInput } from "@/components/ui/controlled-inputs/ColorInput";
import { useState } from "react";
import SelectInput from "@/components/ui/controlled-inputs/SelectInput";
import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { BsBorderWidth } from "react-icons/bs";

export function IconProperties({ element }: { element: CanvasElement }) {
  const dispatch = useAppDispatch();
  const [individualCorners, setIndividualCorners] = useState(false);
  // get colors from store
  const brandingColors = useAppSelector((state) => state.branding.colors);

  const [branding, setBranding] = useState<string[]>([]);

  const update = <T extends CanvasElementUnion>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
  };

  return (
    <div className="space-y-4">
      {/* Common Shape Properties */}
      <PositionProperties element={element} />
      <IconScaleProperties element={element} />
      {/* <RotationProperties element={element} /> */}
      <div className="grid grid-cols-2 col-span-full gap-4">
        <ColorInput
          className="col-span-full"
          showOpacity
          label="Fill Color"
          value={element.fill}
          onChange={(val) => update({ fill: val })}
          disabled={element.fillBrandingType !== "fixed"}
        />
        <ColorInput
          showOpacity
          className="col-span-full"
          label="Stroke Color"
          value={element.stroke ?? "#000000"}
          onChange={(val) => update({ stroke: val })}
          disabled={element.strokeBrandingType !== "fixed"}
        />
        <SelectInput
          isClearable={false}
          className="col-span-full"
          label="Fill Branding"
          value={element.fillBrandingType ?? "fixed"}
          onChange={(val) => {
            if (val !== "fixed") {
              update({
                fill: brandingColors[val as (typeof branding)[number]],
                fillBrandingType: val as (typeof branding)[number],
              });
            } else {
              update({
                fill: element.fill,
                fillBrandingType: val as (typeof branding)[number],
              });
            }
          }}
          options={["fixed", ...branding]}
        />
        <SelectInput
          isClearable={false}
          className="col-span-full"
          label="Stroke Branding"
          value={element.strokeBrandingType ?? "fixed"}
          onChange={(val) => {
            if (val !== "fixed") {
              update({
                stroke: brandingColors[val as (typeof branding)[number]],
                strokeBrandingType: val as (typeof branding)[number],
              });
            } else {
              update({
                stroke: element.stroke,
                strokeBrandingType: val as (typeof branding)[number],
              });
            }
          }}
          options={["fixed", ...branding]}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-4 col-span-full items-center text-sm">
        <h4 className="col-span-full mb-2">Stroke Width</h4>
        <TextInput
          label={<BsBorderWidth />}
          type="number"
          min={0}
          value={element.strokeWidth?.toString() ?? "0"}
          onChange={(val) => update({ strokeWidth: Number.parseFloat(val) })}
        />
      </div>
    </div>
  );
}
