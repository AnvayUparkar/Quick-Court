"use client"

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ element: Component, adminOnly = false, ownerOnly = false, ...rest }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
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
