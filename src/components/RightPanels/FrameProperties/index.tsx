import { useAppDispatch } from "@/hooks/useRedux";
import { updateElement } from "@/features/canvas/canvasSlice";
import type { CanvasElement } from "@/features/canvas/types";
import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { TagInput } from "@/components/ui/controlled-inputs/TagsInput";
import PositionProperties from "../CommonProperties/PositionProperties";
import ScaleProperties from "../CommonProperties/ScaleProperties";
import RotationProperties from "../CommonProperties/RotationProperties";
import { ColorInput } from "@/components/ui/controlled-inputs/ColorInput";
import { Button } from "@/components/ui/Button";
import { FaAlignLeft } from "react-icons/fa";
import { MdBlurOn } from "react-icons/md";

export function FrameProperties({ element }: { element: CanvasElement }) {
  const dispatch = useAppDispatch();

  const update = <T extends CanvasElement>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
    console.log(element);
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
                  onClick={() => update({ stroke: "transparent" })}>
                  <MdBlurOn  />
                </Button>
              </div>
          </div>

          

          <div className="col-span-full">
            <TextInput
              label="Label"
              type="text"
              value={element.label || ""}
              onChange={(val) => update({ label: val })}
            />
          </div>
          <div className="col-span-full">
            <TagInput
              label="Tags"
              value={element.tags || []}
              onChange={(newTags) => update({ tags: newTags })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
