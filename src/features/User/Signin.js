import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import usePersist from "../../hooks/usePersist";
import { useLoginMutation } from "../auth/authApiSlice";
import { setCredentials } from "../auth/authSlice";
import "./Signin.css";
import { useCreateNewUserMutation, useGetAllUsersQuery } from "./usersApiSlice";

const Signin = () => {
  const [persist, setPersist] = usePersist();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { data: users, isSuccess } = useGetAllUsersQuery("usersList", {
    pollingInterval: 15000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  let findUser;
  if (isSuccess) {
    const { entities } = users;
    findUser = Object.values(entities).find(
      (each) => each.username === username
    );
  }

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();

  const signIn = async (e) => {
    e.preventDefault();
    try {
      const { accessToken } = await login({ username, password }).unwrap();
      dispatch(setCredentials({ accessToken }));
      setUsername("");
      setPassword("");
      navigate(`/profile/${findUser.id}`);
    } catch (error) {
      console.log(error);
    }
  };

  const [createNewUser] = useCreateNewUserMutation();
  const createNewAccount = async (e) => {
    e.preventDefault();
    if (username === "" || password === "") {
      alert("all fields required!");
    } else {
      await createNewUser({ username, password });
      const { accessToken } = await login({ username, password }).unwrap();
      dispatch(setCredentials({ accessToken }));
      setUsername("");
      setPassword("");
      navigate(`/profile/${findUser.id}`);
    }
  };

  if (isLoginLoading) {
    return <p>Logging in...</p>;
  }

  return (
    <section className="signin">
      <form>
        <h1 className="signin__title">Sign In</h1>
        <label htmlFor="name" className="signin__label--name">
          Username
        </label>
        <input
          type="text"
          name="name"
          id="name"
          className="signin__input--name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="password" className="signin__label--password">
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          className="signin__input--password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="signin__button" onClick={signIn}>
          Sign In
        </button>

        <p className="signUp__text">Don't already have an account?</p>
        <button className="signUp__button" onClick={createNewAccount}>
          Create your Account Now!
        </button>

        <label htmlFor="persist" className="form__persist">
          <input
            type="checkbox"
            className="form__checkbox"
            id="persist"
            onChange={() => setPersist((prev) => !prev)}
            checked={persist}
          />
          Trust This Device
        </label>
      </form>
    </section>
  );
};

export default Signin;
