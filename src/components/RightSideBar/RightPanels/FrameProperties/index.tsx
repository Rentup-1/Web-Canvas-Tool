import { useAppDispatch } from "@/hooks/useRedux";
import { updateElement } from "@/features/canvas/canvasSlice";
import type {
  CanvasElementUnion,
  CanvasFrameElement,
} from "@/features/canvas/types";
import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import PositionProperties from "../CommonProperties/PositionProperties";
import ScaleProperties from "../CommonProperties/ScaleProperties";
import RotationProperties from "../CommonProperties/RotationProperties";
import { ColorInput } from "@/components/ui/controlled-inputs/ColorInput";
import { Button } from "@/components/ui/Button";
import { MdBlurOn } from "react-icons/md";
import SelectInput from "@/components/ui/controlled-inputs/SelectInput";
import { useState } from "react";

export function FrameProperties({ element }: { element: CanvasFrameElement }) {
  const [availableOptions, setAvailableOptions] = useState([
    { label: "vertical", value: "vertical" },
    { label: "horizontal", value: "horizontal" },
    { label: "icon only", value: "iconOnly" },
    { label: "icon + text", value: "icon+Text" },
    { label: "text only", value: "textOnly" },
    { label: "project image", value: "projectImage" },
  ]);
  const dispatch = useAppDispatch();

  const update = <T extends CanvasElementUnion>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
    console.log(element);
  };
  const handleTagsChange = (val: string | string[]) => {
    if (Array.isArray(val)) {
      update({ tags: val });

      val.forEach((tag) => {
        const exists = availableOptions.some((option) => option.value === tag);
        if (!exists) {
          setAvailableOptions((prev) => [...prev, { label: tag, value: tag }]);
        }
      });
    } else if (typeof val === "string") {
      update({ tags: [val] });
      const exists = availableOptions.some((option) => option.value === val);
      if (!exists) {
        setAvailableOptions((prev) => [...prev, { label: val, value: val }]);
      }
    }
  };
  return (
    <div className="space-y-4">
      {/* Common Shape Properties */}
      <PositionProperties element={element} />
      <ScaleProperties element={element} />
      <RotationProperties element={element} />
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-7">
          <div className="flex gap-4 items-center">
            <ColorInput
              label="border Color"
              value={element.stroke ?? "#000000"}
              onChange={(val) => update({ stroke: val })}
            />
            <div className="">
              <div className="text-sm font-medium mb-1">Transparent</div>
              <Button
                size="sm"
                variant={"outline"}
                className="mr-2 text-gray-500 font-bold"
                onClick={() => update({ stroke: "transparent" })}
              >
                <MdBlurOn />
              </Button>
            </div>
          </div>
          {/* create select options of assetType */}
          <SelectInput
            className="col-span-full"
            label="asset type"
            value={element.assetType}
            options={[
              { label: "Project Logo", value: "projectLogo" },
              { label: "Developer Logo", value: "developerLogo" },
              { label: "Image", value: "image" },
              { label: "Video", value: "video" },
              { label: "Other Logo", value: "otherLogo" },
            ]}
            onChange={(val) => {
              if (typeof val === "string") {
                update({ assetType: val });
              }
            }}
          />
          <div className="col-span-full">
            <TextInput
              label="Label"
              type="text"
              value={element.label}
              onChange={(val) => update({ label: val })}
            />
          </div>
          <SelectInput
            creatable
            isMulti
            isSearchable
            className="col-span-full"
            label="Tags"
            value={element.tags}
            options={availableOptions}
            onChange={handleTagsChange}
          />
        </div>
      </div>
    </div>
  );
}
