import "./ProductPage.css";
import {
  useDeleteProductMutation,
  useGetProductsQuery,
} from "../productsApiSlice";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddNewBasketItemMutation,
  useCreateNewBasketMutation,
  useDeleteBasketMutation,
  useGetBasketItemsQuery,
  useRemoveBasketItemMutation,
} from "../../Basket/basketApiSlice";
import useAuth from "../../../hooks/useAuth";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import { useGetAllUsersQuery } from "../../User/usersApiSlice";
import { useEffect, useState } from "react";

const ProductPage = () => {
  const navigate = useNavigate();
  const { username } = useAuth();
  const { productId } = useParams();

  const { product } = useGetProductsQuery("productsList", {
    selectFromResult: ({ data }) => ({
      product: data?.entities[productId],
    }),
  });

  const { data: basketItems, isSuccess } = useGetBasketItemsQuery();
  const { data: users, isSuccess: isUsersSuccess } = useGetAllUsersQuery();
  const [deleteProduct] = useDeleteProductMutation();

  const [user, setUser] = useState(null);
  const [ifAuthUsersProduct, setIfAuthUsersProduct] = useState(false);

  useEffect(() => {
    const findUser =
      isUsersSuccess &&
      Object.values(users?.entities).find(
        (user) => user?.username === username
      );

    setUser(findUser);

    const findIfAuthUsersProduct =
      isUsersSuccess && product?.username === username;

    setIfAuthUsersProduct(findIfAuthUsersProduct);
  }, [
    isUsersSuccess,
    product?.user,
    product?.username,
    username,
    users?.entities,
  ]);

  let basketItem;
  if (isSuccess) {
    basketItem = Object.values(basketItems.entities).find((item) => {
      if (item?.user === user?._id && item?.active === true) return item?._id;
      else return null;
    });
  }

  const [createNewBasket] = useCreateNewBasketMutation();
  const [addNewBasketItem] = useAddNewBasketItemMutation();

  const addToBasket = async () => {
    if (!username) alert("must login first");
    else if (ifAuthUsersProduct) {
      alert("You cannot purchase your own product");
    } else if (!basketItem) {
      await createNewBasket({
        productToAddId: productId,
        user: user?._id,
      });
    } else {
      await addNewBasketItem({
        id: basketItem?._id,
        productToAddId: productId,
        user: user?._id,
      });
    }
  };

  const [removeBasketItem] = useRemoveBasketItemMutation();
  const [deleteBasket] = useDeleteBasketMutation();

  const removeFromBasket = async () => {
    if (!username) alert("must login first");
    else if (product?.user === user?._id) {
      alert("You cannot purchase your own product");
    } else if (basketItem?.basketItems?.length === 1) {
      await deleteBasket({
        id: basketItem?._id,
      });
    } else {
      await removeBasketItem({
        id: basketItem._id,
        productToAddId: productId,
      });
    }
  };

  const handleEditListing = async () => {
    navigate(`/profile/${product?.user}/update-product/${productId}`);
  };

  const handleDeleteListing = async () => {
    await deleteProduct({ productId });
  };

  if (!product) return;

  return (
    <div className="productPage">
      <img
        className="productPage__image"
        src={product?.image}
        alt={product?.name}
      />
      <div>
        <div className="productPage__sellerInfo">
          <p className="productPage__seller">
            Seller: {user && user?.username}
          </p>
          {ifAuthUsersProduct === true && !product.sold && (
            <div className="productPage__seller--edits">
              <div className="edit--listing" onClick={handleEditListing}>
                <EditIcon className="editIcon" fontSize="medium" />
                Edit Listing
              </div>
              <div className="delete--listing" onClick={handleDeleteListing}>
                <DeleteForeverIcon
                  className="deleteForeverIcon"
                  fontSize="medium"
                />
                Delete Listing
              </div>
            </div>
          )}
        </div>
        <div className="productPage__infoContainer">
          <div className="productPage__nameContainer">
            <h1 className="productPage__name">{product.name}</h1>
          </div>
          <div className="productPage__container--sizeAndPrice">
            <h3 className="productPage__size">UK {product.size}</h3>

            <p className="productPage__price">£{product.price}</p>
          </div>
          <p className="productPage__description">{product.description}</p>
          {!product?.sold ? (
            basketItem?.basketItems?.find(
              (isItemInBasket) => isItemInBasket === productId
            ) ? (
              <button
                className="productPage__basketButton"
                onClick={removeFromBasket}
              >
                Remove from Basket
              </button>
            ) : (
              <button
                className="productPage__basketButton"
                onClick={addToBasket}
              >
                Add to Basket
              </button>
            )
          ) : (
            <h1 className="SOLD">SOLD!</h1>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
