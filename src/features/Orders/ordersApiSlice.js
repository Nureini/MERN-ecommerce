import { createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const ordersAdapter = createEntityAdapter();

const initialState = ordersAdapter.getInitialState();

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: () => "/orders",
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError;
      },
      transformResponse: (responseData) => {
        const loadedOrders = responseData.map((order) => {
          order.id = order._id;
          return order;
        });
        return ordersAdapter.setAll(initialState, loadedOrders);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "Orders", id: "LIST" },
            ...result.ids.map((id) => ({ type: "Orders", id })),
          ];
        } else return [{ type: "Orders", id: "LIST" }];
      },
    }),
    createOrders: builder.mutation({
      query: (orderDetails) => ({
        url: "/orders",
        method: "POST",
        body: {
          ...orderDetails,
        },
      }),
      invalidatesTags: (result, error, arg) => [
        {
          type: "Orders",
          id: arg.id,
        },
      ],
    }),
    createNewOrder: builder.mutation({
      query: (orderDetails) => ({
        url: "/orders",
        method: "PATCH",
        body: {
          ...orderDetails,
        },
      }),
      invalidatesTags: (result, error, arg) => [
        {
          type: "Orders",
          id: arg.id,
        },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useCreateOrdersMutation,
  useCreateNewOrderMutation,
} = ordersApiSlice;
