import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";
import { CanvasElement } from "./types";

/**
 * Get all canvas elements
 */
export const selectElements: (state: RootState) => CanvasElement[] = (state) =>
  state.canvas.elements;

/**
 * Get only selected elements
 */
export const selectSelectedElements: (state: RootState) => CanvasElement[] =
  createSelector([selectElements], (elements) =>
    elements.filter((el) => el.selected)
  );

/**
 * Get currently selected group (if any)
 */
export const selectSelectedGroup: (state: RootState) => CanvasElement | null =
  createSelector([selectSelectedElements], (selected) => {
    const group = selected.find((el) => el.type === "group");
    return group || null;
  });
