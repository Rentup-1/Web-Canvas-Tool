import { Stage, Layer, Transformer } from "react-konva";
import { useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../hooks";
import { selectElement, updateElement } from "../features/canvas/canvasSlice";
import { ElementRenderer } from "./ElementRenderer";

export function Canvas() {
  const elements = useAppSelector((state) => state.canvas.elements);
  const dispatch = useAppDispatch();

  const selectedNodeRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  useEffect(() => {
    if (transformerRef.current && selectedNodeRef.current) {
      transformerRef.current.nodes([selectedNodeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [elements]);

  return (
    <Stage width={1000} height={600} style={{ border: "1px solid #ccc" }}>
      <Layer>
        {elements.map((el) => (
          <ElementRenderer
            key={el.id}
            element={el}
            isSelected={el.selected as boolean}
            onSelect={() => dispatch(selectElement(el.id))}
            onChange={(updates) => dispatch(updateElement({ id: el.id, updates }))}
            ref={el.selected ? selectedNodeRef : null}
          />
        ))}
        <Transformer ref={transformerRef} />
      </Layer>
    </Stage>
  );
}
