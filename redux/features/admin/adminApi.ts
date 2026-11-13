import { apiSlice } from "../api/apiSlice";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query({
      query: () => ({
        url: "/admin/stats",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["AdminStats"] as any,
    }),
    getAdminUsers: builder.query({
      query: ({ search = "", page = 1, limit = 50 }: { search?: string; page?: number; limit?: number } = {}) => ({
        url: `/admin/users?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["AdminUsers"] as any,
    }),
    toggleUserStatus: builder.mutation({
      query: (id: string) => ({
        url: `/admin/users/${id}/status`,
        method: "PATCH",
        credentials: "include",
      }),
      invalidatesTags: ["AdminUsers", "AdminStats"] as any,
    }),
    getAdminSets: builder.query({
      query: ({ search = "", page = 1, limit = 50 }: { search?: string; page?: number; limit?: number } = {}) => ({
        url: `/admin/sets?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["AdminSets"] as any,
    }),
    deleteAdminSet: builder.mutation({
      query: (id: string) => ({
        url: `/admin/sets/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["AdminSets", "AdminStats"] as any,
    }),
    getAdminFolders: builder.query({
      query: () => ({
        url: "/admin/folders",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["AdminFolders"] as any,
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useToggleUserStatusMutation,
  useGetAdminSetsQuery,
  useDeleteAdminSetMutation,
  useGetAdminFoldersQuery,
} = adminApi;
