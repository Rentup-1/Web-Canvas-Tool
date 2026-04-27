// src/services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

// Get API base URL from localStorage (set by parent app) or fallback to production
const normalizeBaseUrl = (value: string): string => {
  const cleaned = value.trim().replace(/^['\"]+|['\"]+$/g, "");
  if (!cleaned) {
    return "https://api.markomlabs.com/";
  }

  return cleaned.endsWith("/") ? cleaned : `${cleaned}/`;
};

const getBaseUrl = () => {
  const fromStorage =
    localStorage.getItem("apiBaseUrl") || "https://api.markomlabs.com/";
  return normalizeBaseUrl(fromStorage);
};

export const BASE_API_URL = getBaseUrl();

const baseQuery = fetchBaseQuery({
  baseUrl: "/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("Authorization", `Token ${token}`);
    }
    return headers;
  },
});

const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = (args, api, extraOptions) => {
  const latestBaseUrl = getBaseUrl().replace(/\/$/, "");

  if (!latestBaseUrl) {
    return baseQuery(args, api, extraOptions);
  }

  const withBaseUrl = (url: string) => {
    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    const normalizedPath = url.startsWith("/") ? url : `/${url}`;
    return `${latestBaseUrl}${normalizedPath}`;
  };

  const nextArgs: string | FetchArgs =
    typeof args === "string"
      ? withBaseUrl(args)
      : {
          ...args,
          url: withBaseUrl(args.url),
        };

  return baseQuery(nextArgs, api, extraOptions);
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: dynamicBaseQuery,
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
