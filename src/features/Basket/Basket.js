import "./Basket.css";
import Product from "../Product/Product";
import {
  useDeleteBasketMutation,
  useGetBasketItemsQuery,
} from "./basketApiSlice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGetProductsQuery } from "../Product/productsApiSlice";
import useAuth from "../../hooks/useAuth";
import { useGetAllUsersQuery } from "../User/usersApiSlice";

const BasketPage = () => {
  const { username } = useAuth();

  const navigate = useNavigate();

  const {
    data: basketItems,
    refetch,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetBasketItemsQuery("basketItems", {
    pollingInterval: 15000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const { data: productItems, isSuccess: isProductsSuccess } =
    useGetProductsQuery();

  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    refetch();

    setInitialized(false);
  }, [initialized, refetch]);

  const [deleteBasket] = useDeleteBasketMutation();

  const { data: users, isSuccess: isUsersSuccess } = useGetAllUsersQuery();

  const handleBuyButton = () => {
    if (username) navigate("/checkout");
    else navigate("/signin");
  };

  if (isLoading) return <p>Loading...</p>;

  if (isError) return <p>{error?.data?.message}</p>;

  if (isSuccess && isProductsSuccess) {
    const { entities } = basketItems;

    let findUser;
    if (isUsersSuccess) {
      findUser = Object.values(users?.entities).find(
        (user) => user.username === username
      );
    }

    // get current users basket items and get their active basket
    let basketItem = Object.values(entities).find((item) => {
      if (item.user === findUser?._id && item.active === true) return item._id;
      else return null;
    });

    const { entities: productEntities } = productItems;

    let product = Object.values(productEntities);

    const productDetails = basketItem?.basketItems?.map((eachBasketItem) =>
      product.find((eachProduct) => eachProduct._id === eachBasketItem)
    );

    const emptyBasket = async () => {
      await deleteBasket({
        id: basketItem._id,
      });
      setInitialized(true);
    };

    let total;
    if (productDetails) {
      total = productDetails.reduce((total, each) => {
        let convertPriceToInt = Number(each?.price);
        return total + convertPriceToInt;
      }, 0);
    }

    return (
      <div className="basket">
        <div className="basket__containerOne">
          <h1 className="basket__containerOne--title">Your Shopping Basket</h1>
          <p
            className="basket__containerOne--p"
            onClick={() => {
              if (productDetails && productDetails.length) {
                emptyBasket();
              }
            }}
          >
            Clear Basket
          </p>
          <div className="basket__product">
            {productDetails &&
              productDetails.map((product) => (
                <Product
                  key={product?._id}
                  id={product?._id}
                  isBasketPage={true}
                />
              ))}
          </div>
        </div>
        <div className="basket__containerTwo">
          <h1 className="basket__containerTwo--title">Order Summary</h1>
          <div className="basket__containerTwo--totalInfo">
            <p className="basket__containerTwo--total">Order Total</p>
            <p className="basket__containerTwo--totalPrice">
              £{productDetails ? total : "0"}
            </p>
          </div>
          <button
            className="basket__containerTwo--buyBtn"
            onClick={handleBuyButton}
          >
            Buy Now
          </button>
        </div>
      </div>
    );
  }
};

export default BasketPage;
