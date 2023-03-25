import "./CreateProduct.css";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import { useCreateNewProductMutation } from "../productsApiSlice";
import FileBase from "react-file-base64";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [createNewProduct, { isLoading }] = useCreateNewProductMutation();

  const [productName, setProductName] = useState("");
  const [productSize, setProductSize] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [productDescription, setProductDescription] = useState("");

  const { userId } = useParams();
  const { username } = useAuth();

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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await createNewProduct({
      user: userId,
      name: productName,
      size: productSize,
      price: productPrice,
      image: productImage,
      description: productDescription,
    });

    setProductName("");
    setProductSize("");
    setProductPrice("");
    setProductImage("");
    setProductDescription("");
    navigate(`/profile/${userId}`);
  };

  if (isLoading) return <p>Loading...</p>;

  if (!username) return <p>You must Login first!</p>;
  return (
    <div className="createProduct">
      <div className="goback">
        <Link to={`/profile/${userId}`}>Go Back</Link>
      </div>
      <form className="createProduct__form" onSubmit={handleFormSubmit}>
        <h1>Create Product</h1>
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
export default CreateProduct;
