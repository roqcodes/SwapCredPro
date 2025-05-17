import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import {
  Typography,
  Container,
  Paper,
  Box,
  Button,
  Grid,
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Save as SaveIcon,
  LocalShipping as ShippingIcon,
  Money as MoneyIcon,
  Warehouse as WarehouseIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import ExchangeStatusStepper from '../../components/ExchangeStatusStepper';
import ImageGallery from '../../components/ImageGallery';

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

// Format condition text
const formatCondition = (condition) => {
  switch (condition) {
    case 'new': return 'New (with tags)';
    case 'like_new': return 'Like New (without tags)';
    case 'very_good': return 'Very Good (minimal wear)';
    case 'good': return 'Good (some signs of wear)';
    case 'fair': return 'Fair (visible wear)';
    case 'poor': return 'Poor (significant wear)';
    default: return condition;
  }
};

export default function AdminExchangeDetails() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exchange, setExchange] = useState(null);
  
  // Decision state
  const [status, setStatus] = useState('');
  const [adminFeedback, setAdminFeedback] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  
  // Credit state
  const [creditAmount, setCreditAmount] = useState('');
  const [creditFeedback, setCreditFeedback] = useState('');
  const [creditSubmitting, setCreditSubmitting] = useState(false);
  
  // Transit state
  const [transitNote, setTransitNote] = useState('');
  const [transitSubmitting, setTransitSubmitting] = useState(false);
  
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const fetchExchange = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = await currentUser.getIdToken();
      const response = await axios.get(`/api/admin/exchange-requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setExchange(response.data);
      setStatus(response.data.status);
      setAdminFeedback(response.data.adminFeedback || '');
      setCreditAmount(response.data.creditAmount > 0 ? response.data.creditAmount.toString() : '');
      
      // If the exchange already has a selected warehouse, set it
      if (response.data.warehouseId) {
        setSelectedWarehouseId(response.data.warehouseId);
      }
    } catch (error) {
      console.error('Error fetching exchange details:', error);
      setError(error.response?.data?.error || 'Failed to load exchange details');
    } finally {
      setLoading(false);
    }
  }, [id, currentUser]);
  
  // Fetch warehouses for selection
  const fetchWarehouses = useCallback(async () => {
    try {
      setWarehousesLoading(true);
      
      const token = await currentUser.getIdToken();
      const response = await axios.get('/api/admin/warehouses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Only include active warehouses
      const activeWarehouses = response.data.filter(w => w.isActive !== false);
      setWarehouses(activeWarehouses);
      
      // If there's only one warehouse, select it by default
      if (activeWarehouses.length === 1 && !selectedWarehouseId) {
        setSelectedWarehouseId(activeWarehouses[0].id);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      // Don't show this error to avoid confusion with the main error state
    } finally {
      setWarehousesLoading(false);
    }
  }, [currentUser, selectedWarehouseId]);
  
  useEffect(() => {
    fetchExchange();
  }, [fetchExchange]);
  
  useEffect(() => {
    // Only fetch warehouses when needed (when on the approval step)
    if (exchange && exchange.status === 'pending') {
      fetchWarehouses();
    }
  }, [exchange, fetchWarehouses]);
  
  const handleStatusUpdate = async () => {
    if (status === exchange.status) {
      return; // No change
    }
    
    // Validate warehouse selection when approving
    if (status === 'approved' && !selectedWarehouseId) {
      setError('Please select a warehouse for shipping the product');
      return;
    }
    
    try {
      setStatusSubmitting(true);
      setError('');
      
      const token = await currentUser.getIdToken();
      const response = await axios.put(
        `/api/admin/exchange-requests/${id}/status`,
        { 
          status, 
          adminFeedback,
          warehouseId: status === 'approved' ? selectedWarehouseId : undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setExchange(response.data);
      setStatus(response.data.status);
      setAdminFeedback(response.data.adminFeedback || '');
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.response?.data?.error || 'Failed to update status');
    } finally {
      setStatusSubmitting(false);
    }
  };
  
  const handleCreditAssignment = async () => {
    try {
      setCreditSubmitting(true);
      setError('');
      
      if (!creditAmount || isNaN(parseFloat(creditAmount)) || parseFloat(creditAmount) < 0) {
        setError('Please enter a valid credit amount');
        setCreditSubmitting(false);
        return;
      }
      
      // Round to an integer value for loyalty points
      const pointsToAssign = Math.round(parseFloat(creditAmount));
      
      const token = await currentUser.getIdToken();
      const response = await axios.put(
        `/api/admin/exchange-requests/${id}/credit`,
        { 
          creditAmount: pointsToAssign,
          additionalFeedback: creditFeedback
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setExchange(response.data);
      setCreditAmount(response.data.creditAmount.toString());
      setCreditFeedback('');
    } catch (error) {
      console.error('Error assigning loyalty points:', error);
      setError(error.response?.data?.error || 'Failed to assign loyalty points');
    } finally {
      setCreditSubmitting(false);
    }
  };
  
  const handleMarkAsReceived = async () => {
    try {
      setTransitSubmitting(true);
      setError('');
      
      const token = await currentUser.getIdToken();
      const response = await axios.put(
        `/api/admin/exchange-requests/${id}/transit`,
        { 
          transitStatus: 'received',
          adminNote: transitNote
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setExchange(response.data);
      setTransitNote('');
    } catch (error) {
      console.error('Error updating transit status:', error);
      setError(error.response?.data?.error || 'Failed to update transit status');
    } finally {
      setTransitSubmitting(false);
    }
  };
  
  const handleCompleteExchange = async () => {
    try {
      setStatusSubmitting(true);
      setError('');
      
      if (!exchange.creditAmount || exchange.creditAmount <= 0) {
        setError('You must assign credit before completing the exchange');
        setStatusSubmitting(false);
        return;
      }
      
      const token = await currentUser.getIdToken();
      const response = await axios.put(
        `/api/admin/exchange-requests/${id}/status`,
        { status: 'completed', adminFeedback: 'Exchange process completed.' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setExchange(response.data);
      setStatus(response.data.status);
    } catch (error) {
      console.error('Error completing exchange:', error);
      setError(error.response?.data?.error || 'Failed to complete exchange');
    } finally {
      setStatusSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      setSubmitting(true);
      setError('');
      
      const token = await currentUser.getIdToken();
      await axios.delete(`/api/admin/exchange-requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      navigate('/admin/exchange-requests');
    } catch (error) {
      console.error('Error deleting exchange:', error);
      setError(error.response?.data?.error || 'Failed to delete exchange');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (!exchange) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Alert severity="error">
            Exchange request not found or you don't have permission to view it.
          </Alert>
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              component={Link}
              to="/admin/dashboard"
            >
              Back to Dashboard
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          component={Link}
          to="/admin/exchange-requests"
          startIcon={<ArrowBackIcon />}
        >
          Back to Exchange Requests
        </Button>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            color="error"
            onClick={() => setConfirmDelete(true)}
            sx={{ mr: 1 }}
          >
            Delete
          </Button>
        </Box>
      </Box>
      
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this exchange request? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {submitting && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
        </Box>
      )}
      
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        {/* Status notifications at the top of the container */}
        {exchange.status === 'pending' && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#fff9c4', borderRadius: 1, borderLeft: '4px solid #ff9800' }}>
              <PendingIcon sx={{ color: '#ed6c02', mr: 1 }} />
              <Typography variant="body1" sx={{ color: '#ed6c02' }}>
                This exchange request is waiting for your review.
              </Typography>
            </Box>
          </Box>
        )}
        
        {exchange.status === 'approved' && !exchange.shippingDetails && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#e8f5e9', borderRadius: 1, borderLeft: '4px solid #4caf50' }}>
              <CheckCircleIcon sx={{ color: '#2e7d32', mr: 1 }} />
              <Typography variant="body1" sx={{ color: '#2e7d32' }}>
                This request has been approved. Waiting for customer to submit shipping details.
              </Typography>
            </Box>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Exchange Request
          </Typography>
          <StatusChip status={exchange.status} />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Request ID
                    </TableCell>
                    <TableCell>{exchange.id}</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Customer
                    </TableCell>
                    <TableCell>
                      {exchange.customerName || 'Unknown'} 
                      {exchange.customerEmail && <Box>({exchange.customerEmail})</Box>}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Status
                    </TableCell>
                    <TableCell>
                      <StatusChip status={exchange.status} />
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Submitted
                    </TableCell>
                    <TableCell>{new Date(exchange.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Last Updated
                    </TableCell>
                    <TableCell>{new Date(exchange.updatedAt).toLocaleString()}</TableCell>
                  </TableRow>
                  
                  {exchange.shippingDetails && (
                    <>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                          Shipping Carrier
                        </TableCell>
                        <TableCell>{exchange.shippingDetails.carrierName}</TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                          Tracking Number
                        </TableCell>
                        <TableCell>{exchange.shippingDetails.trackingNumber}</TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                          Shipping Date
                        </TableCell>
                        <TableCell>{new Date(exchange.shippingDetails.shippingDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    </>
                  )}
                  
                  {/* Show warehouse shipping address in table after shipping is complete */}
                  {exchange.shippingDetails && exchange.warehouseInfo && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Shipped To
                      </TableCell>
                      <TableCell>
                        {exchange.warehouseInfo.name}, {exchange.warehouseInfo.city}
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {exchange.creditAmount > 0 && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Assigned Loyalty Points
                      </TableCell>
                      <TableCell>₹{exchange.creditAmount}</TableCell>
                    </TableRow>
                  )}
                  
                  {exchange.totalLoyaltyPoints > 0 && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Total Loyalty Points
                      </TableCell>
                      <TableCell>₹{exchange.totalLoyaltyPoints}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 4 }}>
              <ImageGallery 
                images={exchange.images || []} 
                title="Product Images" 
                maxHeight={300}
                columns={3}
                emptyMessage="No product images provided"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Product Description
            </Typography>
            <Typography variant="body2" paragraph>
              {exchange.description}
            </Typography>
            
            {exchange.adminFeedback && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Admin Feedback
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                  <Typography variant="body2">
                    {exchange.adminFeedback}
                  </Typography>
                </Paper>
              </>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Exchange Process Timeline */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Exchange Process
        </Typography>
        
        {exchange.status === 'pending' ? (
          <Box sx={{ mt: 2 }}>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <RadioGroup
                row
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <FormControlLabel
                  value="approved"
                  control={<Radio />}
                  label="Approve"
                />
                <FormControlLabel
                  value="declined"
                  control={<Radio />}
                  label="Decline"
                />
              </RadioGroup>
            </FormControl>
            
            {/* Warehouse selection - only show when approving */}
            {status === 'approved' && (
              <Box sx={{ mb: 3, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarehouseIcon sx={{ mr: 1 }} />
                  Select Warehouse for Shipping
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  The customer will be instructed to ship their product to this warehouse address.
                </Typography>
                
                <FormControl 
                  fullWidth
                  required
                  error={status === 'approved' && !selectedWarehouseId}
                >
                  <InputLabel id="warehouse-select-label">Warehouse</InputLabel>
                  <Select
                    labelId="warehouse-select-label"
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    label="Warehouse"
                    disabled={warehousesLoading}
                  >
                    {warehouses.length === 0 ? (
                      <MenuItem disabled value="">
                        {warehousesLoading ? 'Loading warehouses...' : 'No warehouses available'}
                      </MenuItem>
                    ) : (
                      warehouses.map(warehouse => (
                        <MenuItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} - {warehouse.city}, {warehouse.state}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {status === 'approved' && !selectedWarehouseId && (
                    <FormHelperText error>Required for approval</FormHelperText>
                  )}
                </FormControl>
                
                {warehouses.length === 0 && !warehousesLoading && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="warning">
                      <Typography variant="body2">
                        You need to add a warehouse first. Go to the Warehouse Manager in the Admin Dashboard.
                      </Typography>
                      <Button
                        size="small"
                        component={Link}
                        to="/admin/dashboard?tab=5"
                        sx={{ mt: 1 }}
                      >
                        Go to Warehouse Manager
                      </Button>
                    </Alert>
                  </Box>
                )}
              </Box>
            )}
            
            <TextField
              label="Admin Feedback"
              multiline
              rows={3}
              fullWidth
              value={adminFeedback}
              onChange={(e) => setAdminFeedback(e.target.value)}
              variant="outlined"
              placeholder="Provide feedback to the customer"
              sx={{ mb: 2 }}
            />
            
            <Button
              variant="contained"
              color="primary"
              startIcon={statusSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleStatusUpdate}
              disabled={statusSubmitting || status === exchange.status}
            >
              Submit Decision
            </Button>
          </Box>
        ) : (
          <>
            <ExchangeStatusStepper 
              exchange={exchange} 
              isAdmin={true}
              onReceiveClick={() => {
                if (exchange.shippingDetails && exchange.transitStatus !== 'received') {
                  handleMarkAsReceived();
                }
              }}
              onCreditClick={() => {
                if (exchange.transitStatus === 'received' && !exchange.creditAmount) {
                  // Open credit assignment forms by focusing on those fields
                  const creditField = document.getElementById('credit-amount-field');
                  if (creditField) creditField.focus();
                }
              }}
              onCompleteClick={() => {
                if (exchange.transitStatus === 'received' && exchange.creditAmount > 0) {
                  handleCompleteExchange();
                }
              }}
            />
            
            {/* Transit Status Form - only show for received or shipped items with shipping details */}
            {exchange.status === 'approved' && 
            exchange.shippingDetails && 
            exchange.transitStatus !== 'received' && (
              <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Mark as Received
                </Typography>
                
                <TextField
                  label="Notes (Optional)"
                  fullWidth
                  value={transitNote}
                  onChange={(e) => setTransitNote(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={transitSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                  onClick={handleMarkAsReceived}
                  disabled={transitSubmitting}
                >
                  Mark as Received
                </Button>
              </Box>
            )}
            
            {/* Credit Assignment Form - only show when received and no credit assigned yet */}
            {exchange.status === 'approved' && 
            exchange.transitStatus === 'received' && 
            !exchange.creditAmount && (
              <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Assign Loyalty Points
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  The loyalty points you assign will be added to the customer's existing points balance in Shopify.
                </Typography>
                
                <TextField
                  id="credit-amount-field"
                  label="Loyalty Points to Add (₹)"
                  type="number"
                  fullWidth
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0, step: "1" } }}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  label="Points Assignment Note (Optional)"
                  fullWidth
                  value={creditFeedback}
                  onChange={(e) => setCreditFeedback(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={creditSubmitting ? <CircularProgress size={20} color="inherit" /> : <MoneyIcon />}
                  onClick={handleCreditAssignment}
                  disabled={creditSubmitting}
                >
                  Assign Loyalty Points
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>
      
      {/* Completed Exchange Info */}
      {exchange.status === 'completed' && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: 'success.light' }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'success.dark' }}>
            Exchange Completed Successfully
          </Typography>
          <Typography variant="body1" sx={{ color: 'success.dark' }}>
            This exchange has been successfully completed. The customer has been assigned ₹{exchange.creditAmount.toFixed(2)} in store credit.
          </Typography>
        </Paper>
      )}
      
      {/* Warehouse Information - Only show when needed */}
      {exchange.status === 'approved' && exchange.warehouseInfo && !exchange.shippingDetails && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Customer Ships To This Address
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {exchange.warehouseInfo.name}
              </Typography>
              <Typography variant="body2">
                {exchange.warehouseInfo.addressLine1}
              </Typography>
              {exchange.warehouseInfo.addressLine2 && (
                <Typography variant="body2">
                  {exchange.warehouseInfo.addressLine2}
                </Typography>
              )}
              <Typography variant="body2">
                {exchange.warehouseInfo.city}, {exchange.warehouseInfo.state} {exchange.warehouseInfo.postalCode}
              </Typography>
              <Typography variant="body2">
                {exchange.warehouseInfo.country}
              </Typography>
            </Grid>
            
            {(exchange.warehouseInfo.contactPerson || exchange.warehouseInfo.contactPhone) && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Contact Information
                </Typography>
                {exchange.warehouseInfo.contactPerson && (
                  <Typography variant="body2">
                    {exchange.warehouseInfo.contactPerson}
                  </Typography>
                )}
                {exchange.warehouseInfo.contactPhone && (
                  <Typography variant="body2">
                    {exchange.warehouseInfo.contactPhone}
                  </Typography>
                )}
              </Grid>
            )}
          </Grid>
        </Paper>
      )}
    </Container>
  );
} 