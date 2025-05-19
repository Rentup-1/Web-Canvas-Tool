import { addElement } from "../../../../features/canvas/canvasSlice";
import { useAppDispatch } from "../../../../hooks/useRedux";

export function FramePanel() {
  const dispatch = useAppDispatch();

  return (
    <div>
      <button className="fancy-button" onClick={() => dispatch(addElement({ type: "frame" }))}>
        Add Frame
      </button>
    </div>
  );
}
