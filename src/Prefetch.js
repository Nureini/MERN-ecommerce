import { store } from "./app/store";
import { productsApiSlice } from "./features/Product/productsApiSlice";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { basketApiSlice } from "./features/Basket/basketApiSlice";
import { usersApiSlice } from "./features/User/usersApiSlice";
import { ordersApiSlice } from "./features/Orders/ordersApiSlice";

const Prefetch = () => {
  useEffect(() => {
    store.dispatch(
      productsApiSlice.util.prefetch("getProducts", "productsList", {
        force: true,
      })
    );

    store.dispatch(
      usersApiSlice.util.prefetch("getAllUsers", "usersList", {
        force: true,
      })
    );

    store.dispatch(
      basketApiSlice.util.prefetch("getBasketItems", "basketItems", {
        force: true,
      })
    );

    store.dispatch(
      ordersApiSlice.util.prefetch("getOrders", "orderItems", {
        force: true,
      })
    );
  });
  return <Outlet />;
};
export default Prefetch;
