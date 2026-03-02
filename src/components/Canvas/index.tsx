import Konva from "konva";
import { useEffect, useRef, useState, type RefObject } from "react";
import {
  Group,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
  Transformer,
} from "react-konva";
import {
  deleteSelectedElements,
  deselectAllElements,
  selectElement,
  selectMultipleElements,
  toggleSelectElement,
  updateElement,
} from "../../features/canvas/canvasSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { ElementRenderer } from "../ui/ElementRenderer";
import { ZoomControls } from "./ZoomControls";
interface CanvasProps {
  stageRef: RefObject<Konva.Stage>;
}
export function Canvas({ stageRef }: CanvasProps) {
  const elements = useAppSelector((state) => state.canvas.elements);
  const { stageWidth, stageHeight } = useAppSelector((state) => state.canvas);
  const dispatch = useAppDispatch();

  const selectedNodeRef = useRef<Konva.Node>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const guidesLayerRef = useRef<Konva.Layer>(null);
  const [guides, setGuides] = useState<
    {
      points: number[];
      text?: string;
      textPosition?: { x: number; y: number };
    }[]
  >([]);

  // Rec for highlight selection element
  const [selectionRect, setSelectionRect] = useState({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });

  // change cursor on drag
  const [cursor, setCursor] = useState<"default">("default");

  // ─────────────────────────────────────────────────────────────────
  // Zoom state: viewZoom = baseZoom (auto-fit) × zoomMultiplier (user)
  // ─────────────────────────────────────────────────────────────────
  const [baseZoom, setBaseZoom] = useState(1); // calculated by ResizeObserver
  const [zoomMultiplier, setZoomMultiplier] = useState(1); // controlled by the user buttons
  const viewZoom = baseZoom * zoomMultiplier;
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-fit: recalculate baseZoom when stage dimensions or container size changes.
  // Does NOT touch zoomMultiplier – user's manual adjustments are preserved.
  // When aspect ratio changes (stageWidth/stageHeight change), zoomMultiplier resets to 1.
  const isFirstRunRef = useRef(true);
  useEffect(() => {
    const calcBase = () => {
      const mainEl = containerRef.current?.closest("main");
      if (!mainEl) return;
      const availW = mainEl.clientWidth - 32;
      const availH = mainEl.clientHeight - 32;
      if (availW <= 0 || availH <= 0) return;
      const scale = Math.min(availW / stageWidth, availH / stageHeight);
      setBaseZoom(Math.min(Math.max(scale, 0.03), 1));
    };

    // On aspect-ratio change (not initial mount) → reset user multiplier to fit-to-screen
    if (!isFirstRunRef.current) {
      setZoomMultiplier(1);
    }
    isFirstRunRef.current = false;

    calcBase();

    const mainEl = containerRef.current?.closest("main");
    if (!mainEl) return;
    const ro = new ResizeObserver(calcBase);
    ro.observe(mainEl);
    return () => ro.disconnect();
  }, [stageWidth, stageHeight]);

  // Check if any element is selected
  const isAnyElementSelected = elements.some((el) => el.selected);

  // Update Transformer nodes for selected element
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !transformerRef.current) return;

    const selectedNodes = elements
      .filter((el) => el.selected)
      .map((el) => stage.findOne(`#${el.id}`))
      .filter(Boolean) as Konva.Node[];
    // Set Transformer nodes to selected elements
    transformerRef.current.nodes(selectedNodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [elements]);
  // Delete selected element
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === "Delete") {
        dispatch(deleteSelectedElements());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  // get pointer position on stage
  const pointerPos = (e: any) => e.target.getStage().getPointerPosition();

  // start selection rect on stage & set selectionRect visible  = true
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      const p = pointerPos(e);
      setSelectionRect({ visible: true, x1: p.x, y1: p.y, x2: p.x, y2: p.y });
      dispatch(deselectAllElements());
    }
  };

  // Update selection rect as mouse moves on stage
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!selectionRect.visible) return;
    const p = pointerPos(e);
    setSelectionRect((prev) => ({ ...prev, x2: p.x, y2: p.y }));
  };

  // End selection rect and select elements
  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!selectionRect.visible) return;
    //
    const stage = e.target.getStage();
    const box = {
      x: Math.min(selectionRect.x1, selectionRect.x2),
      y: Math.min(selectionRect.y1, selectionRect.y2),
      width: Math.abs(selectionRect.x2 - selectionRect.x1),
      height: Math.abs(selectionRect.y2 - selectionRect.y1),
    };

    const ids: string[] = [];
    elements.forEach((el) => {
      const node = stage?.findOne(`#${el.id}`);
      if (node && Konva.Util.haveIntersection(box, node.getClientRect())) {
        ids.push(el.id);
      }
    });

    if (ids.length) {
      dispatch(selectMultipleElements(ids));
    } else {
      dispatch(deselectAllElements());
    }

    setSelectionRect((prev) => ({ ...prev, visible: false }));
  };

  /* View zoom control functions - for zooming the entire canvas view */
  const handleZoomIn = () => {
    setZoomMultiplier((prev) => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomMultiplier((prev) => Math.max(prev / 1.2, 0.05));
  };

  // Reset → fit-to-screen (multiplier back to 1)
  const handleZoomReset = () => {
    setZoomMultiplier(1);
  };

  /* Ctrl + Scroll → zoom (like Figma). Regular scroll still scrolls the page. */
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    if (!e.evt.ctrlKey) return; // let normal scroll pass through
    e.evt.preventDefault();
    const direction = e.evt.deltaY < 0 ? 1 : -1; // scroll up = zoom in
    setZoomMultiplier((prev) =>
      Math.min(Math.max(prev * (1 + direction * 0.1), 0.05), 3),
    );
  };

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: Math.ceil(stageWidth * viewZoom),
          height: Math.ceil(stageHeight * viewZoom),
          display: "inline-block",
          overflow: "hidden",
          lineHeight: 0,
          fontSize: 0,
          backgroundColor: "white",
        }}
      >
        <div
          style={{
            transform: `scale(${viewZoom})`,
            transformOrigin: "top left",
            width: stageWidth + 1,
            height: stageHeight + 1,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <Stage
            ref={stageRef}
            width={stageWidth}
            height={stageHeight}
            style={{ cursor, display: "block" }}
            onPointerDown={handleMouseDown}
            onPointerMove={handleMouseMove}
            onPointerUp={handleMouseUp}
            onWheel={handleWheel}
            draggable={false}
          >
            <Layer>
              {elements.map((el) => (
                <ElementRenderer
                  key={el.id}
                  element={el}
                  ChildEl={elements}
                  isSelected={el.selected as boolean}
                  // handel click on element to select it and move it if shift key is pressed
                  onSelect={(e) => {
                    if (e?.evt.shiftKey) {
                      dispatch(toggleSelectElement(el.id));
                    } else {
                      dispatch(selectElement(el.id));
                    }
                  }}
                  onChange={(updates) =>
                    dispatch(updateElement({ id: el.id, updates }))
                  }
                  ref={el.selected ? selectedNodeRef : null}
                  stageWidth={stageWidth}
                  stageHeight={stageHeight}
                  stageRef={stageRef} // ✅ ضيف دي
                  setGuides={setGuides} // Pass setGuides to update guidelines
                  draggable={el.selected}
                />
              ))}
              {isAnyElementSelected && <Transformer ref={transformerRef} />}
            </Layer>

            <Layer ref={guidesLayerRef} listening={false}>
              {guides.map((guide, i) => (
                <Group key={`guide-group-${i}`} listening={false}>
                  <Line
                    points={guide.points}
                    stroke="#fb6f92"
                    strokeWidth={1}
                    dash={[4, 4]}
                  />
                  {guide.text && guide.textPosition && (
                    <Text
                      x={guide.textPosition.x}
                      y={guide.textPosition.y}
                      text={guide.text}
                      fontSize={11}
                      fontFamily="Arial"
                      fill="black"
                      align="center"
                      verticalAlign="middle"
                    />
                  )}
                </Group>
              ))}
            </Layer>

            <Layer listening={false}>
              {selectionRect.visible && (
                <Rect
                  x={Math.min(selectionRect.x1, selectionRect.x2)}
                  y={Math.min(selectionRect.y1, selectionRect.y2)}
                  width={Math.abs(selectionRect.x2 - selectionRect.x1)}
                  height={Math.abs(selectionRect.y2 - selectionRect.y1)}
                  fill="rgba(180,230,255,0.7)"
                  stroke={"rgba(120, 250, 255)"}
                />
              )}
            </Layer>
          </Stage>{" "}
        </div>{" "}
      </div>
      <ZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        currentZoom={viewZoom}
      />
    </>
  );
}
