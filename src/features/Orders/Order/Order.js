import Product from "../../Product/Product";
import "./Order.css";

const Order = ({ order }) => {
  return (
    <div className="order">
      <div className="order__ContainerOne">
        <h3>Order ID: {order?._id}</h3>
        <p>Order Total: £{order?.total}</p>
      </div>
      <div className="order__ContainerTwo">
        {order?.productIds?.map((product) => (
          <Product key={product} id={product} isOrdersPage={true} />
        ))}
      </div>
    </div>
  );
};

export default Order;
