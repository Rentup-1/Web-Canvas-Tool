// src/services/templateApi.ts
import { api } from "./api";
import type {
  TemplateDocumentV2,
  TemplateRevisionItem,
  TemplateStageV2,
} from "@/types/templateDocumentV2";

export type Visibility = "public" | "internal" | "private";

// Data types matching the API schema
export type TemplateData = {
  id: number;
  name: string;
  group?: string;
  type: "default" | "customized" | "branded" | string;
  category: string | null;
  tags: number[] | string[];
  projects?: number[];
  aspect_ratio: "SQUARE" | "VERTICAL" | "HORIZONTAL";
  raw_input?: string;
  document?: TemplateDocumentV2;
  stage?: TemplateStageV2 | null;
  slots?: {
    frames: Array<{ index: number; assetType: string; tags: string[] }>;
    text: Array<{ source: string; key: string | null }>;
  } | null;
  visibility: Visibility | null;
  organization?: number | null;
  user?: number | string | null;
  document_revision?: number;
  default_primary?: string | null;
  default_secondary_color?: string | null;
  icon?: string;
  lang?: string;
  created_at?: string;
  updated_at?: string;
};

export type TemplatesResponse = TemplateData[];
export type TemplateCreateResponse = TemplateData;

export interface DocumentResponseWithEtag {
  document: TemplateDocumentV2;
  etag: string;
}

// Inject endpoints for Templates
const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query<
      TemplatesResponse,
      { lang?: string; userId?: number | string; includeDocument?: boolean } | string | void
    >({
      query: (arg) => {
        let url = "creatives/templates/";
        const params = new URLSearchParams();

        if (typeof arg === "string") {
          if (arg) params.append("lang", arg);
        } else if (arg) {
          if (arg.lang) params.append("lang", arg.lang);
          if (arg.userId) params.append("user_id", String(arg.userId));
          if (arg.includeDocument) params.append("include", "document");
        }

        const queryString = params.toString();
        return queryString ? `${url}?${queryString}` : url;
      },
      providesTags: ["Templates"],
    }),

    getTemplatesByUser: builder.query<
      TemplatesResponse,
      { userId: number; lang?: string }
    >({
      query: ({ userId, lang }) => {
        let url = `creatives/templates/?user_id=${userId}`;
        if (lang) {
          url += `&lang=${lang}`;
        }
        return url;
      },
      providesTags: ["Templates"],
    }),

    getTemplate: builder.query<TemplateData, number>({
      query: (id) => `creatives/templates/${id}/`,
      providesTags: (_result, _error, id) => [{ type: "Template", id }],
    }),

    getTemplateDocument: builder.query<DocumentResponseWithEtag, number>({
      query: (id) => ({
        url: `creatives/templates/${id}/document/`,
        method: "GET",
      }),
      transformResponse: (response: TemplateDocumentV2, meta) => ({
        document: response,
        etag: meta?.response?.headers.get("etag") || "",
      }),
      providesTags: (_result, _error, id) => [{ type: "Template", id }],
    }),

    createTemplate: builder.mutation<TemplateCreateResponse, FormData>({
      query: (formData) => ({
        url: "creatives/templates/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Templates"],
    }),

    patchTemplateMetadata: builder.mutation<
      TemplateData,
      { id: number; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: `creatives/templates/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Templates",
        { type: "Template", id },
      ],
    }),

    // Legacy update kept for backward compatibility if needed
    updateTemplate: builder.mutation<
      TemplateCreateResponse,
      { id: number; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: `creatives/templates/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Templates",
        { type: "Template", id },
      ],
    }),

    updateTemplateDocument: builder.mutation<
      DocumentResponseWithEtag,
      { id: number; document: TemplateDocumentV2; etag: string }
    >({
      query: ({ id, document, etag }) => ({
        url: `creatives/templates/${id}/document/`,
        method: "PUT",
        headers: {
          "If-Match": etag,
          "Content-Type": "application/json",
        },
        body: document,
      }),
      transformResponse: (response: TemplateDocumentV2, meta) => ({
        document: response,
        etag: meta?.response?.headers.get("etag") || "",
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Templates",
        { type: "Template", id },
        { type: "TemplateRevisions", id },
      ],
    }),

    getTemplateRevisions: builder.query<TemplateRevisionItem[], number>({
      query: (id) => `creatives/templates/${id}/revisions/`,
      providesTags: (_result, _error, id) => [{ type: "TemplateRevisions", id }],
    }),

    getTemplateRevisionDetail: builder.query<
      TemplateRevisionItem,
      { id: number; revision: number }
    >({
      query: ({ id, revision }) => `creatives/templates/${id}/revisions/${revision}/`,
    }),

    restoreTemplateRevision: builder.mutation<
      DocumentResponseWithEtag,
      { id: number; revision: number; etag: string }
    >({
      query: ({ id, revision, etag }) => ({
        url: `creatives/templates/${id}/revisions/${revision}/restore/`,
        method: "POST",
        headers: {
          "If-Match": etag,
        },
      }),
      transformResponse: (response: TemplateDocumentV2, meta) => ({
        document: response,
        etag: meta?.response?.headers.get("etag") || "",
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Templates",
        { type: "Template", id },
        { type: "TemplateRevisions", id },
      ],
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
  useGetTemplatesByUserQuery,
  useGetTemplateQuery,
  useGetTemplateDocumentQuery,
  useLazyGetTemplateDocumentQuery,
  useCreateTemplateMutation,
  usePatchTemplateMetadataMutation,
  useUpdateTemplateMutation,
  useUpdateTemplateDocumentMutation,
  useGetTemplateRevisionsQuery,
  useGetTemplateRevisionDetailQuery,
  useRestoreTemplateRevisionMutation,
  useDeleteTemplateMutation,
} = extendedApi;
