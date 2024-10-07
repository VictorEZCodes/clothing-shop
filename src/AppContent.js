import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import MainPage from './components/MainPage';
import About from './components/About';
import Contact from './components/Contact';
import AdminPage from './components/AdminPage';
import Login from './components/Login';
import Signup from './components/Signup';
import ProductListing from './components/ProductListing';
import ProductDetail from './components/ProductDetail';
import UserProfile from './components/UserProfile';
import Checkout from './components/Checkout';
import CartSummary from './components/CartSummary';
import ProtectedRoute from './components/ProtectedRoute';
import CreateAdmin from './components/CreateAdmin';
import OrderConfirmation from './components/OrderConfirmation';
import OrderTracking from './components/OrderTracking';

function AppContent() {
  const navigate = useNavigate();

  const proceedToCheckout = () => {
    navigate('/checkout');
  };

  return (
    <CartProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/create-admin" element={<CreateAdmin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/cart" element={<CartSummary proceedToCheckout={proceedToCheckout} />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
        </Routes>
      </div>
    </CartProvider>
  );
}

export default AppContent;