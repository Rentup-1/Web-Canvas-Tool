// src/services/templateApi.ts
import { api } from "./api";

// Data types matching the form schema
export type TemplateData = {
  id: number;
  name: string;
  group: string;
  type: string;
  category: string;
  tags: number[];
  aspect_ratio: "SQUARE" | "VERTICAL" | "HORIZONTAL";
  raw_input: string;
  is_public: boolean;
  default_primary: string;
  default_secondary_color: string;
  icon?: string;
  lang?: string;
  created_at?: string;
  updated_at?: string;
};

export type TemplatesResponse = TemplateData[];

export type TemplateCreateResponse = TemplateData;

// Inject endpoints for Templates
const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query<TemplatesResponse, string | void>({
      query: (lang) => {
        let url = "creatives/templates";
        if (lang) {
          url += `?lang=${lang}`;
        }
        return url;
      },
      providesTags: ["Templates"],
    }),
    getTemplate: builder.query<TemplateData, number>({
      query: (id) => `creatives/templates/${id}/`,
      providesTags: ["Template"],
    }),
    createTemplate: builder.mutation<TemplateCreateResponse, FormData>({
      query: (formData) => ({
        url: "creatives/templates/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Templates"],
    }),
    updateTemplate: builder.mutation<
      TemplateCreateResponse,
      { id: number; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: `creatives/templates/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Templates", "Template"],
    }),
    deleteTemplate: builder.mutation<void, number>({
      query: (id) => ({
        url: `creatives/templates/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Templates"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
} = extendedApi;
