import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type CanvasElement, type ElementType } from "./types";
import { nanoid } from "nanoid";

interface CanvasState {
  elements: CanvasElement[];
}

const initialState: CanvasState = {
  elements: [],
};

const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    addElement: (state, action: PayloadAction<{ type: ElementType }>) => {
      const base = {
        id: nanoid(),
        x: 100,
        y: 100,
        width: 150,
        height: 100,
        rotation: 0,
        selected: false,
      };

      let newElement: CanvasElement;

      switch (action.payload.type) {
        case "rect":
          newElement = {
            ...base,
            type: "rect",
            fill: "#00A8E8",
          };
          break;
        case "text":
          newElement = {
            ...base,
            type: "text",
            text: "Edit me",
            fontSize: 24,
            fill: "#333",
          };
          break;
        default:
          throw new Error(`Unsupported element type: ${action.payload.type}`);
      }

      state.elements.push(newElement);
    },
    addImageElement: (state, action: PayloadAction<{ src: string; width: number; height: number }>) => {
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
      });
    },
    selectElement: (state, action: PayloadAction<string>) => {
      state.elements.forEach((el) => {
        el.selected = el.id === action.payload;
      });
    },
    updateElement: (state, action: PayloadAction<{ id: string; updates: Partial<CanvasElement> }>) => {
      const element = state.elements.find((el) => el.id === action.payload.id);
      if (element) {
        Object.assign(element, action.payload.updates);
      }
    },

    moveElementUp: (state, action) => {
      const index = state.elements.findIndex((el) => el.id === action.payload);
      if (index < state.elements.length - 1) {
        const temp = state.elements[index];
        state.elements[index] = state.elements[index + 1];
        state.elements[index + 1] = temp;
      }
    },
    moveElementDown: (state, action) => {
      const index = state.elements.findIndex((el) => el.id === action.payload);
      if (index > 0) {
        const temp = state.elements[index];
        state.elements[index] = state.elements[index - 1];
        state.elements[index - 1] = temp;
      }
    },
  },
});

export const { addElement, addImageElement, selectElement, updateElement, moveElementDown, moveElementUp } =
  canvasSlice.actions;
export default canvasSlice.reducer;
