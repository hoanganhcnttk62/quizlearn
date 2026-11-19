import { apiSlice } from "../api/apiSlice";

export const foldersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createFolder: builder.mutation({
      query: (data) => ({
        url: `/folder/create-folder`,
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: ["Folder"],
    }),
    updateFolder: builder.mutation({
      query: ({ id, ...data }: { id: string; name?: string; description?: string; isPublic?: boolean }) => ({
        url: `/folder/update-folder/${id}`,
        method: "PUT",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: ["Folder", "FolderSets", "AllSets", "Set"],
    }),
    deleteFolder: builder.mutation({
      query: (id: string) => ({
        url: `/folder/delete-folder/${id}`,
        method: "DELETE",
        credentials: "include" as const,
      }),
      invalidatesTags: ["Folder"],
    }),
    getAllFolders: builder.query({
      query: () => ({
        url: "/folder/get-all-folders",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: ["Folder"],
    }),
    getFoldersByUserId: builder.query({
      query: () => ({
        url: `/folder/get-folders-by-userId`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: ["Folder"],
    }),
  }),
});

export const {
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useGetAllFoldersQuery,
  useGetFoldersByUserIdQuery,
} = foldersApi;
