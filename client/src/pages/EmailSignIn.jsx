import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Link
} from '@mui/material';
import { Email as EmailIcon, Store as StoreIcon } from '@mui/icons-material';
import ButtonLoader from '../components/ui/ButtonLoader';

export default function EmailSignIn() {
  const { currentUser, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const theme = useTheme();
  const navigate = useNavigate();

  // If already signed in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Make sure signInWithEmail is actually a function before calling it
      if (typeof signInWithEmail !== 'function') {
        throw new Error('Sign in functionality is currently unavailable. Please try again later.');
      }
      
      const result = await signInWithEmail(email);
      
      if (result.success) {
        setSuccess(`Welcome back! Account found for ${email}. Redirecting to dashboard...`);
        
        // Redirect after a short delay to show the success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        // Handle different error cases
        if (result.notInShopify) {
          setError(
            <Box>
              <Typography variant="body1" gutterBottom>
                Email "{email}" is not found in our Shopify database.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                You need a customer account at <strong>printersparekart.com</strong> in order to place a request.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please sign in with the email address associated with your printersparekart.com account.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: 'primary.main' }}>
                Don't have an account? Visit <Link href="https://printersparekart.com/account/register" target="_blank" rel="noopener noreferrer">printersparekart.com</Link> to create one.
              </Typography>
            </Box>
          );
          // Clear email field for not found emails
          setEmail('');
        } else if (result.serverError) {
          setError('Server error: The authentication service is currently unavailable. Please try again later.');
        } else {
          setError(result.message || 'Failed to sign in. Please try again.');
        }
      }
    } catch (error) {
      // Handle network errors
      if (!error.response) {
        setError('Network error: Please check your internet connection and try again.');
      } else {
        setError(error.message || 'Failed to sign in. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If there's an error, make sure it's visible
    if (error) {
      const errorElement = document.querySelector('.MuiAlert-root');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [error]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        mt: 8
      }}>
        <Paper
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 2,
            width: '100%',
            background: `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <StoreIcon
              sx={{
                fontSize: 48,
                mb: 2,
                color: theme.palette.primary.main,
              }}
            />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Sign In with Email
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your Shopify store email to continue
            </Typography>
          </Box>
          
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Typography variant="body2" fontWeight="medium">
              Important: You need a customer account at <strong>printersparekart.com</strong> to use this service.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Please sign in with the email address associated with your printersparekart.com account.
            </Typography>
          </Alert>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              type="email"
              variant="outlined"
              label="Email Address"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ 
                py: 1.5,
                mb: 2,
                fontWeight: 'bold',
                position: 'relative'
              }}
            >
              {loading ? <ButtonLoader /> : 'Continue'}
            </Button>

            <Typography variant="body2" color="text.secondary" align="center">
              By continuing, you agree to our{' '}
              <Link href="#" color="primary">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" color="primary">
                Privacy Policy
              </Link>
            </Typography>
          </form>
        </Paper>
      </Box>
    </Container>
  );
} 