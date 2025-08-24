import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { updateElement } from "@/features/canvas/canvasSlice";
import type { CanvasElement } from "@/features/canvas/types";
import { usePercentConverter } from "@/hooks/usePercentConverter";
import { useAppDispatch } from "@/hooks/useRedux";
import { FaH, FaW } from "react-icons/fa6";
import { useSelector } from "react-redux";

export default function IconScaleProperties({
  element,
}: {
  element: CanvasElement;
}) {
  const dispatch = useAppDispatch();
  const update = <T extends CanvasElement>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
  };
  const { toPercent } = usePercentConverter();
  const stageWidth = useSelector((state: any) => state.canvas.stageWidth);
  const stageHeight = useSelector((state: any) => state.canvas.stageHeight);
  return (
    <>
      <h4 className="mb-2">Scale</h4>
      <div className="flex gap-4">
        <TextInput
          label={<FaW />}
          type="number"
          value={(element.scaleX ?? 1).toFixed(1)}
          onChange={(val) =>
            update({
              scaleX: Number(val),
              width_percent: toPercent(Number(val), stageWidth),
            })
          }
        />
        <TextInput
          label={<FaH />}
          type="number"
          value={(element.scaleY ?? 1).toFixed(1)}
          onChange={(val) =>
            update({
              scaleY: Number(val),
              height_percent: toPercent(Number(val), stageHeight),
            })
          }
        />
      </div>
    </>
  );
}
