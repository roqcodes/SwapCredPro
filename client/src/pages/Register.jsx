import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Box, 
  Divider, 
  Alert,
  CircularProgress
} from '@mui/material';
import ButtonLoader from '../components/ui/ButtonLoader';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // First check if email exists in Shopify
      const checkResponse = await axios.post('/api/shopify/check-customer', { email });
      
      if (!checkResponse.data.exists) {
        setError('Email not found in Shopify database. Only existing Shopify customers can register.');
        setLoading(false);
        return;
      }
      
      // Proceed with signup
      await signup(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      
      // Check if this is a 404 Not Found error from the Shopify check
      if (error.response && error.response.status === 404) {
        setError(error.response.data.error || 'Email not found in Shopify database. Only existing Shopify customers can register.');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('Email is already registered. Please login instead.');
      } else {
        setError(error.response?.data?.error || error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom textAlign="center">
            Create an Account
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
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
            />
            
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helperText="Password must be at least 6 characters"
            />
            
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              margin="normal"
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <ButtonLoader /> : 'Sign Up'}
            </Button>
          </form>
          
          <Divider sx={{ my: 3 }}>Or</Divider>
          
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            component={Link}
            to="/email-signin"
            sx={{ mb: 2 }}
          >
            Sign in with Email Link (No Password)
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login">
              Sign In
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 