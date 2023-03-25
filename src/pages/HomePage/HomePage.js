import "./HomePage.css";
import Product from "../../features/Product/Product";
import { useGetProductsQuery } from "../../features/Product/productsApiSlice";

const HomePage = () => {
  const {
    data: products,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetProductsQuery("productsList", {
    pollingInterval: 15000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) {
    return (
      <div className="home__loading">
        <h1>Loading..., try refreshing the page</h1>
      </div>
    );
  }

  if (isError) return <p>{error?.data?.message}</p>;

  if (isSuccess) {
    return (
      <section className="section__products">
        {products?.ids?.length &&
          products?.ids?.map((productId) => (
            <Product key={productId} id={productId} isBasketPage={false} />
          ))}
      </section>
    );
  }
};
export default HomePage;
