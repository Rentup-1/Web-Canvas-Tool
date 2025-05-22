import { useAppDispatch } from "@/hooks/useRedux";
import { updateElement } from "@/features/canvas/canvasSlice";
import type { CanvasElement } from "@/features/canvas/types";
import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { TagInput } from "@/components/ui/controlled-inputs/TagsInput";


export function FrameProperties({ element }: { element: CanvasElement }) {
  const dispatch = useAppDispatch();

  const update = <T extends CanvasElement>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
    console.log(element);
    
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
