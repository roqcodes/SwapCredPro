import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container,
  Paper,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ButtonLoader from '../components/ui/ButtonLoader';

function Login() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { sendSignInEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await sendSignInEmail(email);
      
      if (response.success) {
        setSuccessMessage('Login link sent to your email. Please check your inbox and spam folder.');
      } else {
        setErrorMessage(response.message || 'Failed to send login link');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' 
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
            Log In to SwapCred
          </Typography>
          
          {errorMessage && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          
          {successMessage && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 3 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              sx={{ 
                py: 1.5, 
                mb: 2,
                fontSize: '1rem'
              }}
            >
              {isSubmitting ? <ButtonLoader /> : 'Send Login Link'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                New to SwapCred?{' '}
                <Button 
                  color="primary" 
                  onClick={() => navigate('/register')}
                  sx={{ textTransform: 'none', fontWeight: 'bold', p: 0, minWidth: 'auto' }}
                >
                  Register now
                </Button>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login; 