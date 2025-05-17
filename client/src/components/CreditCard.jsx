import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  alpha,
  useTheme,
  Skeleton,
  Chip
} from '@mui/material';
import { CreditCard as CreditCardIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const CreditCard = ({ creditAmount = 0, creditCurrency = 'INR', isLoading = false, username = '' }) => {
  const theme = useTheme();
  
  // Get currency symbol based on currency code
  const getCurrencySymbol = (currency) => {
    switch(currency) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return currency;
    }
  };

  // Format the username for the card
  const formatUsername = (name) => {
    if (!name) return 'VALUED CUSTOMER';
    
    // If email, take the part before @
    if (name.includes('@')) {
      return name.split('@')[0].toUpperCase();
    }
    
    // Otherwise just uppercase the name
    return name.toUpperCase();
  };

  // Create a fixed aspect ratio card (standard credit card aspect ratio is approximately 1.586:1)
  const cardStyle = {
    background: 'linear-gradient(135deg, #f7f7f7 0%, #ffffff 50%, #f7f7f7 100%)',
    color: '#333',
    position: 'relative',
    overflow: 'hidden',
    aspectRatio: '1.586/1',
    maxHeight: '220px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: '12px',
    boxShadow: `0 15px 25px ${alpha('#000', 0.1)}`,
    border: `1px solid ${alpha('#000', 0.05)}`,
    backdropFilter: 'blur(10px)'
  };

  if (isLoading) {
    return (
      <Card 
        elevation={0}
        sx={cardStyle}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CreditCardIcon sx={{ mr: 1, fontSize: 28, color: theme.palette.primary.main }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Available Loyalty Points
            </Typography>
          </Box>
          <Box sx={{ pt: 1 }}>
            <Skeleton variant="text" width="70%" height={60} sx={{ bgcolor: alpha('#000', 0.1) }} />
            <Skeleton variant="text" width="90%" height={20} sx={{ bgcolor: alpha('#000', 0.1), mt: 1 }} />
          </Box>
        </CardContent>
        <Box sx={{ p: 2, bgcolor: alpha('#000', 0.03) }}>
          <Skeleton variant="text" width="50%" height={20} sx={{ bgcolor: alpha('#000', 0.1) }} />
        </Box>
      </Card>
    );
  }

  return (
    <Card 
      elevation={0}
      sx={cardStyle}
    >
      {/* Card Background Design - Metallic effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120%',
          height: '120%',
          opacity: 0.8,
          transform: 'translateX(-10%) translateY(-10%)'
        }}
      />

      {/* Card chip and circuit pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          height: '100%',
          opacity: 0.05,
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>')`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 20px',
          backgroundSize: '180px',
          transform: 'rotate(-5deg)',
        }}
      />
      
      {/* Card Content */}
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2.5, zIndex: 3, position: 'relative' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '1rem', color: theme.palette.primary.main }}>
              Available Loyalty Points
            </Typography>
            <CreditCardIcon sx={{ fontSize: 24, color: theme.palette.primary.main }} />
          </Box>
          
          <Typography variant="h4" component="div" sx={{ 
            fontWeight: 'bold', 
            mb: 0.5, 
            fontSize: '1.7rem',
            color: '#333',
            textShadow: `0 0 5px ${alpha('#fff', 0.5)}`
          }}>
            {getCurrencySymbol(creditCurrency)}{creditAmount.toFixed(2)}
          </Typography>
          
        </Box>
        
        <Box>
          <Typography variant="body1" sx={{ color: alpha('#000', 0.8), fontWeight: 'medium', letterSpacing: 0.5, fontSize: '0.85rem' }}>
            {formatUsername(username)}
          </Typography>
        </Box>
      </CardContent>
      
      {/* Card Footer */}
      <Box sx={{ 
        p: 1.5, 
        bgcolor: alpha(theme.palette.primary.main, 0.1), 
        backdropFilter: 'blur(5px)',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderTop: `1px solid ${alpha('#000', 0.05)}`
      }}>
        <Typography variant="caption" sx={{ fontWeight: 'medium', letterSpacing: 0.5, color: theme.palette.primary.main }}>
          SWAP • POINTS • SHOP
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 'medium', letterSpacing: 0.5, color: theme.palette.primary.main }}>
          VALID THRU: ∞
        </Typography>
      </Box>
    </Card>
  );
};

export default CreditCard; 