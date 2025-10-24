"use client"

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './shared/Loader'; // Import the Loader component

const ProtectedRoute = ({ element: Component, adminOnly = false, ownerOnly = false, ...rest }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="w-10 h-10" color="border-blue-600" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <div className="text-center py-8 text-red-500">Access Denied: You are not authorized to view this page.</div>;
  }

  if (ownerOnly && user.role !== 'facility_owner') {
    return <div className="text-center py-8 text-red-500">Access Denied: You are not authorized to view this page.</div>;
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;
