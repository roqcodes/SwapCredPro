import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Box, 
  Alert,
  CircularProgress
} from '@mui/material';
import ButtonLoader from '../components/ui/ButtonLoader';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { resetPassword, checkEmail } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      // First check if email exists in Shopify
      try {
        await checkEmail(email);
      } catch (error) {
        throw new Error('Email not found in Shopify database. Only existing Shopify customers can reset passwords.');
      }
      
      await resetPassword(email);
      setMessage('Password reset email sent. Check your inbox.');
    } catch (error) {
      setError(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom textAlign="center">
            Reset Password
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }} textAlign="center">
            Enter your email address and we'll send you a link to reset your password
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              margin="normal"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              disabled={!!message}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || !!message}
            >
              {loading ? <ButtonLoader /> : 'Reset Password'}
            </Button>
          </form>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link to="/login">
              Back to Login
            </Link>
          </Box>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" display="inline" sx={{ mr: 1 }}>
              Don't have an account?
            </Typography>
            <Link to="/register">
              Sign Up
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 