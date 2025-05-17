import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  TablePagination,
  useTheme,
  alpha
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

// Format date to local string
const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString();
};

// Format currency
const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null) return 'N/A';
  
  const currencySymbol = currency === 'INR' ? '₹' : 
                         currency === 'USD' ? '$' : 
                         currency === 'EUR' ? '€' : 
                         currency === 'GBP' ? '£' : currency;
  
  return `${currencySymbol}${parseFloat(amount).toFixed(2)}`;
};

export default function CreditHistoryTable() {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const [creditHistory, setCreditHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Fetch credit history
  useEffect(() => {
    const fetchCreditHistory = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = await currentUser.getIdToken();
        const response = await axios.get('/api/admin/credit-history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCreditHistory(response.data);
      } catch (error) {
        console.error('Error fetching credit history:', error);
        setError(error.response?.data?.error || 'Failed to load credit history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCreditHistory();
  }, [currentUser]);
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
    setPage(0); // Reset page when search changes
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Filter credit history based on search query
  const filteredHistory = creditHistory.filter(entry => {
    if (!searchQuery) return true;
    
    return (
      (entry.userId && entry.userId.toLowerCase().includes(searchQuery)) ||
      (entry.exchangeRequestId && entry.exchangeRequestId.toLowerCase().includes(searchQuery)) ||
      (entry.type && entry.type.toLowerCase().includes(searchQuery))
    );
  });
  
  // Paginate data
  const paginatedHistory = filteredHistory.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress sx={{ color: '#1a1a1a' }} />
      </Box>
    );
  }
  
  if (error) {
    return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;
  }
  
  return (
    <Paper elevation={0} sx={{ 
      width: '100%', 
      overflow: 'hidden',
      bgcolor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid',
      borderColor: alpha('#888', 0.2),
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
      borderRadius: 2
    }}>
      <Box sx={{ p: 2 }}>
        <TextField
          placeholder="Search by user ID or exchange ID"
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
          sx={{ mb: 2 }}
        />
        
        {filteredHistory.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: '#555' }}>
              No credit history found
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="credit history table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha('#f8f8f8', 0.7), color: '#1a1a1a' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha('#f8f8f8', 0.7), color: '#1a1a1a' }}>User ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha('#f8f8f8', 0.7), color: '#1a1a1a' }}>Exchange ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha('#f8f8f8', 0.7), color: '#1a1a1a' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha('#f8f8f8', 0.7), color: '#1a1a1a' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha('#f8f8f8', 0.7), color: '#1a1a1a' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedHistory.map((entry) => (
                    <TableRow key={entry.id} hover sx={{ 
                      '&:hover': {
                        bgcolor: alpha('#f5f5f5', 0.7)
                      }
                    }}>
                      <TableCell sx={{ color: '#555' }}>{formatDate(entry.createdAt)}</TableCell>
                      <TableCell sx={{ color: '#555' }}>{entry.userId || 'N/A'}</TableCell>
                      <TableCell sx={{ color: '#555' }}>{entry.exchangeRequestId || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          icon={<MoneyIcon />} 
                          label={entry.type === 'exchange_credit' ? 'Exchange Credit' : entry.type}
                          sx={{ 
                            bgcolor: alpha('#888', 0.1),
                            color: '#1a1a1a',
                            borderColor: alpha('#888', 0.3),
                            border: '1px solid'
                          }}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'medium', color: '#1a1a1a' }}>
                        {formatCurrency(entry.amount, entry.currency)}
                      </TableCell>
                      <TableCell>
                        {entry.loyaltyPointsSuccess ? (
                          <Chip 
                            size="small" 
                            icon={<CheckCircleIcon />} 
                            label="Success" 
                            variant="outlined"
                            sx={{ borderColor: '#4caf50', color: '#2e7d32' }}
                          />
                        ) : (
                          <Chip 
                            size="small" 
                            icon={<CancelIcon />} 
                            label="Failed" 
                            variant="outlined"
                            sx={{ borderColor: '#f44336', color: '#d32f2f' }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredHistory.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ 
                '.MuiTablePagination-select': {
                  color: '#1a1a1a'
                },
                '.MuiTablePagination-displayedRows': {
                  color: '#555'
                },
                '.MuiTablePagination-selectIcon': {
                  color: '#888'
                },
                '.MuiTablePagination-actions': {
                  color: '#1a1a1a'
                }
              }}
            />
          </>
        )}
      </Box>
    </Paper>
  );
} 