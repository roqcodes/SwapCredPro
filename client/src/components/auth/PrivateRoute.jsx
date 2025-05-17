import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../ui/LoadingScreen';

export default function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!currentUser) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/email-signin" state={{ from: location }} replace />;
  }
  
  return children;
} 