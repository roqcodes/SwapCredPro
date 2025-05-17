import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import {
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

export default function WarehouseManager() {
  const { currentUser } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    contactPerson: '',
    contactPhone: '',
    isActive: true
  });
  
  const fetchWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = await currentUser.getIdToken();
      const response = await axios.get('/api/admin/warehouses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setWarehouses(response.data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      setError(error.response?.data?.error || 'Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);
  
  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);
  
  const handleOpenDialog = (warehouse = null) => {
    if (warehouse) {
      setEditWarehouse(warehouse);
      setFormData({
        name: warehouse.name || '',
        addressLine1: warehouse.addressLine1 || '',
        addressLine2: warehouse.addressLine2 || '',
        city: warehouse.city || '',
        state: warehouse.state || '',
        postalCode: warehouse.postalCode || '',
        country: warehouse.country || '',
        contactPerson: warehouse.contactPerson || '',
        contactPhone: warehouse.contactPhone || '',
        isActive: warehouse.isActive !== false // Default to true if not specified
      });
    } else {
      setEditWarehouse(null);
      setFormData({
        name: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        contactPerson: '',
        contactPhone: '',
        isActive: true
      });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditWarehouse(null);
  };
  
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['name', 'addressLine1', 'city', 'state', 'postalCode', 'country'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    try {
      setFormSubmitting(true);
      setError('');
      
      const token = await currentUser.getIdToken();
      
      if (editWarehouse) {
        // Update existing warehouse
        await axios.put(
          `/api/admin/warehouses/${editWarehouse.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new warehouse
        await axios.post(
          '/api/admin/warehouses',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      await fetchWarehouses();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving warehouse:', error);
      setError(error.response?.data?.error || 'Failed to save warehouse');
    } finally {
      setFormSubmitting(false);
    }
  };
  
  const handleDelete = async (warehouseId) => {
    try {
      setFormSubmitting(true);
      setError('');
      
      const token = await currentUser.getIdToken();
      await axios.delete(`/api/admin/warehouses/${warehouseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchWarehouses();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      setError(error.response?.data?.error || 'Failed to delete warehouse');
    } finally {
      setFormSubmitting(false);
    }
  };
  
  if (loading && warehouses.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Warehouse Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Warehouse
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {warehouses.length === 0 ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            No warehouses have been added yet.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Your First Warehouse
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.paper' }}>
                <TableCell width="25%" sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell width="45%" sx={{ fontWeight: 'bold' }}>Address</TableCell>
                <TableCell width="15%" sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                <TableCell width="15%" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {warehouses.map((warehouse) => (
                <TableRow key={warehouse.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {warehouse.name}
                      </Typography>
                      {warehouse.isActive && (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Active"
                          size="small"
                          color="success"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {warehouse.addressLine1}
                      {warehouse.addressLine2 && `, ${warehouse.addressLine2}`}
                    </Typography>
                    <Typography variant="body2">
                      {warehouse.city}, {warehouse.state} {warehouse.postalCode}, {warehouse.country}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {warehouse.contactPerson && (
                      <Typography variant="body2">
                        {warehouse.contactPerson}
                      </Typography>
                    )}
                    {warehouse.contactPhone && (
                      <Typography variant="body2">
                        {warehouse.contactPhone}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="Edit warehouse">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(warehouse)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete warehouse">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteConfirm(warehouse.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Add/Edit Warehouse Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
          <IconButton edge="end" onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Warehouse Name"
                  value={formData.name}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="addressLine1"
                  label="Address Line 1"
                  value={formData.addressLine1}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="addressLine2"
                  label="Address Line 2 (Optional)"
                  value={formData.addressLine2}
                  onChange={handleFormChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="city"
                  label="City"
                  value={formData.city}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="state"
                  label="State/Province"
                  value={formData.state}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="postalCode"
                  label="Postal Code"
                  value={formData.postalCode}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="country"
                  label="Country"
                  value={formData.country}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="contactPerson"
                  label="Contact Person (Optional)"
                  value={formData.contactPerson}
                  onChange={handleFormChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="contactPhone"
                  label="Contact Phone (Optional)"
                  value={formData.contactPhone}
                  onChange={handleFormChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={formSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSubmit}
            disabled={formSubmitting}
            startIcon={formSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {editWarehouse ? 'Update Warehouse' : 'Add Warehouse'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this warehouse? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)} disabled={formSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => handleDelete(deleteConfirm)}
            disabled={formSubmitting}
            startIcon={formSubmitting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 