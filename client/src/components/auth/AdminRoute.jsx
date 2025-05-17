import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../ui/LoadingScreen';

export default function AdminRoute({ children }) {
  const { currentUser, userProfile, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  // Check if user is authenticated and has admin privileges
  if (!currentUser) {
    return <Navigate to="/email-signin" replace />;
  }
  
  // If user is authenticated but profile isn't loaded yet, show loading
  if (!userProfile) {
    return <LoadingScreen />;
  }
  
  // If user is not an admin, redirect to dashboard
  if (!userProfile.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // User is admin, render the protected content
  return children;
} 