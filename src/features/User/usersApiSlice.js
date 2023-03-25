import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const usersAdapter = createEntityAdapter();

const initialState = usersAdapter.getInitialState();

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => "/user",
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError;
      },
      transformResponse: (responseData) => {
        const loadedUsers = responseData.map((user) => {
          user.id = user._id;
          return user;
        });
        return usersAdapter.setAll(initialState, loadedUsers);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "Users", id: "LIST" },
            ...result.ids.map((id) => ({ type: "Users", id })),
          ];
        } else return [{ type: "Users", id: "LIST" }];
      },
    }),
    createNewUser: builder.mutation({
      query: (userInfo) => ({
        url: "/user",
        method: "POST",
        body: {
          ...userInfo,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Users", id: arg.id }],
    }),
    updateUser: builder.mutation({
      query: (userInfo) => ({
        url: "/user",
        method: "PATCH",
        body: {
          ...userInfo,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Users", id: arg.id }],
    }),
    deleteUser: builder.mutation({
      query: ({ id }) => ({
        url: "/user",
        method: "DELETE",
        body: {
          id,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Users", id: arg.id }],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useCreateNewUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApiSlice;

// return query result object
export const selectUsersResult = usersApiSlice.endpoints.getAllUsers.select();

// creates memoized selector
export const selectUserData = createSelector(
  selectUsersResult,
  (userResult) => userResult.data // normalized state object with ids & entities
);

// getSelectors creates these selectors and we rename them with aliases using descructuring
export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds,
} = usersAdapter.getSelectors((state) => selectUserData(state) ?? initialState);
