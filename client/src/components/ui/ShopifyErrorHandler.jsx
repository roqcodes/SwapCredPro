import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  alpha,
  Container
} from '@mui/material';
import { 
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon,
  ContactSupport as ContactSupportIcon,
  Store as StoreIcon
} from '@mui/icons-material';

const ShopifyErrorHandler = ({ 
  errorType = 'shopify_user_not_found', 
  message, 
  onRetry,
  email
}) => {
  const theme = useTheme();

  const getErrorContent = () => {
    switch (errorType) {
      case 'shopify_user_not_found':
        return {
          title: 'Shopify Account Not Found',
          icon: <StoreIcon sx={{ fontSize: 60, color: '#1a1a1a', mb: 2 }} />,
          description: email 
            ? `We couldn't find a Shopify account linked to ${email}. Please make sure you're using the same email address associated with your Shopify account.`
            : 'We couldn\'t find your Shopify account. Please make sure you\'re using the same email address associated with your Shopify account.',
          primaryAction: 'Try Again',
          secondaryAction: 'Contact Support'
        };
      case 'connection_error':
        return {
          title: 'Connection Error',
          icon: <ErrorIcon sx={{ fontSize: 60, color: '#555555', mb: 2 }} />,
          description: 'We\'re having trouble connecting to Shopify. This might be a temporary issue. Please try again in a few moments.',
          primaryAction: 'Refresh',
          secondaryAction: 'Contact Support'
        };
      case 'auth_error':
        return {
          title: 'Authentication Error',
          icon: <ErrorIcon sx={{ fontSize: 60, color: '#666666', mb: 2 }} />,
          description: 'There was a problem with your authentication. Please try signing in again.',
          primaryAction: 'Try Again',
          secondaryAction: 'Sign Out'
        };
      default:
        return {
          title: 'Something Went Wrong',
          icon: <ErrorIcon sx={{ fontSize: 60, color: '#444444', mb: 2 }} />,
          description: message || 'An unexpected error occurred. Please try again later.',
          primaryAction: 'Refresh',
          secondaryAction: 'Contact Support'
        };
    }
  };

  const content = getErrorContent();

  return (
    <Container maxWidth="sm">
      <Paper 
        elevation={2} 
        sx={{ 
          p: 4, 
          mt: 4, 
          textAlign: 'center',
          borderRadius: 2,
          border: `1px solid ${alpha('#1a1a1a', 0.2)}`,
          boxShadow: `0 4px 20px ${alpha('#1a1a1a', 0.1)}`,
          backdropFilter: 'blur(10px)',
          bgcolor: 'rgba(255, 255, 255, 0.7)',
        }}
      >
        {content.icon}
        
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
          {content.title}
        </Typography>
        
        <Typography variant="body1" color="#555555" paragraph sx={{ mb: 3 }}>
          {content.description}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, justifyContent: 'center', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#1a1a1a',
              color: '#fff',
              '&:hover': {
                bgcolor: '#333',
              },
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            fullWidth={false}
          >
            {content.primaryAction}
          </Button>
          
          <Button
            variant="outlined"
            sx={{
              color: '#1a1a1a',
              borderColor: alpha('#1a1a1a', 0.3),
              '&:hover': {
                borderColor: '#1a1a1a',
                bgcolor: alpha('#1a1a1a', 0.02)
              }
            }}
            startIcon={<ContactSupportIcon />}
            component="a"
            href="mailto:support@swapcred.com"
            fullWidth={false}
          >
            {content.secondaryAction}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ShopifyErrorHandler; 