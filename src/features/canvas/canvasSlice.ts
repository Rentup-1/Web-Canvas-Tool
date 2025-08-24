import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";
import type { AspectRatio, CanvasElementUnion, CanvasGroupElement, ElementType } from "./types";
import type {
    CanvasElement,
    CanvasTextElement,
    CircleShape,
    RectangleShape,
    EllipseShape,
    LineShape,
    TriangleShape,
    StarShape,
    CustomShape,
    RegularPolygonShape,
    ArcShape,
    WedgeShape,
    RingShape,
    ArrowShape,
} from "./types";
import { WritableDraft } from "immer";

interface CanvasState {
    elements: CanvasElement[];
    past: CanvasElement[][];
    future: CanvasElement[][];
    stageWidth: number;
    stageHeight: number;
    aspectRatio?: AspectRatio;
}

const initialState: CanvasState = {
    elements: [],
    past: [],
    future: [],
    stageWidth: 1080,
    stageHeight: 1080,
    aspectRatio: "1:1",
};

let shapeIdCounter = 1;

const snapshot = (state: WritableDraft<CanvasState>) => {
    state.past.push(JSON.parse(JSON.stringify(state.elements))); // deep clone
    state.future = [];
};

const createBaseElement = (id: string): Omit<CanvasElement, "type"> => {
    const width = 150;
    const height = 100;
    const toPercent = (value: number, total: number) => {
        return Number(Number(value / total));
    };
    return {
        id,
        x: 150,
        y: 150,
        width,
        height,
        x_percent: toPercent(150, 1080),
        y_percent: toPercent(150, 1080),
        width_percent: toPercent(width, 1080),
        height_percent: toPercent(height, 1080),
        rotation: 0,
        selected: false,
        fill: "#00A8E8",
        opacity: 1,
        fillBrandingType: "fixed",
        strokeBrandingType: "fixed",
    };
};

