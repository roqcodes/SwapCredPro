import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import {
  Typography,
  Container,
  Box,
  Button,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Badge,
  Avatar,
  Tooltip,
  IconButton,
  LinearProgress,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Search as SearchIcon,
  LocalShipping as ShippingIcon,
  CreditCard as CreditCardIcon,
  Image as ImageIcon,
  Warehouse as WarehouseIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import CreditHistoryTable from '../../components/admin/CreditHistoryTable';
import WarehouseManager from '../../components/admin/WarehouseManager';

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

// Transit status chip component
const TransitStatusChip = ({ status, hasShippingDetails, tabValue }) => {
  // For the Awaiting Shipping tab (tab 1), always show the "Awaiting Shipping" status
  if (tabValue === 1) {
    return <Chip icon={<ShippingIcon />} label="Awaiting Shipping" color="warning" size="small" sx={{ bgcolor: 'white', borderColor: '#ff9800', color: '#ff9800' }} />;
  }
  
  // For other tabs, show the appropriate status
  if (status === 'shipping') {
    return <Chip icon={<ShippingIcon />} label="Shipped" color="info" size="small" sx={{ bgcolor: 'white', borderColor: '#2196f3', color: '#2196f3' }} />;
  }
  if (status === 'received') {
    return <Chip icon={<CheckCircleIcon />} label="Received" color="success" size="small" sx={{ bgcolor: 'white', borderColor: '#4caf50', color: '#4caf50' }} />;
  }
  if (status === 'inspecting') {
    return <Chip icon={<CheckCircleIcon />} label="Inspecting" color="success" size="small" sx={{ bgcolor: 'white', borderColor: '#4caf50', color: '#4caf50' }} />;
  }
  if (hasShippingDetails === false) {
    return <Chip icon={<ShippingIcon />} label="Awaiting Shipping" color="warning" size="small" sx={{ bgcolor: 'white', borderColor: '#ff9800', color: '#ff9800' }} />;
  }
  return null;
};

// Format condition text
const formatCondition = (condition) => {
  switch (condition) {
    case 'new': return 'New';
    case 'like_new': return 'Like New';
    case 'very_good': return 'Very Good';
    case 'good': return 'Good';
    case 'fair': return 'Fair';
    case 'poor': return 'Poor';
    default: return condition;
  }
};

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  
    const fetchExchanges = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = await currentUser.getIdToken();
        const response = await axios.get('/api/admin/exchange-requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setExchanges(response.data);
      } catch (error) {
        console.error('Error fetching exchanges:', error);
        setError(error.response?.data?.error || 'Failed to load exchange requests');
      } finally {
        setLoading(false);
      setRefreshing(false);
      }
    };
    
  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchExchanges();
  };
  
  // Fetch exchange requests once when component mounts
  useEffect(() => {
    fetchExchanges();
  }, [currentUser]);
  
  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);
  
  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value.toLowerCase());
  }, []);
  
  // Memoized filtered exchanges based on tab and search query
  const filteredExchanges = useMemo(() => {
    // First determine status and transit status filters based on tab
    let filters;
    switch (tabValue) {
      case 0: // Pending
        filters = { status: 'pending' };
        break;
      case 1: // Approved but not yet shipped
        filters = { status: 'approved', notShipped: true };
        break;
      case 2: // On Transit
        filters = { status: 'approved', hasShipping: true };
        break;
      case 3: // Received
        filters = { status: 'approved', transitStatus: 'received' };
        break;
      case 4: // Credit History (no filtering needed here)
      case 5: // Warehouse Manager (no filtering needed here)
        return [];
      default:
        filters = { status: 'pending' };
    }
    
    // Apply filters
    let filtered = exchanges.filter(exchange => {
      // Check status match
      if (filters.status && exchange.status !== filters.status) return false;
      
      // For Approved tab but not yet shipped
      if (filters.notShipped && exchange.shippingDetails) {
        return false;
      }
      
      // For On Transit tab, include all approved exchanges with shipping details
      // or with transit status
      if (filters.hasShipping) {
        if (!exchange.shippingDetails) {
          return false;
        }
        // Don't include received items in the On Transit tab
        if (exchange.transitStatus === 'received') {
          return false;
        }
      }
      
      if (filters.transitStatus && exchange.transitStatus !== filters.transitStatus) {
        return false;
      }
      
      // Apply search filter
      if (searchQuery) {
        return (
          exchange.productName.toLowerCase().includes(searchQuery) || 
          exchange.brand.toLowerCase().includes(searchQuery) || 
          exchange.userEmail.toLowerCase().includes(searchQuery)
        );
      }
      
      return true;
    });
    
    return filtered;
  }, [exchanges, tabValue, searchQuery]);

  // Count requests in each category for tab labels
  const requestCounts = useMemo(() => {
    const pending = exchanges.filter(e => e.status === 'pending').length;
    const onTransit = exchanges.filter(e => 
      e.status === 'approved' && 
      e.shippingDetails && 
      e.transitStatus !== 'received'
    ).length;
    const received = exchanges.filter(e => 
      e.status === 'approved' && 
      e.transitStatus === 'received'
    ).length;
    
    // Count approved requests with no shipping details yet
    const approved = exchanges.filter(e => 
      e.status === 'approved' && 
      !e.shippingDetails
    ).length;
    
    return { pending, approved, onTransit, received };
  }, [exchanges]);
  
  if (loading && !refreshing) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress sx={{ color: '#1a1a1a' }} />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 'bold',
          backgroundImage: 'linear-gradient(45deg, #1a1a1a, #888)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textFillColor: 'transparent',
        }}>
        Admin Dashboard
      </Typography>
        
        <Tooltip title="Refresh Data">
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
        </Tooltip>
      </Box>
      
      {refreshing && <LinearProgress sx={{ mb: 3, borderRadius: 1, bgcolor: alpha('#888', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#1a1a1a' } }} />}
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Paper elevation={0} sx={{ 
        mb: 4, 
        overflow: 'hidden',
        bgcolor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: alpha('#888', 0.2),
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        borderRadius: 2
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: alpha('#888', 0.2),
            '& .MuiTab-root': {
              py: 2,
              color: '#555'
            },
            '& .Mui-selected': {
              color: '#1a1a1a !important'
            },
            '& .MuiTabs-indicator': {
              bgcolor: '#1a1a1a'
            }
          }}
        >
          <Tab 
            label={
              <Badge badgeContent={requestCounts.pending} color="warning" showZero={false}
                sx={{ '& .MuiBadge-badge': { bgcolor: '#888', color: 'white' } }}
              >
                Pending Requests
              </Badge>
            } 
            id="tab-0" 
          />
          <Tab 
            label={
              <Badge badgeContent={requestCounts.approved} color="success" showZero={false}
                sx={{ '& .MuiBadge-badge': { bgcolor: '#1a1a1a', color: 'white' } }}
              >
                Approved (Awaiting Shipping)
              </Badge>
            } 
            id="tab-1" 
          />
          <Tab 
            label={
              <Badge badgeContent={requestCounts.onTransit} color="info" showZero={false}
                sx={{ '& .MuiBadge-badge': { bgcolor: '#555', color: 'white' } }}
              >
                In Transit
              </Badge>
            } 
            id="tab-2" 
          />
          <Tab 
            label={
              <Badge badgeContent={requestCounts.received} color="success" showZero={false}
                sx={{ '& .MuiBadge-badge': { bgcolor: '#1a1a1a', color: 'white' } }}
              >
                Received (Pending Credit)
              </Badge>
            } 
            id="tab-3" 
          />
          <Tab 
            label="Credit History"
            icon={<CreditCardIcon />}
            iconPosition="start"
            id="tab-4" 
          />
          <Tab 
            label="Warehouse Manager"
            icon={<WarehouseIcon />}
            iconPosition="start"
            id="tab-5" 
          />
        </Tabs>
        
        {/* Search field for exchange requests only */}
        {tabValue < 4 && (
          <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: alpha('#888', 0.2),
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <TextField
              placeholder="Search by product name, brand, or user email"
              variant="outlined"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
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
        )}
        
        {/* Credit History Tab Content */}
        {tabValue === 4 ? (
          <Box sx={{ p: 0 }}>
            <CreditHistoryTable />
          </Box>
        ) : tabValue === 5 ? (
          <Box>
          <Box sx={{ p: 3 }}>
            <WarehouseManager />
            </Box>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader aria-label="exchange requests table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha('#f8f8f8', 0.7), color: '#1a1a1a' }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha('#f8f8f8', 0.7), color: '#1a1a1a' }}>Brand</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha('#f8f8f8', 0.7), color: '#1a1a1a' }}>Condition</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha('#f8f8f8', 0.7), color: '#1a1a1a' }}>User Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha('#f8f8f8', 0.7), color: '#1a1a1a' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha('#f8f8f8', 0.7), color: '#1a1a1a' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha('#f8f8f8', 0.7), color: '#1a1a1a' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExchanges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" sx={{ color: '#555' }}>
                        No exchange requests found in this category
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExchanges.map((exchange) => (
                    <TableRow key={exchange.id} hover sx={{ 
                      '&:hover': {
                        bgcolor: alpha('#f5f5f5', 0.7)
                      }
                    }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {exchange.images && exchange.images.length > 0 ? (
                            <Tooltip title="View images" arrow>
                              <Avatar 
                                src={exchange.images[0].url} 
                                variant="rounded"
                                sx={{ width: 40, height: 40, mr: 1.5 }}
                              />
                            </Tooltip>
                          ) : (
                            <Avatar 
                              variant="rounded" 
                              sx={{ width: 40, height: 40, mr: 1.5, bgcolor: alpha('#f5f5f5', 0.8) }}
                            >
                              <ImageIcon fontSize="small" sx={{ color: '#555' }} />
                            </Avatar>
                          )}
                          <Typography variant="body2" sx={{ color: '#1a1a1a' }}>
                            {exchange.productName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#555' }}>{exchange.brand}</TableCell>
                      <TableCell sx={{ color: '#555' }}>{formatCondition(exchange.condition)}</TableCell>
                      <TableCell sx={{ color: '#555' }}>{exchange.userEmail}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {/* Only show status chip for pending tab (tab 0) */}
                          {tabValue === 0 && (
                            <StatusChip status={exchange.status} />
                          )}
                          
                          {/* For approved (awaiting shipping) tab, show only awaiting shipping status */}
                          {tabValue === 1 && (
                            <TransitStatusChip 
                              status={exchange.transitStatus} 
                              hasShippingDetails={!!exchange.shippingDetails}
                              tabValue={tabValue}
                            />
                          )}
                          
                          {/* For in transit tab, show only transit status */}
                          {tabValue === 2 && exchange.transitStatus && (
                            <TransitStatusChip 
                              status={exchange.transitStatus} 
                              hasShippingDetails={!!exchange.shippingDetails}
                              tabValue={tabValue}
                            />
                          )}
                          
                          {/* For received tab, show only received status */}
                          {tabValue === 3 && exchange.transitStatus && (
                            <TransitStatusChip 
                              status={exchange.transitStatus} 
                              hasShippingDetails={!!exchange.shippingDetails}
                              tabValue={tabValue}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#555' }}>{new Date(exchange.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          component={Link}
                          to={`/admin/exchange/${exchange.id}`}
                          sx={{
                            bgcolor: '#1a1a1a',
                            color: '#fff',
                            '&:hover': {
                              bgcolor: '#333',
                            },
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
} 