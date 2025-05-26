import { Stage, Layer, Transformer } from "react-konva";
import { useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import {
  deleteSelectedElement,
  selectElement,
  updateElement,
} from "../../../features/canvas/canvasSlice";
import { ElementRenderer } from "../../ui/ElementRenderer";

export function Canvas() {
  const elements = useAppSelector((state) => state.canvas.elements);
  const { stageWidth, stageHeight } = useAppSelector((state) => state.canvas);
  const dispatch = useAppDispatch();
  const selectedNodeRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  useEffect(() => {
    if (transformerRef.current && selectedNodeRef.current) {
      transformerRef.current.nodes([selectedNodeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [elements]);

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === "Delete") {
        dispatch(deleteSelectedElement());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Stage
      width={stageWidth}
      height={stageHeight}
      style={{ border: "1px solid #ccc" }}
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
        <Transformer ref={transformerRef} />
      </Layer>
    </Stage>
  );
}
