import { useAppDispatch, useAppSelector } from "../../../../hooks/useRedux";
import { selectElement, moveElementUp, moveElementDown } from "../../../../features/canvas/canvasSlice";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";

export function LayerPanel() {
  const elements = useAppSelector((state) => state.canvas.elements);
  const dispatch = useAppDispatch();

  return (
    <div className="p-4 bg-white shadow  space-y-2">
      <h2 className="text-lg font-bold mb-2">Layers</h2>
      {[...elements].reverse().map((el) => (
        <div
          key={el.id}
          className={`flex justify-between items-center p-2 border rounded cursor-pointer ${
            el.selected ? "bg-blue-100" : "hover:bg-gray-100"
          }`}
          onClick={() => dispatch(selectElement(el.id))}
        >
          <span className="truncate">{el.label || el.type}</span>
          <div className="space-x-1 flex">
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch(moveElementUp(el.id));
              }}
            >
              <HiChevronUp color="gray" size={32} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch(moveElementDown(el.id));
              }}
            >
              <HiChevronDown color="gray" size={32} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
