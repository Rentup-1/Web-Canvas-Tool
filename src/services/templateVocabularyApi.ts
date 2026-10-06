// src/services/templateVocabularyApi.ts
import { api } from "./api";
import type { TemplateVocabularyResponse } from "@/types/templateDocumentV2";

const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTemplateVocabulary: builder.query<
      TemplateVocabularyResponse,
      { projectId: number }
    >({
      query: ({ projectId }) => `creatives/template-vocabulary/?project_id=${projectId}`,
      providesTags: (_result, _error, { projectId }) => [
        { type: "Vocabulary", id: projectId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTemplateVocabularyQuery,
  useLazyGetTemplateVocabularyQuery,
} = extendedApi;
