// src/services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const BASE_API_URL = "https://api.markomlabs.com";
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      // add accessToken to apis
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("Authorization", `Token ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Tags",
    "FrameTypes",
    "TextLables",
    "FramePostion",
    "Templates",
    "Template",
    "TemplateFrames",
    "FrameTags",
    "TemplateTextBoxes",
    "Assets",
    "Projects",
  ],
  endpoints: () => ({}),
});
