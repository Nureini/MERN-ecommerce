import "./Profile.css";
import useAuth from "../../../hooks/useAuth";
import { useGetAllUsersQuery } from "../usersApiSlice";
import { useGetProductsQuery } from "../../Product/productsApiSlice";
import Product from "../../Product/Product";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { username } = useAuth();
  const [user, setUser] = useState(null);

  const {
    data: users,
    isLoading: isUsersLoading,
    isSuccess: isUsersSuccess,
  } = useGetAllUsersQuery();

  const { data: products, isLoading: isProductsLoading } =
    useGetProductsQuery();

  useEffect(() => {
    if (isUsersSuccess) {
      const findUser =
        isUsersSuccess &&
        Object.values(users?.entities).find((user) => user?._id === userId);

      setUser(findUser);
    }
  }, [isUsersLoading, isUsersSuccess, userId, users?.entities]);

  if (isUsersLoading || isProductsLoading) return <p>loading...</p>;

  let foundProducts = [];
  const findUsersProducts = Object.values(products.entities)?.map(
    (product) => product?.user === userId && foundProducts.push(product)
  );

  if (findUsersProducts) {
    const handleButton = () => {
      navigate(`/profile/${user?.id}/create-product`);
    };
    return (
      <div className="profile">
        <div className="profile_containerOne">
          <h1 className="profile__title">
            Profile: {user?.username} - Seller Page
          </h1>
          {username && (
            <button onClick={handleButton}>Create New Product</button>
          )}
        </div>
        <div className="profile__availableProducts">
          {!foundProducts?.length && <p>No Products Currently Listed!</p>}
          {foundProducts?.map((product) => (
            <Product
              key={product?._id}
              id={product?._id}
              isProfilePage={true}
            />
          ))}
        </div>
      </div>
    );
  }
};
export default Profile;
