import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import theme from './theme/theme';
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import Dashboard from './pages/Dashboard';
import EmailSignIn from './pages/EmailSignIn';
import ExchangeForm from './pages/ExchangeForm';
import ExchangeDetails from './pages/ExchangeDetails';
import ExchangeList from './pages/ExchangeList';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminExchangeDetails from './pages/admin/AdminExchangeDetails';
import NotFound from './pages/NotFound';
import LoadingScreen from './components/ui/LoadingScreen';

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/email-signin" element={!currentUser ? <EmailSignIn /> : <Navigate to="/dashboard" />} />
          
          {/* Protected routes */}
          <Route path="/" element={<Navigate to={currentUser ? "/dashboard" : "/email-signin"} />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/exchange/new" element={<PrivateRoute><ExchangeForm /></PrivateRoute>} />
          <Route path="/exchange/:id" element={<PrivateRoute><ExchangeDetails /></PrivateRoute>} />
          <Route path="/exchange" element={<PrivateRoute><ExchangeList /></PrivateRoute>} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/exchange/:id" element={<AdminRoute><AdminExchangeDetails /></AdminRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </ThemeProvider>
  );
}

export default App; 