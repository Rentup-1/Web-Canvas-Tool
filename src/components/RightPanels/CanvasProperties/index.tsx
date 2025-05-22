import { SelectInput } from "@/components/ui/controlled-inputs/SelectInput";
import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { setStageSize } from "@/features/canvas/canvasSlice";
import type { AspectRatio } from "@/features/canvas/types";
import { useAspectRatioChange } from "@/hooks/useAspectRatioChange";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { FaH, FaW } from "react-icons/fa6";

export default function CanvasProperties() {
  const changeAspectRatio = useAspectRatioChange();
  const dispatch = useAppDispatch();
  const { stageWidth, stageHeight } = useAppSelector((state) => state.canvas);

  const updateSize = (dimension: "width" | "height", value: string) => {
    const numeric = parseInt(value);
    if (!isNaN(numeric)) {
      dispatch(
        setStageSize({
          width: dimension === "width" ? numeric : stageWidth,
          height: dimension === "height" ? numeric : stageHeight,
        })
      );
    }
  };
  const ASPICT_RATIO = ["1:1", "9:16"] as const;
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <h3 className="col-span-full font-medium text-sm">Canvas Size</h3>
        <TextInput
          label={<FaW />}
          type="number"
          value={stageWidth}
          onChange={(val) => updateSize("width", val)}
        />
        <TextInput
          label={<FaH />}
          type="number"
          value={stageHeight}
          onChange={(val) => updateSize("height", val)}
        />
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <SelectInput
          label="Aspect ratio"
          value="1:1"
          onChange={(val) => changeAspectRatio(val as AspectRatio)}
          options={Array.from(ASPICT_RATIO)}
        />
      </div>
    </div>
  );
}
