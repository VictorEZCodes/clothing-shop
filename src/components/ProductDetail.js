import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import MainPage from './MainPage';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { id } = useParams();
  const { dispatch } = useCart();
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      const data = await response.json();
      setProduct(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const addToCart = () => {
    dispatch({ type: 'ADD_TO_CART', payload: { ...product, quantity } });
    setTimeout(() => {
      toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }, 0);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    setQuantity(value >= 1 ? value : 1);
  };

  if (loading) return <MainPage><div className="text-center py-10"></div></MainPage>;
  if (error) return <MainPage><div className="text-center py-10 text-red-500">Error: {error}</div></MainPage>;
  if (!product) return <MainPage><div className="text-center py-10">Product not found</div></MainPage>;

  return (
    <MainPage>
      <div className="flex justify-center items-center min-h-screen">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
            {/* Image gallery */}
            <div className="flex flex-col">
              <div className="w-full aspect-w-1 aspect-h-1 mb-4">
                <img
                  src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : ''}
                  alt={product.name}
                  className="w-full h-full object-center object-cover sm:rounded-lg cursor-pointer"
                  onClick={() => setSelectedImage(product.images[0])}
                />
              </div>
              {Array.isArray(product.images) && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-24 object-cover rounded-md cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
              <div className="mt-3">
                <h2 className="sr-only">Product information</h2>
                <p className="text-3xl text-gray-900">${product.price.toFixed(2)}</p>
              </div>
              <div className="mt-6">
                <h3 className="sr-only">Description</h3>
                <div className="text-base text-gray-700" dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
              <div className="mt-10">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mt-10">
                <button
                  onClick={addToCart}
                  type="button"
                  className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500"
                >
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image popup */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
          <div className="relative bg-white p-2 rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-w-[80vw] max-h-[80vh] object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-75 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </MainPage>
  );
};

export default ProductDetail;