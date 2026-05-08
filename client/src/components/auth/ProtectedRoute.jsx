import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requireOwner = false }) => {
  const { isAuthenticated, isLoading, isOwner } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page, but save the current location they were trying to go to
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  if (requireOwner && !isOwner) {
    // If route requires owner but user is customer, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
