import { createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const productsAdapter = createEntityAdapter();

const initialState = productsAdapter.getInitialState();

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => "/products",
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError;
      },
      transformResponse: (responseData) => {
        const loadedProducts = responseData.map((product) => {
          product.id = product._id;
          return product;
        });
        return productsAdapter.setAll(initialState, loadedProducts);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "Products", id: "LIST" },
            ...result.ids.map((id) => ({ type: "Products", id })),
          ];
        } else return [{ type: "Products", id: "LIST" }];
      },
    }),
    createNewProduct: builder.mutation({
      query: (productInfo) => ({
        url: "/products",
        method: "POST",
        body: {
          ...productInfo,
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Products", id: arg.id },
      ],
    }),
    updateProduct: builder.mutation({
      query: (productInfo) => ({
        url: "/products",
        method: "PATCH",
        body: {
          ...productInfo,
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Products", id: arg.id },
      ],
    }),
    deleteProduct: builder.mutation({
      query: ({ id }) => ({
        url: "/products",
        method: "DELETE",
        body: {
          id,
        },
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateNewProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApiSlice;
