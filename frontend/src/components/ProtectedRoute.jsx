import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // User is not logged in, redirect them to the login page
    // We save the location they were trying to go to, so we can redirect them back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is logged in, but their role is not allowed to view this page
    // We can redirect them to an "Unauthorized" page
    // For now, let's redirect them to the home page
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has the required role, so we can render the page
  return children;
};

export default ProtectedRoute; 