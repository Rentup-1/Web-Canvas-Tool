import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type TagsData = {
  count: number;
  next: null;
  previous: null;
  results: {
    id: number;
    tag: string;
  }[];
};

type TagResponse = {
  id: number;
  tag: string;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://djangoapi.markomlabs.com/",
    prepareHeaders: (headers) => {
      // Add CSRF token from cookie or state (adjust as needed)
      const csrfToken =
        "h48eODX6yD9j6r1XOeRNbkAvLAWP0hj64Nj94XhDzjvixv4pT8x4lg2wbWGWU6ni"; // Replace with dynamic retrieval
      if (csrfToken) {
        headers.set("X-CSRFTOKEN", csrfToken);
      }
      headers.set("Accept", "*/*");
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Tags"],
  endpoints: (builder) => ({
    getFrameTags: builder.query<TagsData, void>({
      query: () => "creatives/tags",
      providesTags: ["Tags"],
    }),
    postFrameTag: builder.mutation<TagResponse, { tag: string }>({
      query: (newTag) => ({
        url: "creatives/tags/",
        method: "POST",
        body: { tag: newTag.tag },
      }),
      invalidatesTags: ["Tags"],
    }),
  }),
});

export const { useGetFrameTagsQuery, usePostFrameTagMutation } = api;
