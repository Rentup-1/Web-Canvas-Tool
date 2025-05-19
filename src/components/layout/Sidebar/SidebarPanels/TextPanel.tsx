import { addElement } from "../../../../features/canvas/canvasSlice";
import { useAppDispatch } from "../../../../hooks/useRedux";

export function TextPanel() {
  const dispatch = useAppDispatch();

  return (
    <div>
      <button className="fancy-button" onClick={() => dispatch(addElement({ type: "text" }))}>
        Add Text
      </button>
    </div>
  );
}
