import "./Checkout.css";
import useAuth from "../../../hooks/useAuth";
import { useGetAllUsersQuery } from "../../User/usersApiSlice";
import {
  useDeleteBasketMutation,
  useGetBasketItemsQuery,
} from "../../Basket/basketApiSlice";
import ListProducts from "../../../components/ListProducts/ListProducts";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import {
  useGetProductsQuery,
  useUpdateProductMutation,
} from "../../Product/productsApiSlice";
import { useCreatePaymentMutation } from "../../payment/paymentApiSlice";
import {
  useCreateNewOrderMutation,
  useCreateOrdersMutation,
  useGetOrdersQuery,
} from "../ordersApiSlice";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const stripe = useStripe();
  const elements = useElements();

  const { username } = useAuth();
  const navigate = useNavigate();

  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [postcode, setPostcode] = useState("");

  const { data: users, isSuccess: isUsersSuccess } = useGetAllUsersQuery();
  let findUser;
  if (isUsersSuccess) {
    findUser = Object.values(users?.entities).find(
      (user) => user?.username === username
    );
  }

  const { data: order, isSuccess: isGetOrderSuccess } = useGetOrdersQuery();
  const [createOrders] = useCreateOrdersMutation();
  const [createNewOrder] = useCreateNewOrderMutation();

  const [succeeded, setSucceeded] = useState(false);
  const [processing, setProcessing] = useState("");
  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(true);

  const { data: products, isSuccess: isProductsSuccess } = useGetProductsQuery(
    "productsList",
    {
      pollingInterval: 15000,
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    }
  );
  const [updateProduct] = useUpdateProductMutation();

  const { data: basketItems, isSuccess } = useGetBasketItemsQuery();

  let basketItem;
  if (isSuccess) {
    basketItem = Object.values(basketItems.entities).find((item) => {
      if (item?.user === findUser?._id && item.active === true)
        return item?._id;
      else return null;
    });
  }

  const [clientSecret, setClientSecret] = useState("");

  const [createPayment] = useCreatePaymentMutation();

  const handleCardChange = (e) => {
    setDisabled(e.empty);
    setError(e.error ? e.error.message : "");
  };

  let totalPrice = null;
  if (isProductsSuccess) {
    const { entities } = products;

    totalPrice = Object.values(entities)?.reduce((accumulator, product) => {
      const isProductInBasket = basketItem?.basketItems.some(
        (item) => item === product?.id
      );

      if (isProductInBasket) {
        return accumulator + Number(product?.price);
      } else {
        return accumulator;
      }
    }, 0);
  }

  useEffect(() => {
    const getClientSecret = async () => {
      const total = await (Number(totalPrice) * 100);
      const res = await createPayment({
        total,
      });

      setClientSecret(res?.data?.clientSecret);
    };

    getClientSecret();
  }, [totalPrice, createPayment]);

  const [deleteBasket] = useDeleteBasketMutation();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    let findUsersOrders = null;
    if (isGetOrderSuccess) {
      const { entities: orderEntities } = order;
      findUsersOrders = await Object.values(orderEntities).find(
        (each) => each?.user === findUser?.id
      );
    }

    await stripe
      .confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      })
      .then(async ({ paymentIntent }) => {
        if (findUsersOrders) {
          await createNewOrder({
            userId: findUser?.id,
            productIds: basketItem?.basketItems,
            total: totalPrice,
            deliveryAddress: `${(address1, address2, postcode)}`,
          });

          await basketItem?.basketItems.map(async (item) => {
            const findProductToUpdate = await Object.values(
              products.entities
            ).find((product) => product?.id === item);
            await updateProduct({
              id: findProductToUpdate?.id,
              user: findProductToUpdate?.user,
              name: findProductToUpdate?.name,
              size: findProductToUpdate?.size,
              price: findProductToUpdate?.price,
              image: findProductToUpdate?.image,
              description: findProductToUpdate?.description,
              sold: true,
            });
          });

          await deleteBasket({
            id: basketItem?._id,
          });
        } else {
          await createOrders({
            userId: findUser?.id,
            productIds: basketItem?.basketItems,
            total: totalPrice,
            deliveryAddress: `${(address1, address2, postcode)}`,
          });

          await basketItem?.basketItems.map(async (item) => {
            const findProductToUpdate = await Object.values(
              products.entities
            ).find((product) => product?.id === item);
            await updateProduct({
              id: findProductToUpdate?.id,
              user: findProductToUpdate?.user,
              name: findProductToUpdate?.name,
              size: findProductToUpdate?.size,
              price: findProductToUpdate?.price,
              image: findProductToUpdate?.image,
              description: findProductToUpdate?.description,
              sold: true,
            });
          });

          await deleteBasket({
            id: basketItem?._id,
          });
        }

        setSucceeded(true);
        setError(null);
        setProcessing(false);
        navigate("/orders");
      });
  };

  if (!username) return <p>You must Login first</p>;
  if (!basketItem?.basketItems?.length)
    return <p>You must first add items to basket</p>;

  return (
    <div className="checkout">
      <div className="checkout__products">
        <h1>Basket Items: </h1>
        {basketItem?.basketItems?.map((product) => (
          <ListProducts key={product} id={product} />
        ))}
      </div>
      <form className="checkout__form" onSubmit={handleFormSubmit}>
        <div className="checkout__formContainer">
          <div className="checkout__form--address">
            <input
              type="text"
              name="address1"
              id="address1"
              placeholder="Address Line 1"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              required
            />

            <input
              type="text"
              name="address2"
              id="address2"
              placeholder="Address Line 2"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
            />

            <input
              type="text"
              name="postcode"
              id="postcode"
              placeholder="Postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              required
            />
          </div>

          <div className="checkout__form--payment">
            <h1 className="checkout__form--payment__h1">
              Enter your payment details
            </h1>
            <CardElement onChange={handleCardChange} />
            <h3 className="checkout__form--payment__h3">
              Order Total: £{totalPrice}
            </h3>
          </div>
        </div>

        <button disabled={processing || disabled || succeeded}>
          {processing ? "Processing..." : "Complete Payment"}
        </button>

        {error && <div>{error}</div>}
      </form>
    </div>
  );
};
export default Checkout;
