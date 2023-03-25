import "./Header.css";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import { Link } from "react-router-dom";
import { useGetBasketItemsQuery } from "../../features/Basket/basketApiSlice";
import useAuth from "../../hooks/useAuth";
import { useSendLogoutMutation } from "../../features/auth/authApiSlice";
import { useNavigate } from "react-router-dom";
import { useGetAllUsersQuery } from "../../features/User/usersApiSlice";

const Header = () => {
  const navigate = useNavigate();
  const { username } = useAuth();

  const { data: users, isSuccess: isUsersSuccess } = useGetAllUsersQuery();

  const [
    sendLogout,
    { isLoading: isLogoutLoading, isSuccess: isLogoutSuccess },
  ] = useSendLogoutMutation();

  const { data: basketItems, isSuccess } = useGetBasketItemsQuery();

  let findUser;
  if (isUsersSuccess) {
    findUser = Object.values(users?.entities).find(
      (user) => user?.username === username
    );
  }

  const handleSignOut = async () => {
    await sendLogout();
    if (isLogoutSuccess) {
      navigate("/");
    }
  };
  if (isLogoutLoading) return <p> Logging Out...</p>;

  let basketItem;
  if (isSuccess) {
    basketItem = Object.values(basketItems.entities).find((item) => {
      if (item?.user === findUser?._id && item.active === true)
        return item?._id;
      else return null;
    });
  }

  return (
    <div className="header">
      <Link to="/" className="header__logo">
        TheShoeLabel
      </Link>

      <ul className="header__navs">
        {username && (
          <>
            <li
              className="header__navs--profile"
              onClick={() => navigate(`profile/${findUser?.id}`)}
            >
              Your Profile
            </li>
            <li
              className="header__navs--orders"
              onClick={() => navigate("orders")}
            >
              Your Orders
            </li>
          </>
        )}
        <li className="header__navs--signIn">
          {username ? `Hello ${username}` : "Hello Guest"}

          {!username ? (
            <Link to="signin" className="signIn__link">
              Sign in
            </Link>
          ) : (
            <Link to="/" className="signIn__link" onClick={handleSignOut}>
              Sign Out
            </Link>
          )}
        </li>

        <li className="header__navs--basket">
          <Link to="basket" className="header__navs--basketLink">
            <ShoppingBasketIcon />{" "}
            {basketItem?.basketItems?.length
              ? basketItem?.basketItems?.length
              : "0"}
          </Link>
        </li>
      </ul>
    </div>
  );
};
export default Header;
