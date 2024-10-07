import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import MainPage from './MainPage';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = location.state || {};

  useEffect(() => {
    if (!orderId) {
      // If there's no orderId in the state, redirect to the shop
      navigate('/products');
    }
  }, [orderId, navigate]);

  if (!orderId) {
    return null; // Return null to prevent rendering anything while redirecting
  }

  return (
    <MainPage>
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Order Confirmation</h2>
        <p className="mt-4 text-gray-600">
          Thank you for your order! Your order number is: <span className="font-bold">{orderId}</span>
        </p>
        <p className="mt-2 text-gray-600">
          We'll send you an email with your order details and tracking information once your order has shipped.
        </p>
        <Link to={`/order-tracking/${orderId}`} className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Track Your Order
        </Link>
      </div>
    </MainPage>
  );
};

export default OrderConfirmation;