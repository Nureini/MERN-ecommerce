import "./Product.css";
import { useNavigate } from "react-router-dom";
import { useCreateNewBasketMutation } from "../Basket/basketApiSlice";
import {
  useGetBasketItemsQuery,
  useAddNewBasketItemMutation,
  useRemoveBasketItemMutation,
  useDeleteBasketMutation,
} from "../Basket/basketApiSlice";
import { useGetProductsQuery } from "./productsApiSlice";
import { useEffect, useState, memo } from "react";
import { useGetAllUsersQuery } from "../User/usersApiSlice";
import useAuth from "../../hooks/useAuth";

const Product = ({ id, isBasketPage, isOrdersPage, isProfilePage }) => {
  const { product } = useGetProductsQuery("productsList", {
    selectFromResult: ({ data }) => ({
      product: data?.entities[id],
    }),
  });

  const { username } = useAuth();
  const { data: basketItems, isSuccess, refetch } = useGetBasketItemsQuery();

  // used to rerender basketPage when products are add or removed from basket.
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    refetch();

    setInitialized(false);
  }, [initialized, refetch]);

  const { data: users, isSuccess: isUsersSuccess } = useGetAllUsersQuery();

  let findUser;
  if (isUsersSuccess) {
    findUser = Object.values(users?.entities).find(
      (user) => user?.username === username
    );
  }

  let basketItem;
  if (isSuccess) {
    basketItem = Object.values(basketItems.entities).find((item) => {
      if (item?.user === findUser?._id && item.active === true)
        return item?._id;
      else return null;
    });
  }

  const [createNewBasket] = useCreateNewBasketMutation();
  const [addNewBasketItem] = useAddNewBasketItemMutation();
  const [removeBasketItem] = useRemoveBasketItemMutation();
  const [deleteBasket] = useDeleteBasketMutation();

  const navigate = useNavigate();

  const viewProduct = () => {
    navigate(`/product/${id}`);
  };

  const addToBasket = async () => {
    if (!username) alert("Must Sign In First!");
    else {
      if (product?.sold) {
        console.log("product is no longer in stock!");
      } else if (product?.user === findUser?._id) {
        alert("You cannot purchase your own product");
      } else {
        if (!basketItem) {
          await createNewBasket({
            productToAddId: id,
            user: findUser?._id,
          });
        } else {
          // checks if product trying to be added to basket is already added, don't allow same product to be added twice
          const duplicate = basketItem.basketItems.find(
            (item) => item?.productToAddId === id
          );

          if (!duplicate) {
            await addNewBasketItem({
              id: basketItem?._id,
              productToAddId: id,
              user: findUser?._id,
            });
          } else {
            alert("Item already in basket");
          }
        }
        setInitialized(true);
      }
    }
  };

  const removeFromBasket = async () => {
    if (basketItem?.basketItems?.length === 1) {
      await deleteBasket({
        id: basketItem?._id,
      });
    } else {
      await removeBasketItem({
        id: basketItem?._id,
        productToAddid: id,
      });
    }
    setInitialized(true);
  };

  if (product && !product?.sold && !isProfilePage && !isOrdersPage) {
    return (
      <div className="product">
        {isBasketPage ? (
          product?.name?.length >= 16 ? (
            <h1 className="product__name">{`${product?.name
              .substring(0, 14)
              .trim()}...`}</h1>
          ) : (
            <h1 className="product__name">{product?.name}</h1>
          )
        ) : product?.name?.length >= 33 ? (
          <h1 className="product__name">{`${product?.name
            .substring(0, 31)
            .trim()}...`}</h1>
        ) : (
          <h1 className="product__name">{product?.name}</h1>
        )}
        <div className="product__container--sizeAndPrice">
          <h3 className="product__size">UK {product?.size}</h3>
          <p className="product__price">£{product?.price}</p>
        </div>
        <img
          src={product?.image}
          alt={product?.name}
          className={
            isBasketPage ? "product__image--basketPage" : "product__image"
          }
        />
        {!isOrdersPage && !isBasketPage ? (
          <div className="product__buttonContainer">
            <button className="button" onClick={viewProduct}>
              View Product
            </button>
            {basketItem?.basketItems?.find(
              (isItemInBasket) => isItemInBasket === id
            ) ? (
              <button className="button" onClick={removeFromBasket}>
                Remove from Basket
              </button>
            ) : (
              <button className="button" onClick={addToBasket}>
                Add to Basket
              </button>
            )}
          </div>
        ) : (
          isBasketPage && (
            <button className="button--remove" onClick={removeFromBasket}>
              Remove from basket
            </button>
          )
        )}
      </div>
    );
  } else if (isOrdersPage) {
    return (
      <div className="product--order">
        {product?.name?.length >= 27 ? (
          <h1 className="product__name">{`${product?.name
            .substring(0, 26)
            .trim()}...`}</h1>
        ) : (
          <h1 className="product__name">{`${product?.name}`}</h1>
        )}
        <div className="product__container--sizeAndPrice">
          <h3 className="product__size">UK {product?.size}</h3>
          <p className="product__price">£{product?.price}</p>
        </div>
        <img
          src={product?.image}
          alt={product?.name}
          className={
            isBasketPage ? "product__image--basketPage" : "product__image"
          }
        />
      </div>
    );
  } else if (isProfilePage) {
    return (
      <div className="product">
        {product?.name?.length >= 27 ? (
          <h1 className="product__name">{`${product?.name
            .substring(0, 26)
            .trim()}...`}</h1>
        ) : (
          <h1 className="product__name">{`${product?.name}`}</h1>
        )}
        <div className="product__container--sizeAndPrice">
          <h3 className="product__size">UK {product?.size}</h3>
          <p className="product__price">£{product?.price}</p>
        </div>
        <img
          src={product?.image}
          alt={product?.name}
          className={
            isBasketPage ? "product__image--basketPage" : "product__image"
          }
        />

        <div className="product__buttonContainer">
          <button className="button" onClick={viewProduct}>
            View Product
          </button>

          <button className="button" disabled={product?.sold}>
            {product?.sold ? "SOLD!" : "SELLING"}
          </button>
        </div>
      </div>
    );
  } else return null;
};

const memoizedProduct = memo(Product);
export default memoizedProduct;
