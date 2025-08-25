import Konva from "konva";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Group, Layer, Line, Rect, Stage, Text, Transformer } from "react-konva";
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
    const [cursor, setCursor] = useState<"default" | "grab" | "grabbing">("default");

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

    /* handle zooming */
    const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();

        const stage = stageRef.current;
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const scaleBy = 1.05;
        const minScale = 1;
        const maxScale = 5;

        let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        newScale = Math.max(minScale, Math.min(maxScale, newScale));

        stage.scale({ x: newScale, y: newScale });

        let newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        // تقييدؤ السحب
        const stageBox = {
            width: stageWidth * newScale,
            height: stageHeight * newScale,
        };
        const containerWidth = stage.width();
        const containerHeight = stage.height();

        const minX = containerWidth - stageBox.width;
        const minY = containerHeight - stageBox.height;

        newPos.x = Math.min(0, Math.max(minX, newPos.x));
        newPos.y = Math.min(0, Math.max(minY, newPos.y));

        stage.position(newPos);
        stage.batchDraw();
    };

    return (
        <Stage
            ref={stageRef}
            width={stageWidth}
            height={stageHeight}
            style={{ cursor }}
            onPointerDown={handleMouseDown}
            onPointerMove={handleMouseMove}
            onPointerUp={handleMouseUp}
            onWheel={handleWheel}
            draggable={stageRef.current?.scaleX() > 1}
            dragBoundFunc={(pos) => {
                const stage = stageRef.current;
                const scale = stage.scaleX(); // scale ثابت في X و Y

                const stageBox = {
                    width: stageWidth * scale,
                    height: stageHeight * scale,
                };

                const containerWidth = stage.width();
                const containerHeight = stage.height();

                const minX = containerWidth - stageBox.width;
                const minY = containerHeight - stageBox.height;

                return {
                    x: Math.min(0, Math.max(minX, pos.x)),
                    y: Math.min(0, Math.max(minY, pos.y)),
                };
            }}
            onDragStart={() => setCursor("grabbing")}
            onDragEnd={() => setCursor("grab")}
            onMouseEnter={() => {
                if (stageRef.current?.draggable()) setCursor("grab");
            }}
            onMouseLeave={() => setCursor("default")}
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
                        onChange={(updates) => dispatch(updateElement({ id: el.id, updates }))}
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
        </Stage>
    );
}
