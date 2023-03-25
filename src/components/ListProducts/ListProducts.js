import "./ListProducts.css";
import { useGetProductsQuery } from "../../features/Product/productsApiSlice";

const ListProducts = ({ id }) => {
  const { product } = useGetProductsQuery("productsList", {
    selectFromResult: ({ data }) => ({
      product: data?.entities[id],
    }),
  });

  return (
    <div className="listProducts">
      <h1>{product?.name}</h1>
      <p>UK {product?.size}</p>
      <h3>£{product?.price}</h3>
    </div>
  );
};

export default ListProducts;
