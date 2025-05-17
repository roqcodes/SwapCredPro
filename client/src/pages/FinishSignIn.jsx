import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Typography, 
  Container, 
  Paper, 
  Box, 
  Alert,
  CircularProgress,
  Button
} from '@mui/material';

export default function FinishSignIn() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { verifyEmailToken } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Get token from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (!token) {
          throw new Error('No verification token found in URL');
        }
        
        // Verify the token
        const result = await verifyEmailToken(token);
        
        if (result.success) {
          navigate('/dashboard');
        } else {
          throw new Error(result.message || 'Failed to verify email token');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setError(error.message || 'Failed to complete sign in');
        setLoading(false);
      }
    };
    
    verifyToken();
  }, [verifyEmailToken, navigate]);
  
  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Verifying your login...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom textAlign="center">
            Sign In Failed
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          <Typography variant="body1" paragraph>
            The sign-in link may be invalid or expired. Please try again with a new sign-in link.
          </Typography>
          
          <Button
            fullWidth
            variant="contained"
            color="primary"
            component={Link}
            to="/login"
            size="large"
            sx={{ mt: 2 }}
          >
            Return to Login
          </Button>
        </Paper>
      </Box>
    </Container>
  );
} 