const canvasSlice = createSlice({
    name: "canvas",
    initialState,
    reducers: {
        addElement: (
            state,
            action: PayloadAction<
                | { type: "icon"; iconName: string; path: string }
                | {
                      type: "text";
                      text: string;
                      toi_labels?: string;
                  }
                | { type: Exclude<ElementType, "icon" | "text"> }
            >
        ) => {
            const currentId = shapeIdCounter++;
            const base = createBaseElement(String(currentId));
            let newElement: CanvasElement;

            switch (action.payload.type) {
                case "text":
                    newElement = {
                        ...base,
                        id: `text-${currentId}`,
                        fontSize_percent: 2.5,
                        text: action.payload.text ?? "Edit Me Now...",
                        toi_labels: action.payload.toi_labels ?? "", // ✅ لو جت من الديسباتش خدها، لو لأ خالي
                        fill: "#524C4C", // background rect
                        background: "#fff",
                        padding: 8,
                        fontSize: 20,
                        opacity: 1,
                        type: "text",
                        backgroundStroke: "#A3A3A3",
                        backgroundStrokeWidth: 0,
                        fontFamily: "Arial",
                        fontVariant: "regular", // Initialize font variant
                        fontWeight: "normal",
                        fontStyle: "normal",
                        stroke: undefined,
                        strokeTextWidth: 0,
                        fontBrandingType: "fixed",
                        borderRadius: {
                            topLeft: 4,
                            topRight: 4,
                            bottomRight: 4,
                            bottomLeft: 4,
                        },
                        alignment: "left",
                        visible: true,
                    } as CanvasTextElement;
                    break;

                case "frame":
                    newElement = {
                        ...base,
                        type: "frame",
                        width: 250,
                        height: 200,
                        stroke: "#B5B0B0",
                        strokeWidth: 1,
                        fill: "transparent",
                        dash: [5, 5],
                        assetType: "frame",
                        tags: [],
                        visible: true,
                        fitMode: "fill",
                        objectFit: "cover",
                        borderRadiusSpecial: 0,
                    } as CanvasElement;
                    break;

                case "icon":
                    newElement = {
                        ...base,
                        type: "icon",
                        iconName: action.payload.iconName,
                        scaleX: 1,
                        scaleY: 1,
                        color: "#000000",
                        visible: true,
                        path: action.payload.path,
                    } as CanvasElement;
                    break;

                case "circle":
                    newElement = {
                        ...base,
                        type: "circle",
                        radius: Math.min(base.width, base.height) / 2,
                        stroke: "#000000",
                        strokeWidth: 2,
                        visible: true,
                    } as CircleShape;
                    break;

                case "rectangle":
                    newElement = {
                        ...base,
                        type: "rectangle",
                        cornerRadius: 0,
                        borderRadius: {
                            topLeft: 0,
                            topRight: 0,
                            bottomRight: 0,
                            bottomLeft: 0,
                        },
                        stroke: "#000000",
                        strokeWidth: 2,
                        visible: true,
                    } as RectangleShape;
                    break;

                case "ellipse":
                    newElement = {
                        ...base,
                        type: "ellipse",
                        radiusX: base.width / 2,
                        radiusY: base.height / 2,
                        stroke: "#000000",
                        strokeWidth: 2,
                        visible: true,
                    } as EllipseShape;
                    break;

                case "line":
                    newElement = {
                        ...base,
                        type: "line",
                        points: [0, 0, base.width, base.height],
                        stroke: "#000000",
                        strokeWidth: 2,
                        visible: true,
                    } as LineShape;
                    break;

                case "triangle":
                    newElement = {
                        ...base,
                        type: "triangle",
                        points: [0, base.height, base.width / 2, 0, base.width, base.height],
                        stroke: "#000000",
                        strokeWidth: 2,
                        visible: true,
                    } as TriangleShape;
                    break;

                case "star":
                    newElement = {
                        ...base,
                        type: "star",
                        innerRadius: 20,
                        outerRadius: 50,
                        numPoints: 5,
                        stroke: "#000000",
                        strokeWidth: 2,
                        visible: true,
                    } as StarShape;
                    break;

                case "regularPolygon":
                    newElement = {
                        ...base,
                        type: "regularPolygon",
                        sides: 6,
                        radius: Math.min(base.width, base.height) / 2,
                        stroke: "#000000",
                        strokeWidth: 2,
                        visible: true,
                    } as RegularPolygonShape;
                    break;

                case "arc":
                    newElement = {
                        ...base,
                        type: "arc",
                        innerRadius: 20,
                        outerRadius: 50,
                        angle: 60,
                        stroke: "#000000",
                        strokeWidth: 2,
                        visible: true,
                    } as ArcShape;
                    break;

                case "wedge":
                    newElement = {
                        ...base,
                        type: "wedge",
                        radius: Math.min(base.width, base.height) / 2,
                        angle: 60,
                        stroke: "#000000",
                        strokeWidth: 2,
                        visible: true,
                    } as WedgeShape;
                    break;

                case "ring":
                    newElement = {
                        ...base,
                        type: "ring",
                        innerRadius: 20,
                        outerRadius: 50,
                        stroke: "#000000",
                        strokeWidth: 2,
                        visible: true,
                    } as RingShape;
                    break;

                case "arrow":
                    newElement = {
                        ...base,
                        type: "arrow",
                        points: [0, 0, base.width, base.height],
                        pointerLength: 10,
                        pointerWidth: 10,
                        stroke: "#000000",
                        strokeWidth: 2,
                        visible: true,
                    } as ArrowShape;
                    break;

                case "custom":
                    newElement = {
                        ...base,
                        type: "custom",
                        points: [0, 0, base.width / 2, base.height, base.width, 0],
                        stroke: "#000000",
                        strokeWidth: 2,
                        visible: true,
                    } as CustomShape;
                    break;

                default:
                    throw new Error(`Unsupported element type: ${action.payload.type}`);
            }

            snapshot(state);
            state.elements.push(newElement);
        },
        addImageElement: (
            state,
            action: PayloadAction<{ src: string; width: number; height: number }>
        ) => {
            const { src, width, height } = action.payload;

            state.elements.push({
                id: nanoid(),
                type: "image",
                x: 150,
                y: 150,
                width,
                height,
                rotation: 0,
                selected: false,
                src,
                originalWidth: width,
                originalHeight: height,
                fill: "",
                visible: true,
            });
        },

        // select an element by id to make it selected
        selectElement: (state, action: PayloadAction<string | null>) => {
            state.elements.forEach((el) => {
                el.selected = el.id === action.payload;
            });
        },

        // toggle the selected state of an element
        toggleSelectElement: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            const element = state.elements.find((el) => el.id === id);
            // if the element is already selected, d2eselect it , otherwise select it
            if (element) {
                element.selected = !element.selected;
            }
        },

        selectMultipleElements: (state, action: PayloadAction<string[]>) => {
            state.elements = state.elements.map((el) => ({
                ...el,
                selected: action.payload.includes(el.id),
            }));
        },
        deselectAllElements: (state) => {
            state.elements = state.elements.map((el) => ({
                ...el,
                selected: false,
            }));
        },
        updateElement: (
            state,
            action: PayloadAction<{
                id: string | number | undefined;
                updates: Partial<CanvasElementUnion>;
            }>
        ) => {
            const { id, updates } = action.payload;
            const index = state.elements.findIndex((el) => el.id === id);
            if (index !== -1) {
                snapshot(state);
                state.elements[index] = { ...state.elements[index], ...updates };
            }
        },

        // delete all selected elements at once
        deleteSelectedElements: (state) => {
            snapshot(state);
            state.elements = state.elements.filter((el) => !el.selected);
        },

        undo: (state) => {
            if (state.past.length > 0) {
                const previous = state.past.pop();
                if (previous) {
                    state.future.unshift(state.elements.map((el) => ({ ...el })));
                    state.elements = previous;
                }
            }
        },
        redo: (state) => {
            if (state.future.length > 0) {
                const next = state.future.shift();
                if (next) {
                    state.past.push(state.elements.map((el) => ({ ...el })));
                    state.elements = next;
                }
            }
        },
        moveElementUp: (state, action: PayloadAction<string>) => {
            const index = state.elements.findIndex((el) => el.id === action.payload);
            if (index < state.elements.length - 1) {
                snapshot(state);
                [state.elements[index], state.elements[index + 1]] = [
                    state.elements[index + 1],
                    state.elements[index],
                ];
            }
        },
        moveElementDown: (state, action: PayloadAction<string>) => {
            const index = state.elements.findIndex((el) => el.id === action.payload);
            if (index > 0) {
                snapshot(state);
                [state.elements[index], state.elements[index - 1]] = [
                    state.elements[index - 1],
                    state.elements[index],
                ];
            }
        },
        toggleElementVisibility(state, action: PayloadAction<string>) {
            const element = state.elements.find((el) => el.id === action.payload);
            if (element) {
                element.visible = !(element.visible ?? true);
            }
        },
        setStageSize: (state, action: PayloadAction<{ width: number; height: number }>) => {
            state.stageWidth = action.payload.width;
            state.stageHeight = action.payload.height;
        },
        setAspectRatio: (state, action: PayloadAction<AspectRatio | undefined>) => {
            state.aspectRatio = action.payload;
        },
        setElements: (state, action: PayloadAction<CanvasElement[]>) => {
            snapshot(state);
            state.elements = action.payload;
        },
        clearCanvas: (state) => {
            snapshot(state);
            state.elements = [];
        },

        // handel element grouping
        groupSelectedElements: (state) => {
            const selected = state.elements.filter((el) => el.selected);

            if (selected.length <= 1) return;

            const groupId = `group-${Date.now()}`;

            // calc the group bounding box of the selected elements
            const minX = Math.min(...selected.map((el) => el.x));
            const minY = Math.min(...selected.map((el) => el.y));
            const maxX = Math.max(...selected.map((el) => el.x + el.width));
            const maxY = Math.max(...selected.map((el) => el.y + el.height));

            const groupElement: CanvasGroupElement = {
                id: groupId,
                type: "group",
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY,
                fill: "transparent",
                children: selected.map((el) => el.id),
            };

            // add the group element to the elements array and remove old selected elements
            state.elements = [...state.elements.filter((el) => !el.selected), groupElement];
        },

        // handel clear group and return old elements
        unGroupElement: (state, action: PayloadAction<string>) => {
            const group = state.elements.find(
                (el) => el.id === action.payload && el.type === "group"
            ) as CanvasGroupElement | undefined;

            if (!group) return;

            // get the old children of the group
            const children = group.children
                .map(
                    (id) => state.elements.find((el) => el.id === id) // لو محتفظين بنسخة قديمة أو بتجيبها من history
                )
                .filter(Boolean) as CanvasElementUnion[];

            state.elements = [...state.elements.filter((el) => el.id !== group.id), ...children];
        },
    },
});

export const {
    addElement,
    addImageElement,
    selectElement,
    toggleSelectElement,
    selectMultipleElements,
    updateElement,
    moveElementDown,
    moveElementUp,
    undo,
    redo,
    setStageSize,
    setAspectRatio,
    setElements,
    clearCanvas,
    deselectAllElements,
    toggleElementVisibility,
    deleteSelectedElements,
} = canvasSlice.actions;

export default canvasSlice.reducer;

// function snapshot(state: WritableDraft<CanvasState>) {
//     throw new Error("Function not implemented.");
// }
