import { useAppDispatch } from "@/hooks/useRedux";
import { updateElement } from "@/features/canvas/canvasSlice";
import type { CanvasElement } from "@/features/canvas/types";
import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { useSelector } from "react-redux";


export function ImageProperties({ element }: { element: CanvasElement }) {
  const dispatch = useAppDispatch();
  const elements = useSelector((store:any) => store.canvas.elements);

  const handleFitModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFitMode = e.target.value;

    const frame = elements.find((f:CanvasElement) => f.id === element.frameId);

    const imgW = element.originalWidth;  // ✅ مش element.width
    const imgH = element.originalHeight; // ✅ مش element.height

    if (frame && imgW && imgH) {
      const frameAspect = frame.width / frame.height;
      const imgAspect = imgW / imgH;

      let newWidth, newHeight, offsetX, offsetY;

      switch (newFitMode) {
        case "fit":
          if (imgAspect > frameAspect) {
            newWidth = frame.width;
            newHeight = frame.width / imgAspect;
          } else {
            newHeight = frame.height;
            newWidth = frame.height * imgAspect;
          }
          break;

        case "fill":
        default:
          if (imgAspect < frameAspect) {
            newWidth = frame.width;
            newHeight = frame.width / imgAspect;
          } else {
            newHeight = frame.height;
            newWidth = frame.height * imgAspect;
          }
          break;

        case "stretch":
          newWidth = frame.width;
          newHeight = frame.height;
          break;
      }

      offsetX = (frame.width - newWidth) / 2;
      offsetY = (frame.height - newHeight) / 2;

      dispatch(updateElement({
        id: element.id,
        updates: {
          fitMode: newFitMode,
          x: frame.x + offsetX,
          y: frame.y + offsetY,
          width: newWidth,
          height: newHeight,
        }
      }));
    } else {
      dispatch(updateElement({
        id: element.id,
        updates: { fitMode: newFitMode }
      }));
    }
  };


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
            <label>Image Fit Mode:</label>
            <br />
            <select className="text-gray-400 border w-1/2 mt-1" onChange={handleFitModeChange}>
                <option value="fill">Fill</option>
                <option value="fit">Fit</option>
                <option value="stretch">Stretch</option>
            </select>
            <div className="space-y-1 mt-3">
              <label className="text-sm font-medium">Image Preview</label>
              <img src={element.src} alt="Preview" className="w-full h-auto rounded border" />
            </div>
          </div>
          
        </div>
      </div>

    
    </div>
  );
}
