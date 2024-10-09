import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import MainPage from './MainPage';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

const Checkout = () => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: ''
  });
  const [userEmail, setUserEmail] = useState('');
  const [exchangeRate, setExchangeRate] = useState(null);

  useEffect(() => {
    const isAuthenticated = !!localStorage.getItem('token');
    if (!isAuthenticated) {
      toast.error('Please log in to proceed with checkout');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserEmail();
    fetchExchangeRate();

    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchUserEmail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/user/email`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        // console.log('User email data:', data);
        setUserEmail(data.email);
      } else {
        // console.error('Error response:', await response.text());
      }
    } catch (error) {
      // console.error('Error fetching user email:', error);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (response.ok) {
        const data = await response.json();
        setExchangeRate(data.rates.NGN);
      }
    } catch (error) {
      // console.error('Error fetching exchange rate:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };

  const totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalAmountInNaira = exchangeRate ? Math.round(totalAmount * exchangeRate * 100) : 0;

  const onSuccess = (reference) => {
    // console.log("Payment successful. Reference:", reference);
    createOrder(reference);
  };

  const onClose = () => {
    // console.log("Payment window closed");
    toast.error('Payment cancelled');
  };

  const createOrder = async (reference) => {
    try {
      // console.log("Creating order with reference:", reference);
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: state.items.map(item => ({
            product: item._id,
            quantity: item.quantity
          })),
          totalAmount: totalAmountInNaira / 100,
          shippingDetails,
          paymentReference: reference.reference
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await response.json();
      // console.log("Order created successfully:", orderData);
      dispatch({ type: 'CLEAR_CART' });
      toast.success('Order placed successfully!');
      navigate('/order-confirmation', { state: { orderId: orderData._id } });
    } catch (error) {
      // console.error('Error creating order:', error);
      toast.error(`Failed to place order: ${error.message}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!exchangeRate) {
      toast.error('Unable to process payment. Please try again later.');
      return;
    }
    if (!userEmail) {
      toast.error('User email is missing. Please try logging in again.');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
      email: userEmail,
      amount: totalAmountInNaira,
      currency: 'NGN',
      ref: (new Date()).getTime().toString(),
      callback: function (response) {
        // console.log("Payment callback received:", response);
        onSuccess(response);
      },
      onClose: function () {
        onClose();
      },
    });
    handler.openIframe();
  };

  return (
    <MainPage>
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Checkout</h2>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="fullName" className="sr-only">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={shippingDetails.fullName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="address" className="sr-only">Address</label>
              <input
                id="address"
                name="address"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Address"
                value={shippingDetails.address}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="city" className="sr-only">City</label>
              <input
                id="city"
                name="city"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="City"
                value={shippingDetails.city}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="postalCode" className="sr-only">Postal Code</label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Postal Code"
                value={shippingDetails.postalCode}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="country" className="sr-only">Country</label>
              <input
                id="country"
                name="country"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Country"
                value={shippingDetails.country}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Phone"
                value={shippingDetails.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Total: ${totalAmount.toFixed(2)} (₦{totalAmountInNaira / 100})
            </p>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Proceed to Payment
            </button>
          </div>
        </form>
      </div>
    </MainPage>
  );
};

export default Checkout;