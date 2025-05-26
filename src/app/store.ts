import { configureStore } from "@reduxjs/toolkit";
import canvasReducer from "../features/canvas/canvasSlice";
import uiReducer from "../features/ui/uiSlice";
import brandingReducer from "../features/branding/brandingSlice";
import { api } from "../services/api";
export const store = configureStore({
  reducer: {
    ui: uiReducer,
    canvas: canvasReducer,
    branding: brandingReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
