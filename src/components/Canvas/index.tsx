import { Stage, Layer, Transformer } from "react-konva";
import { useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import {
  deleteSelectedElement,
  selectElement,
  updateElement,
  deselectAllElements,
} from "../../features/canvas/canvasSlice";
import { ElementRenderer } from "../ui/ElementRenderer";

export function Canvas() {
  const elements = useAppSelector((state) => state.canvas.elements);
  const { stageWidth, stageHeight } = useAppSelector((state) => state.canvas);
  const dispatch = useAppDispatch();
  const selectedNodeRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  // Check if any element is selected
  const isAnyElementSelected = elements.some((el) => el.selected);

  useEffect(() => {
    if (
      transformerRef.current &&
      selectedNodeRef.current &&
      isAnyElementSelected
    ) {
      transformerRef.current.nodes([selectedNodeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    } else if (transformerRef.current) {
      // Clear Transformer nodes when no element is selected
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [elements, isAnyElementSelected]);

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === "Delete") {
        dispatch(deleteSelectedElement());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      dispatch(deselectAllElements());
    }
  };

  return (
    <Stage
      width={stageWidth}
      height={stageHeight}
      style={{ border: "1px solid #ccc" }}
      onMouseDown={handleStageClick}
    >
      <Layer>
        {elements.map((el) => (
          <ElementRenderer
            key={el.id}
            element={el}
            isSelected={el.selected as boolean}
            onSelect={() => dispatch(selectElement(el.id))}
            onChange={(updates) =>
              dispatch(updateElement({ id: el.id, updates }))
            }
            ref={el.selected ? selectedNodeRef : null}
          />
        ))}
        {isAnyElementSelected && <Transformer ref={transformerRef} />}
      </Layer>
    </Stage>
  );
}
