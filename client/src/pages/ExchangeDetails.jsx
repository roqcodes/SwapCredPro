import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import ImageGallery from '../components/ImageGallery';
import { 
  Typography, 
  Container, 
  Paper, 
  Box, 
  Button, 
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  colors
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  CreditCard as CreditCardIcon,
  Delete as DeleteIcon,
  LocalShipping as ShippingIcon,
  ReceiptLong as ReceiptIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import ExchangeStatusStepper from '../components/ExchangeStatusStepper';

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

export default function ExchangeDetails() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exchange, setExchange] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Shipping details state
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [carrierName, setCarrierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingDate, setShippingDate] = useState('');
  const [shippingNotes, setShippingNotes] = useState('');
  const [shippingSubmitting, setShippingSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchExchange = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = await currentUser.getIdToken();
        const response = await axios.get(`/api/exchange/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setExchange(response.data);
        
        // Pre-fill shipping form if available
        const shippingDetails = response.data.shippingDetails;
        if (shippingDetails) {
          setCarrierName(shippingDetails.carrierName || '');
          setTrackingNumber(shippingDetails.trackingNumber || '');
          
          // Fix date handling to ensure valid date
          let formattedDate = '';
          try {
            const dateObject = shippingDetails.shippingDate ? new Date(shippingDetails.shippingDate) : null;
            if (dateObject && !isNaN(dateObject.getTime())) {
              formattedDate = dateObject.toISOString().split('T')[0];
            } else {
              console.log('Invalid or missing shipping date, using empty string');
            }
          } catch (dateError) {
            console.error('Error formatting shipping date:', dateError);
          }
          
          setShippingDate(formattedDate);
          setShippingNotes(shippingDetails.notes || '');
        }
      } catch (error) {
        console.error('Error fetching exchange details:', error);
        setError(error.response?.data?.error || 'Failed to load exchange details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExchange();
  }, [id, currentUser]);
  
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      
      const token = await currentUser.getIdToken();
      await axios.delete(`/api/exchange/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting exchange request:', error);
      setError(error.response?.data?.error || 'Failed to delete exchange request');
      setConfirmDelete(false);
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    
    if (!carrierName || !trackingNumber || !shippingDate) {
      setError('Please fill in all required shipping fields');
      return;
    }
    
    try {
      setShippingSubmitting(true);
      setError('');
      
      const token = await currentUser.getIdToken();
      const response = await axios.post(
        `/api/exchange/${id}/shipping`,
        {
          carrierName,
          trackingNumber,
          shippingDate,
          notes: shippingNotes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setExchange(response.data);
      setShowShippingForm(false);
    } catch (error) {
      console.error('Error submitting shipping details:', error);
      setError(error.response?.data?.error || 'Failed to submit shipping details');
    } finally {
      setShippingSubmitting(false);
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
              to="/dashboard"
            >
              Back to Dashboard
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/dashboard"
        >
          Back to Dashboard
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        {/* Status Notifications - Moved to top of container */}
        {exchange.status === 'pending' && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#fff9c4', borderRadius: 1, borderLeft: '4px solid #ff9800' }}>
              <PendingIcon sx={{ color: '#ed6c02', mr: 1 }} />
              <Typography variant="body1" sx={{ color: '#ed6c02' }}>
                Your exchange request is currently under review.
              </Typography>
            </Box>
          </Box>
        )}
        
        {exchange.status === 'declined' && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#ffebee', borderRadius: 1, borderLeft: '4px solid #f44336' }}>
              <CancelIcon sx={{ color: '#d32f2f', mr: 1 }} />
              <Typography variant="body1" sx={{ color: '#d32f2f' }}>
                Your exchange request has been declined. Please check the admin feedback.
              </Typography>
            </Box>
          </Box>
        )}
        
        {/* Shipping prompt for approved exchanges - Now at the top */}
        {exchange.status === 'approved' && !exchange.shippingDetails && !showShippingForm && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: '#ff', borderRadius: 1, border: '2px solid #FFA500' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShippingIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="body1">
                  Your Exchange Request is Approved! Now add the shipping details.
                </Typography>
              </Box>
              <Button
                size="small"
                variant="contained"
                sx={{
                  backgroundColor: 'white',
                  color: 'white',
                  border: '1px solid #FFA500',
                  '&:hover': {
                    backgroundColor: '#FFA500',
                    color: 'white'
                  }
                }}
                startIcon={<ShippingIcon />}
                onClick={() => setShowShippingForm(true)}
              >
                Add Details
              </Button>
            </Box>
          </Box>
        )}
{/* Warehouse Information Section - Only show for approved exchanges before shipping */}
{exchange.status === 'approved' && exchange.warehouseInfo && !exchange.shippingDetails && (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3, bgcolor: '#f5f8ff' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon sx={{ color: 'info.main', mr: 1 }} />
            Ship To This Address
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {exchange.warehouseInfo.name}
                </Typography>
                <Typography variant="body1">
                  {exchange.warehouseInfo.addressLine1}
                </Typography>
                {exchange.warehouseInfo.addressLine2 && (
                  <Typography variant="body1">
                    {exchange.warehouseInfo.addressLine2}
                  </Typography>
                )}
                <Typography variant="body1">
                  {exchange.warehouseInfo.city}, {exchange.warehouseInfo.state} {exchange.warehouseInfo.postalCode}
                </Typography>
                <Typography variant="body1">
                  {exchange.warehouseInfo.country}
                </Typography>
              </Grid>
              
              {(exchange.warehouseInfo.contactPerson || exchange.warehouseInfo.contactPhone) && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Contact Information
                  </Typography>
                  {exchange.warehouseInfo.contactPerson && (
                    <Typography variant="body1">
                      {exchange.warehouseInfo.contactPerson}
                    </Typography>
                  )}
                  {exchange.warehouseInfo.contactPhone && (
                    <Typography variant="body1">
                      Phone: {exchange.warehouseInfo.contactPhone}
                    </Typography>
                  )}
                </Grid>
              )}
            </Grid>
            

          </Box>
        </Paper>
      )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Exchange Request
          </Typography>
          <StatusChip status={exchange.status} />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Product Name
                    </TableCell>
                    <TableCell>{exchange.productName}</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Brand
                    </TableCell>
                    <TableCell>{exchange.brand}</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Condition
                    </TableCell>
                    <TableCell>{formatCondition(exchange.condition)}</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Submitted
                    </TableCell>
                    <TableCell>{new Date(exchange.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                  
                  {exchange.status !== 'pending' && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Last Updated
                      </TableCell>
                      <TableCell>{new Date(exchange.updatedAt).toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                  
                  {/* Show shipping details in table if they exist */}
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
                  
                  {/* Show warehouse address in table if shipping is complete */}
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
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Product Description
            </Typography>
            <Typography variant="body1" paragraph>
              {exchange.description}
            </Typography>
            
            {/* Add Product Images */}
            <Box sx={{ mt: 3 }}>
              <ImageGallery 
                images={exchange.images || []} 
                title="Product Images" 
                maxHeight={300}
                columns={2}
                emptyMessage="No images available"
              />
            </Box>
            
            {exchange.status === 'approved' && exchange.creditAmount > 0 && (
              <Card sx={{ mt: 3, bgcolor: 'success.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CreditCardIcon sx={{ mr: 1, color: 'success.dark' }} />
                    <Typography variant="h6" component="div" sx={{ color: 'success.dark' }}>
                      Credit Assigned
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                    ₹{exchange.creditAmount.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            )}
            
            {exchange.adminFeedback && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Admin Feedback
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                  <Typography variant="body1">
                    {exchange.adminFeedback}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Grid>
        </Grid>
        
        {exchange.status === 'pending' && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            
            {confirmDelete ? (
              <Box sx={{ bgcolor: '#fff1f0', p: 3, borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Are you sure you want to cancel this exchange request?
                </Typography>
                <Typography variant="body2" paragraph>
                  This action cannot be undone.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleteLoading}
                  >
                    No, Keep Request
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
                  >
                    Yes, Cancel Request
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setConfirmDelete(true)}
                >
                  Cancel Request
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>
      
      
      
      {/* Exchange Process Timeline - for approved and completed exchanges */}
      {['approved', 'completed'].includes(exchange.status) && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Exchange Process
          </Typography>
          
          <ExchangeStatusStepper 
            exchange={exchange} 
            onShippingClick={() => setShowShippingForm(true)} 
          />

          {/* Show credit information inside the exchange process section when available */}
          {exchange.creditAmount > 0 && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ReceiptIcon sx={{ fontSize: 24, color: 'success.dark', mr: 1 }} />
                <Typography variant="subtitle1" color="success.dark" fontWeight="medium">
                  Credit Information
                </Typography>
              </Box>
              
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'success.dark', mb: 1 }}>
                ₹{exchange.creditAmount.toFixed(2)}
              </Typography>
              
              <Typography variant="body2" sx={{ color: 'success.dark' }}>
                This credit has been added to your account and can be used on your next purchase.
              </Typography>
              
              {exchange.totalShopifyCredit && (
                <Typography variant="body2" sx={{ mt: 1, color: 'success.dark' }}>
                  Total available store credit: ₹{exchange.totalShopifyCredit.toFixed(2)}
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      )}
      
      {/* Shipping Form Modal */}
      <Dialog 
        open={showShippingForm} 
        onClose={() => setShowShippingForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Submit Shipping Details
          <IconButton edge="end" onClick={() => setShowShippingForm(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Carrier Name"
                value={carrierName}
                onChange={(e) => setCarrierName(e.target.value)}
                fullWidth
                required
                margin="normal"
                placeholder="USPS, FedEx, UPS, etc."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Tracking Number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Shipping Date"
                type="date"
                value={shippingDate}
                onChange={(e) => setShippingDate(e.target.value)}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Additional Notes (Optional)"
                value={shippingNotes}
                onChange={(e) => setShippingNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowShippingForm(false)} 
            disabled={shippingSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleShippingSubmit}
            disabled={shippingSubmitting}
            startIcon={shippingSubmitting ? <CircularProgress size={20} color="inherit" /> : <ShippingIcon />}
          >
            Submit Shipping Details
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 