import { useState } from "react";
import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { updateElement } from "@/features/canvas/canvasSlice";
import type { CanvasElement } from "@/features/canvas/types";
import { usePercentConverter } from "@/hooks/usePercentConverter";
import { useAppDispatch } from "@/hooks/useRedux";
import { FaH, FaW, FaLock, FaLockOpen } from "react-icons/fa6";
import { Button } from "@/components/ui/Button";
import { useSelector } from "react-redux";
import RotationProperties from "../RotationProperties";

export default function IconScaleProperties({
  element,
}: {
  element: CanvasElement;
}) {
  const dispatch = useAppDispatch();
  const [lockAspect, setLockAspect] = useState(false);

  const update = <T extends CanvasElement>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
  };

  const { toPercent } = usePercentConverter();
  const stageWidth = useSelector((state: any) => state.canvas.stageWidth);
  const stageHeight = useSelector((state: any) => state.canvas.stageHeight);

  const handleScaleXChange = (val: string) => {
    const newX = Number(val);
    const ratio = (element.scaleY ?? 1) / (element.scaleX ?? 1);
    update({
      scaleX: newX,
      width_percent: toPercent(newX, stageWidth),
      ...(lockAspect && { scaleY: newX * ratio }),
    });
  };

  const handleScaleYChange = (val: string) => {
    const newY = Number(val);
    const ratio = (element.scaleX ?? 1) / (element.scaleY ?? 1);
    update({
      scaleY: newY,
      height_percent: toPercent(newY, stageHeight),
      ...(lockAspect && { scaleX: newY * ratio }),
    });
  };

  return (
    <>
      <h4 className="mb-2 flex items-center gap-2">
        Scale
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setLockAspect((prev) => !prev)}
          title={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
        >
          {lockAspect ? <FaLock /> : <FaLockOpen />}
        </Button>
      </h4>

      <div className="flex gap-4">
        <TextInput
          label={<FaW />}
          type="number"
          value={(element.scaleX ?? 1).toFixed(1)}
          onChange={handleScaleXChange}
        />
        <TextInput
          label={<FaH />}
          type="number"
          value={(element.scaleY ?? 1).toFixed(1)}
          onChange={handleScaleYChange}
        />
      </div>
    </>
  );
}
