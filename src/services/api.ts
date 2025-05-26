// services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://jsonplaceholder.typicode.com/",
  }),
  endpoints: (builder) => ({
    getLabel: builder.query<any[], void>({
      query: () => "posts",
    }),
    getTags: builder.query<any[], void>({
      query: () => "tags",
    }),
  }),
});

export const { useGetLabelQuery, useGetTagsQuery } = api;
