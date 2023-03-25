import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const basketAdapter = createEntityAdapter();

const initialState = basketAdapter.getInitialState();

export const basketApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBasketItems: builder.query({
      query: () => "/basket",
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError;
      },
      transformResponse: (responseData) => {
        const loadedBasketItems = responseData.map((item) => {
          item.id = item._id;
          return item;
        });
        return basketAdapter.setAll(initialState, loadedBasketItems);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "Basket", id: "LIST" },
            // ...result.ids.map((id) => ({ type: "Users", id })),

            ...result.ids.map((id) => ({ type: "Basket", id })),
          ];
        } else return [{ type: "Basket", id: "LIST" }];
      },
    }),
    createNewBasket: builder.mutation({
      query: (basketItem) => ({
        url: "/basket",
        method: "POST",
        body: {
          ...basketItem,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Basket", id: arg.id }],
    }),
    addNewBasketItem: builder.mutation({
      query: (basketItem) => ({
        url: "/basket/add",
        method: "PATCH",
        body: {
          ...basketItem,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Basket", id: arg.id }],
    }),
    removeBasketItem: builder.mutation({
      query: (basketItem) => ({
        url: "/basket/remove",
        method: "PATCH",
        body: {
          ...basketItem,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Basket", id: arg.id }],
    }),
    deleteBasket: builder.mutation({
      query: ({ id }) => ({
        url: "/basket",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (resut, error, arg) => [{ type: "Basket", id: arg.id }],
    }),
  }),
});

export const {
  useGetBasketItemsQuery,
  useCreateNewBasketMutation,
  useAddNewBasketItemMutation,
  useRemoveBasketItemMutation,
  useDeleteBasketMutation,
} = basketApiSlice;

// return query result object
export const selectBasketResult =
  basketApiSlice.endpoints.getBasketItems.select();

// creates memoized selector
export const selectBasketData = createSelector(
  selectBasketResult,
  (basketResult) => basketResult.data // normalized state object with ids & entities
);

// getSelectors creates these selectors and we rename them with aliases using descructuring
export const {
  selectAll: selectAllBaskets,
  selectById: selectBasketById,
  selectIds: selectBasketIds,
} = basketAdapter.getSelectors(
  (state) => selectBasketData(state) ?? initialState
);
