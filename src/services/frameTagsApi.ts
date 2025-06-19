import { api } from "./api";

// أنواع البيانات
export type TagsData = {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    id: number;
    tag: string;
  }[];
};

export type TagResponse = {
  id: number;
  tag: string;
};

export type AllTagsData = {
  id: number;
  tag: string;
}[];

// حقن endpoints خاصة بـ Tags
const extendedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // الـ endpoint الأصلي للصفحة الواحدة
    getFrameTags: builder.query<TagsData, { page?: number }>({
      query: ({ page = 1 } = {}) => `creatives/tags/?page=${page}`,
      providesTags: ["FrameTags"],
    }),

    // endpoint جديد لجلب كل الـ tags من كل الصفحات
    getAllFrameTags: builder.query<AllTagsData, void>({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        let allTags: AllTagsData = [];
        let nextUrl: string | null = "creatives/tags/";

        try {
          while (nextUrl) {
            const result = await baseQuery(nextUrl);

            if (result.error) {
              return { error: result.error };
            }

            const data = result.data as TagsData;
            allTags = [...allTags, ...data.results];

            // استخراج الـ URL التالي
            nextUrl = data.next;
            if (nextUrl) {
              // تحويل الـ URL الكامل إلى path نسبي
              const url = new URL(nextUrl);
              nextUrl = url.pathname + url.search;
            }
          }

          return { data: allTags };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: ["FrameTags"],
    }),

    // endpoint للبحث في الـ tags
    searchFrameTags: builder.query<TagsData, { search: string; page?: number }>(
      {
        query: ({ search, page = 1 }) =>
          `creatives/tags/?search=${search}&page=${page}`,
        providesTags: ["FrameTags"],
      }
    ),

    postFrameTag: builder.mutation<TagResponse, { tag: string }>({
      query: (newTag) => ({
        url: "creatives/tags/",
        method: "POST",
        body: { tag: newTag.tag },
      }),
      invalidatesTags: ["FrameTags"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFrameTagsQuery,
  useGetAllFrameTagsQuery,
  useSearchFrameTagsQuery,
  usePostFrameTagMutation,
} = extendedApi;
