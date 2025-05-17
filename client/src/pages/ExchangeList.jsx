import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Typography, 
  Container, 
  Box, 
  Grid,
  CircularProgress,
  Alert,
  Stack,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Paper,
  Divider,
  IconButton,
  alpha,
  useTheme
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import ExchangeCard from '../components/ExchangeCard';

export default function ExchangeList() {
  const { currentUser } = useAuth();
  const [exchangeRequests, setExchangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  
  const theme = useTheme();
  const itemsPerPage = 10;
  
  useEffect(() => {
    fetchExchangeRequests();
  }, [currentUser]);
  
  const fetchExchangeRequests = async () => {
    try {
      setLoading(true);
      setError('');
      setRefreshing(true);
      
      const token = await currentUser.getIdToken();
      const response = await axios.get('/api/exchange', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setExchangeRequests(response.data);
    } catch (error) {
      console.error('Error fetching exchange requests:', error);
      setError('Failed to load your exchange requests. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to first page on search
  };
  
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1); // Reset to first page on filter change
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleRefresh = () => {
    fetchExchangeRequests();
  };
  
  // Filter and search exchanges
  const filteredExchanges = exchangeRequests.filter(exchange => {
    const matchesSearch = 
      exchange.productName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      exchange.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exchange.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || exchange.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Paginate exchanges
  const paginatedExchanges = filteredExchanges.slice(
    (page - 1) * itemsPerPage, 
    page * itemsPerPage
  );
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredExchanges.length / itemsPerPage);
  
  if (loading && !refreshing) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            component={Link} 
            to="/dashboard" 
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.primary.main
            }}
          >
            My Exchange Requests
          </Typography>
        </Box>
        
        <IconButton 
          onClick={handleRefresh}
          color="primary"
          sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
            }
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}
      
      {/* Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by product name, brand, or description"
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="declined">Declined</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Results count and info */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredExchanges.length > 0 ? (page - 1) * itemsPerPage + 1 : 0}-
          {Math.min(page * itemsPerPage, filteredExchanges.length)} of {filteredExchanges.length} requests
        </Typography>
      </Box>
      
      {/* Exchange list */}
      {filteredExchanges.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>No exchange requests found</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery || statusFilter !== 'all' 
              ? 'Try changing your search criteria or filters'
              : 'You have not created any exchange requests yet'}
          </Typography>
          
          <Button
            variant="contained"
            component={Link}
            to="/exchange/new"
            color="primary"
          >
            Create New Exchange Request
          </Button>
        </Paper>
      ) : (
        <>
          <Stack spacing={2} sx={{ mb: 4 }}>
            {paginatedExchanges.map(exchange => (
              <ExchangeCard key={exchange.id} exchange={exchange} />
            ))}
          </Stack>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
} 