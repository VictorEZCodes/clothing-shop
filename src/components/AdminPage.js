import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainPage from './MainPage';
import { API_URL } from '../config';

const AdminPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchOrders();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      // console.error('Error fetching categories:', error);
      setTimeout(() => {
        toast.error('Failed to fetch categories');
      }, 0);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      setImageFiles([...e.target.files]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name || !description || !price || imageFiles.length === 0 || !category) {
      setTimeout(() => {
        toast.error('Please fill in all fields and select at least one image');
      }, 0);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let imageUrls = [];

      // Upload each image
      for (let imageFile of imageFiles) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadResponse = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          // console.error('Upload response:', uploadResponse.status, errorText);
          throw new Error(`Failed to upload image: ${errorText}`);
        }

        const uploadData = await uploadResponse.json();
        imageUrls.push(uploadData.imageUrl);
      }

      const productData = {
        name,
        description,
        price: parseFloat(price),
        images: imageUrls,
        category
      };
      // console.log('Sending product data:', productData);

      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const responseData = await response.json();
      // console.log('Full product response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to add product');
      }

      setTimeout(() => {
        toast.success('Product added successfully!');
      }, 0);
      setName('');
      setDescription('');
      setPrice('');
      setImageFiles([]);
      setCategory('');
    } catch (error) {
      // console.error('Error adding product:', error);
      setTimeout(() => {
        toast.error(`Failed to add product: ${error.message}`);
      }, 0);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newCategoryName })
      });

      const responseData = await response.json();
      // console.log('Full response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to add category');
      }

      // console.log('Category added successfully:', responseData);
      setTimeout(() => {
        toast.success('Category added successfully!');
      }, 0);
      setNewCategoryName('');
      fetchCategories();
    } catch (error) {
      // console.error('Error adding category:', error);
      setTimeout(() => {
        toast.error(`Failed to add category: ${error.message}`);
      }, 0);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      // console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const updatedOrder = await response.json();
      setOrders(orders.map(order =>
        order._id === updatedOrder._id ? updatedOrder : order
      ));
      toast.success('Order status updated successfully');
    } catch (error) {
      // console.error('Error updating order status:', error);
      toast.error(`Failed to update order status: ${error.message}`);
    }
  };

  return (
    <MainPage>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Add Category Form */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Add New Category</h2>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-700">Category Name</label>
              <input
                type="text"
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add Category
            </button>
          </form>
        </div>

        {/* Add Product Form */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="3"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700">Images</label>
              <input
                type="file"
                id="images"
                onChange={handleImageChange}
                accept="image/*"
                multiple
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isSubmitting ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>

        {/* Order Management Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Order Management</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {orders.map(order => (
                <li key={order._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-600">Order #{order._id}</p>
                      <p className="text-sm text-gray-500">Status: {order.status}</p>
                      <p className="text-sm text-gray-500">Total: ${order.totalAmount.toFixed(2)}</p>
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                        className="text-sm text-blue-500 hover:text-blue-700"
                      >
                        {expandedOrder === order._id ? 'Hide Details' : 'Show Details'}
                      </button>
                    </div>
                    <div>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>
                  </div>
                  {expandedOrder === order._id && (
                    <div className="mt-4 text-sm text-gray-700">
                      <p><strong>User Email:</strong> {order.user.email}</p>
                      <p><strong>Payment Reference:</strong> {order.paymentReference}</p>
                      <p><strong>Shipping Details:</strong></p>
                      <ul className="list-disc pl-5">
                        <li>Full Name: {order.shippingDetails.fullName}</li>
                        <li>Address: {order.shippingDetails.address}</li>
                        <li>City: {order.shippingDetails.city}</li>
                        <li>Postal Code: {order.shippingDetails.postalCode}</li>
                        <li>Country: {order.shippingDetails.country}</li>
                        <li>Phone: {order.shippingDetails.phone}</li>
                      </ul>
                      <p><strong>Order Items:</strong></p>
                      <ul className="list-disc pl-5">
                        {order.items.map((item, index) => (
                          <li key={index}>
                            {item.product.name} - Quantity: {item.quantity} - Price: ${item.product.price.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </MainPage>
  );
};

export default AdminPage;