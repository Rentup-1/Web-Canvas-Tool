import { FaUndo, FaRedo } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../../hooks/useRedux";
import { redo, undo } from "../../../features/canvas/canvasSlice";

export function HistoryControls() {
  const dispatch = useAppDispatch();
  const past = useAppSelector((state) => state.canvas.past);
  const future = useAppSelector((state) => state.canvas.future);

  return (
    <div className="flex gap-2">
      <button
        className="fancy-button flex items-center justify-center gap-2"
        disabled={past.length === 0}
        onClick={() => dispatch(undo())}
      >
        <FaUndo />
        <span>Undo</span>
      </button>

      <button
        className="fancy-button flex items-center justify-center gap-2"
        disabled={future.length === 0}
        onClick={() => dispatch(redo())}
      >
        <FaRedo />
        <span>Redo</span>
      </button>
    </div>
  );
}
