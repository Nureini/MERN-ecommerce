import "./Orders.css";
import useAuth from "../../hooks/useAuth";
import { useGetAllUsersQuery } from "../User/usersApiSlice";
import { useGetOrdersQuery } from "./ordersApiSlice";
import Order from "./Order/Order";
import { useEffect, useState } from "react";

const Orders = () => {
  const { username } = useAuth();

  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    if (username) {
      setProcessing(false);
    }
  }, [username]);

  const { data: users, isSuccess: isUsersSuccess } = useGetAllUsersQuery();
  const { data: orders, isSuccess } = useGetOrdersQuery();

  if (processing) {
    return <div>Loading...</div>;
  }

  let foundUsersOrders;
  if (isUsersSuccess) {
    const { entities } = users;

    const findUser = Object.values(entities).find(
      (user) => user?.username === username
    );

    if (isSuccess) {
      const { entities: ordersEntities } = orders;
      const userOrders = Object.values(ordersEntities).find(
        (order) => order?.user === findUser?._id
      );
      foundUsersOrders = userOrders?.orders;
    }
  }

  if (!username) return <p>You must Login!</p>;

  return (
    <div className="orders">
      <h1 className="orders__title">Your Orders</h1>
      <div className="orders_containerOne">
        {isSuccess &&
          foundUsersOrders?.map((order) => (
            <Order key={order?._id} order={order} />
          ))}
      </div>
    </div>
  );
};

export default Orders;
