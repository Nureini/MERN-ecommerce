import { useSelector } from "react-redux";
import { selectCurrentToken } from "../features/auth/authSlice";
import jwtDecode from "jwt-decode";

const useAuth = () => {
  const token = useSelector(selectCurrentToken);
  let isAdmin = false;
  let status = "Seller";

  if (token) {
    const decoded = jwtDecode(token);
    const { username, role } = decoded.UserInfo;

    isAdmin = role === "Admin";

    if (isAdmin) status = "Admin";

    return { username, role, status, isAdmin };
  }

  return { username: "", role: "", status, isAdmin };
};

export default useAuth;
