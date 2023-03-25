import { apiSlice } from "../../app/api/apiSlice";

export const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPayment: builder.mutation({
      query: ({ total }) => ({
        url: "/payments",
        method: "POST",
        body: {
          total,
        },
      }),
    }),
  }),
});

export const { useCreatePaymentMutation } = paymentApiSlice;
