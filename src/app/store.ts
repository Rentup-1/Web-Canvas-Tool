import { configureStore } from "@reduxjs/toolkit";
import canvasReducer from "../features/canvas/canvasSlice";
import uiReducer from "../features/ui/uiSlice";
import brandingReducer from "../features/branding/brandingSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    canvas: canvasReducer,
    branding: brandingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
