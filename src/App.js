import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage/HomePage";
import ProductPage from "./features/Product/ProductPage/ProductPage";
import Prefetch from "./Prefetch";
import Signin from "./features/User/Signin";
import BasketPage from "./features/Basket/Basket";
import PersistLogin from "./features/User/PersistLogin";
import Profile from "./features/User/Profile/Profile";
import CreateProduct from "./features/Product/CreateProduct/CreateProduct";
import UpdateProduct from "./features/Product/UpdateProduct/UpdateProduct";
import Orders from "./features/Orders/Orders";
import Checkout from "./features/Orders/Checkout/Checkout";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  "pk_test_51MQctXExqzIUeq5dJdvZXA81SBL03Lhu4OSNRnH0uZGqxpnqkpKZmfKxSOH4fipDrb2Cyc51h4Rux5rgiVgU5RT700RrOquPb0"
);

function App() {
  return (
    <Routes>
      <Route element={<PersistLogin />}>
        <Route element={<Prefetch />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="product/:productId" element={<ProductPage />} />
            <Route path="basket" element={<BasketPage />} />
            <Route path="signin" element={<Signin />} />

            <Route
              path="checkout"
              element={
                <>
                  <Elements stripe={stripePromise}>
                    <Checkout />
                  </Elements>
                </>
              }
            />

            <Route path="profile/:userId" element={<Profile />} />
            <Route
              path="/profile/:userId/create-product"
              element={<CreateProduct />}
            />
            <Route
              path="/profile/:userId/update-product/:productId"
              element={<UpdateProduct />}
            />
            <Route path="orders" element={<Orders />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
