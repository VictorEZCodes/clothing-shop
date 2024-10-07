import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainPage from './MainPage';
import { toast } from 'react-toastify';

const OrderTracking = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5001/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Order not found');
            navigate('/profile');
            return;
          }
          throw new Error('Failed to fetch order');
        }
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        // console.error('Error fetching order:', error);
        toast.error('Error fetching order details');
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) return <MainPage><div className="text-center py-10"></div></MainPage>;
  if (!order) return null; // We'll redirect in useEffect if order is not found

  return (
    <MainPage>
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">Order #{order._id}</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Order Details</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.status}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">₦{order.totalAmount.toFixed(2)}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(order.createdAt).toLocaleString()}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {order.shippingDetails.fullName}<br />
                  {order.shippingDetails.address}<br />
                  {order.shippingDetails.city}, {order.shippingDetails.postalCode}<br />
                  {order.shippingDetails.country}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
          <ul className="divide-y divide-gray-200">
            {order.items.map((item) => (
              <li key={item._id} className="py-4 flex">
                <img className="h-24 w-24 object-cover rounded" src={item.product.images[0]} alt={item.product.name} />
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  <p className="text-sm text-gray-500">Price: ${item.product.price.toFixed(2)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MainPage>
  );
};

export default OrderTracking;