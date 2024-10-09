import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;