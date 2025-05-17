import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Typography, 
  Container, 
  Box, 
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  IconButton,
  LinearProgress,
  Skeleton,
  useTheme,
  useMediaQuery,
  alpha,
  TextField,
  InputAdornment,
  Avatar,
  CardHeader
} from '@mui/material';
import { 
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  CreditCard as CreditCardIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  SwapHoriz as SwapIcon,
  LocalShipping as ShippingIcon,
  Search as SearchIcon,
  NotificationsActive as NotificationsIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import CreditCard from '../components/CreditCard';
import ShopifyErrorHandler from '../components/ui/ShopifyErrorHandler';

// Status chip component
const StatusChip = ({ status }) => {
  switch (status) {
    case 'approved':
      return <Chip 
        icon={<CheckCircleIcon />} 
        label="Approved" 
        variant="outlined" 
        size="small" 
        sx={{ 
          bgcolor: 'white', 
          borderColor: '#2196f3', 
          color: '#2196f3',
          '& .MuiChip-icon': { color: '#2196f3' }
        }} 
      />;
    case 'declined':
      return <Chip icon={<CancelIcon />} label="Declined" color="error" variant="outlined" size="small" sx={{ bgcolor: 'white', borderColor: '#f44336', color: '#f44336' }} />;
    case 'completed':
      return <Chip icon={<CheckCircleIcon />} label="Completed" color="success" variant="outlined" size="small" sx={{ bgcolor: 'white', borderColor: '#4caf50', color: '#4caf50' }} />;
    case 'pending':
    default:
      return <Chip 
        icon={<PendingIcon />} 
        label="Pending" 
        variant="outlined" 
        size="small" 
        sx={{ 
          bgcolor: 'white', 
          borderColor: '#ff9800', 
          color: '#ff9800',
          '& .MuiChip-icon': { color: '#ff9800' }
        }} 
      />;
  }
};

// Notification component for exchange status
const ExchangeNotification = ({ status, transitStatus }) => {
  const theme = useTheme();
  let message = "";
  let icon = <PendingIcon />;
  let color = '#ed6c02'; // Default pending color
  
  if (transitStatus) {
    switch(transitStatus) {
      case 'shipped':
        message = "Item has been shipped to us";
        icon = <ShippingIcon />;
        color = '#0288d1'; // Blue for shipped
        break;
      case 'received':
        message = "Item received and under inspection";
        icon = <InventoryIcon />;
        color = '#2e7d32'; // Green for received 
        break;
      case 'ready':
        message = "Ready to ship back to you";
        icon = <ShippingIcon />;
        color = '#0288d1'; // Blue for shipping
        break;
      default:
        message = `Transit status: ${transitStatus}`;
        icon = <ShippingIcon />;
        color = '#0288d1'; // Blue for default transit
    }
  } else {
    switch(status) {
      case 'approved':
        message = "Add Shipping Details!";
        icon = <ShippingIcon />;
        color = '#FFA500'; // Green for approved
        break;
      case 'declined':
        message = "Exchange request declined";
        icon = <CancelIcon />;
        color = '#d32f2f'; // Red for declined
        break;
      case 'completed':
        message = "Exchange process completed";
        icon = <CheckCircleIcon />;
        color = '#2e7d32'; // Green for completed
        break;
      case 'pending':
      default:
        message = "Exchange pending review";
        icon = <PendingIcon />;
        color = '#ed6c02'; // Orange for pending
    }
  }
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      color: color,
      bgcolor: alpha(color, 0.08),
      py: 1,
      px: 1.5,
      borderRadius: 1
    }}>
      <Box sx={{ mr: 1 }}>{icon}</Box>
      <Typography variant="body2" sx={{ color: color, fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default function Dashboard() {
  const { currentUser, userProfile, fetchUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shopifyError, setShopifyError] = useState(null);
  const [exchangeRequests, setExchangeRequests] = useState([]);
  const [filteredExchanges, setFilteredExchanges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [creditAmount, setCreditAmount] = useState(0);
  const [creditCurrency, setCreditCurrency] = useState('INR');
  const [refreshing, setRefreshing] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      setShopifyError(null);
      
      const token = await currentUser.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch exchange requests
      const exchangeResponse = await axios.get('/api/exchange', { headers });
      setExchangeRequests(exchangeResponse.data);
      setFilteredExchanges(exchangeResponse.data);
      
      // Fetch credit amount
      try {
        const creditResponse = await axios.get('/api/shopify/credit', { headers });
        
        // Check if there's a Shopify-specific error in the response
        if (creditResponse.data.error) {
          if (creditResponse.data.error.includes('not found')) {
            setShopifyError({
              type: 'shopify_user_not_found',
              message: creditResponse.data.error,
              email: currentUser.email
            });
          } else {
            setShopifyError({
              type: 'connection_error',
              message: creditResponse.data.error
            });
          }
        }
        
        setCreditAmount(creditResponse.data.creditAmount || 0);
        setCreditCurrency(creditResponse.data.currency || 'INR');
      } catch (creditError) {
        console.error('Error fetching credit:', creditError);
        
        // Handle different types of credit fetching errors
        if (creditError.response) {
          // Server responded with an error status
          if (creditError.response.status === 404) {
            setShopifyError({
              type: 'shopify_user_not_found',
              message: 'User not found in Shopify',
              email: currentUser.email
            });
          } else {
            setShopifyError({
              type: 'connection_error',
              message: creditError.response.data?.error || 'Error connecting to Shopify'
            });
          }
        } else if (creditError.request) {
          // No response received
          setShopifyError({
            type: 'connection_error',
            message: 'No response from server'
          });
        } else {
          // Other errors
          setShopifyError({
            type: 'unknown',
            message: creditError.message
          });
        }
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query) {
      setFilteredExchanges(exchangeRequests);
      return;
    }
    
    const filtered = exchangeRequests.filter(request => 
      request.productName?.toLowerCase().includes(query) || 
      request.brand?.toLowerCase().includes(query) ||
      request.status?.toLowerCase().includes(query)
    );
    
    setFilteredExchanges(filtered);
  };
  
  useEffect(() => {
    fetchData();
  }, [currentUser]);
  
  useEffect(() => {
    // Force token refresh to ensure admin privileges are correctly detected
    const forceTokenRefresh = async () => {
      if (currentUser) {
        try {
          // Force token refresh and get updated token result
          await currentUser.getIdToken(true);
          const idTokenResult = await currentUser.getIdTokenResult();
          
          console.log('Token refreshed on Dashboard');
          console.log('Admin status in token:', idTokenResult.claims.admin);
          
          // If admin claim is present but not reflected in userProfile,
          // manually refresh the profile
          if (idTokenResult.claims.admin && !userProfile?.isAdmin) {
            console.log('Refreshing user profile to update admin status');
            await fetchUserProfile();
          }
        } catch (error) {
          console.error('Error refreshing token in Dashboard:', error);
        }
      }
    };

    forceTokenRefresh();
  }, [currentUser, userProfile, fetchUserProfile]);
  
  // If we have a Shopify specific error that should be displayed with the custom component
  if (shopifyError && !loading) {
    return (
      <ShopifyErrorHandler 
        errorType={shopifyError.type}
        message={shopifyError.message}
        email={shopifyError.email}
        onRetry={handleRefresh}
      />
    );
  }
  
  if (loading && !refreshing) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rounded" height={160} animation="wave" sx={{ bgcolor: alpha('#888', 0.1) }} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rounded" height={80} animation="wave" sx={{ mb: 2, bgcolor: alpha('#888', 0.1) }} />
            <Skeleton variant="rounded" height={120} animation="wave" sx={{ bgcolor: alpha('#888', 0.1) }} />
          </Grid>
        </Grid>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold',
            backgroundImage: 'linear-gradient(45deg, #1a1a1a, #888)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textFillColor: 'transparent',
          }}
        >
          Your Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
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
            startIcon={<AddIcon />}
            component={Link}
            to="/exchange/new"
            size={isMobile ? "small" : "medium"}
          >
            New Exchange
          </Button>
          <IconButton 
            onClick={handleRefresh} 
            sx={{ 
              bgcolor: alpha('#1a1a1a', 0.05),
              color: '#1a1a1a',
              border: '1px solid',
              borderColor: alpha('#1a1a1a', 0.1),
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
              '&:hover': {
                bgcolor: alpha('#1a1a1a', 0.1),
              }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      {refreshing && <LinearProgress sx={{ mb: 3, borderRadius: 1, bgcolor: alpha('#888', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#1a1a1a' } }} />}
      
      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}
      
      <Grid container spacing={4}>
        {/* Credit Card - Fixed height */}
        <Grid item xs={12} md={4}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CreditCard 
            creditAmount={creditAmount} 
            creditCurrency={creditCurrency} 
            isLoading={loading} 
            username={userProfile?.name || currentUser?.email}
          />
          </Box>
        </Grid>
        
        {/* Exchange Requests Summary - Scrollable */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: alpha('#888', 0.2),
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            borderRadius: 2
          }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', color: '#1a1a1a' }}>
                    <SwapIcon sx={{ mr: 1, color: '#1a1a1a' }} />
                  Recent Exchanges
                </Typography>
                {exchangeRequests.length > 0 && (
                  <Chip 
                    label={`${exchangeRequests.length} ${exchangeRequests.length === 1 ? 'Request' : 'Requests'}`} 
                    size="small" 
                    variant="outlined" 
                      sx={{ 
                        color: '#1a1a1a', 
                        borderColor: alpha('#1a1a1a', 0.3) 
                      }}
                  />
                )}
                </Box>
              }
              sx={{ pb: 0 }}
            />
            
            {/* Search Bar */}
            <Box sx={{ px: 2, pt: 1, pb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search exchanges..."
                value={searchQuery}
                onChange={handleSearch}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: '#888' }} />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 2,
                    bgcolor: alpha('#000', 0.02),
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha('#888', 0.2),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha('#888', 0.3),
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1a1a1a',
                    }
                  }
                }}
              />
              </Box>
              
            <CardContent sx={{ flex: 1, overflowY: 'auto', px: 2, pt: 0 }}>
              {filteredExchanges.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center', bgcolor: alpha('#f8f8f8', 0.5), borderRadius: 2 }}>
                  {searchQuery ? (
                    <Typography variant="body1" color="#555" gutterBottom>
                      No exchanges match your search.
                    </Typography>
                  ) : (
                    <>
                      <Typography variant="body1" color="#555" gutterBottom>
                    You haven't submitted any exchange requests yet.
                  </Typography>
                  <Button
                    variant="outlined"
                        sx={{
                          mt: 2,
                          color: '#1a1a1a',
                          borderColor: '#1a1a1a',
                          '&:hover': {
                            borderColor: '#000',
                            bgcolor: alpha('#000', 0.02)
                          }
                        }}
                    startIcon={<AddIcon />}
                    component={Link}
                    to="/exchange/new"
                  >
                    Create Your First Exchange
                  </Button>
                    </>
                  )}
                </Box>
              ) : (
                <Stack spacing={2}>
                  {filteredExchanges.map((request) => (
                    <Paper 
                      key={request.id} 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: alpha('#888', 0.2),
                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: alpha('#1a1a1a', 0.3),
                          boxShadow: `0 8px 16px ${alpha('#000', 0.08)}`,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <Grid container spacing={2}>
                        {/* Product Image */}
                        <Grid item xs={3} sm={2}>
                          <Box 
                            sx={{ 
                              width: '100%', 
                              aspectRatio: '1/1',
                              borderRadius: 1.5,
                              overflow: 'hidden',
                              bgcolor: alpha('#f5f5f5', 0.8),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid',
                              borderColor: alpha('#888', 0.1),
                              boxShadow: `inset 0 0 0 1px ${alpha('#fff', 0.4)}`
                            }}
                          >
                            {request.productImage ? (
                              <img 
                                src={request.productImage} 
                                alt={request.productName} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <InventoryIcon sx={{ opacity: 0.4, color: '#555' }} />
                            )}
                          </Box>
                        </Grid>
                        
                        {/* Product Info */}
                        <Grid item xs={9} sm={10}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: '#1a1a1a' }}>
                            {request.productName}
                          </Typography>
                              <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
                            {new Date(request.createdAt).toLocaleDateString()} • {request.brand}
                          </Typography>
                        </Box>
                        <StatusChip status={request.status} />
                      </Box>
                      
                          {/* Notification Component */}
                          <ExchangeNotification 
                            status={request.status} 
                            transitStatus={request.transitStatus} 
                        />
                      
                      {request.status === 'approved' && request.creditAmount > 0 && (
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1a1a1a', mt: 1 }}>
                          Credit: ₹{request.creditAmount.toFixed(2)}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button
                          size="small"
                          component={Link}
                          to={`/exchange/${request.id}`}
                          endIcon={<ArrowForwardIcon />}
                              sx={{
                                color: '#1a1a1a',
                                '&:hover': {
                                  bgcolor: alpha('#1a1a1a', 0.05)
                                }
                              }}
                          >
                          View Details
                        </Button>
                      </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
            
            {exchangeRequests.length > 5 && filteredExchanges.length > 0 && !searchQuery && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button
                  size="medium"
                  component={Link}
                  to="/exchange"
                  variant="outlined"
                  sx={{
                    color: '#1a1a1a',
                    borderColor: alpha('#1a1a1a', 0.3),
                    '&:hover': {
                      borderColor: '#1a1a1a',
                      bgcolor: alpha('#1a1a1a', 0.02)
                    }
                  }}
                >
                  View All Requests
                </Button>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
} 