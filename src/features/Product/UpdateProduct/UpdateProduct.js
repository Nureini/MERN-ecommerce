import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import {
  useGetProductsQuery,
  useUpdateProductMutation,
} from "../productsApiSlice";
import FileBase from "react-file-base64";
import "./UpdateProduct.css";

const UpdateProduct = () => {
  const navigate = useNavigate();
  const { userId, productId } = useParams();
  const { username } = useAuth();

  const { product } = useGetProductsQuery("productsList", {
    selectFromResult: ({ data }) => ({
      product: data?.entities[productId],
    }),
  });

  const [updateProduct, { isLoading }] = useUpdateProductMutation();

  const [productName, setProductName] = useState(product?.name);
  const [productSize, setProductSize] = useState(product?.size);
  const [productPrice, setProductPrice] = useState(product?.price);
  const [productImage, setProductImage] = useState(product?.image);
  const [productDescription, setProductDescription] = useState(
    product?.description
  );

  useEffect(() => {}, [product]);

  const handleNameChange = (e) => {
    setProductName(e.target.value);
  };

  const handleSizeChange = (e) => {
    setProductSize(e.target.value);
  };

  const handlePriceChange = (e) => {
    setProductPrice(e.target.value);
  };

  const handleDescChange = (e) => {
    setProductDescription(e.target.value);
  };

  if (isLoading) return <p>Loading...</p>;

  if (!username) return <p>You must Login first!</p>;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await updateProduct({
      id: productId,
      user: userId,
      name: productName,
      size: productSize,
      price: productPrice,
      image: productImage,
      description: productDescription,
      sold: false,
    });

    setProductName("");
    setProductSize("");
    setProductPrice("");
    setProductImage("");
    setProductDescription("");
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="updateProduct">
      <div className="goback">
        <Link to={`/product/${productId}`}>Go Back</Link>
      </div>
      <form className="updateProduct__form" onSubmit={handleFormSubmit}>
        <h1>Update Product</h1>
        <div className="firstDiv">
          <label htmlFor="productName">Product Name</label>
          <input
            type="text"
            name="productName"
            id="productName"
            placeholder="Name"
            value={productName}
            onChange={handleNameChange}
          />
        </div>

        <div>
          <label htmlFor="productSize">Product Size</label>
          <input
            type="text"
            name="productSize"
            id="productSize"
            value={productSize}
            onChange={handleSizeChange}
            placeholder={"UK Sizing"}
          />
        </div>

        <div>
          <label htmlFor="productPrice">Product Price</label>
          <input
            type="text"
            name="productPrice"
            id="productPrice"
            placeholder="£"
            value={productPrice}
            onChange={handlePriceChange}
          />
        </div>

        <div>
          <label htmlFor="productImage">Product Image</label>

          <FileBase
            type="file"
            multiple={false}
            name="productImage"
            id="productImage"
            onDone={({ base64 }) => setProductImage(base64)}
          />
        </div>

        <div>
          <label htmlFor="productDescription">Product Description</label>
          <textarea
            name="productDescription"
            id="productDescription"
            cols="30"
            rows="5"
            value={productDescription}
            onChange={handleDescChange}
            placeholder={"Optional"}
          ></textarea>
        </div>

        <button>Submit</button>
      </form>
    </div>
  );
};

export default UpdateProduct;
