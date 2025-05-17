import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Typography, 
  Container, 
  Paper, 
  Box, 
  Button, 
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Card,
  CardMedia
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  DeleteOutline as DeleteIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import ButtonLoader from '../components/ui/ButtonLoader';

const conditionOptions = [
  { value: 'new', label: 'New (with tags)' },
  { value: 'like_new', label: 'Like New (without tags)' },
  { value: 'very_good', label: 'Very Good (minimal wear)' },
  { value: 'good', label: 'Good (some signs of wear)' },
  { value: 'fair', label: 'Fair (visible wear)' },
  { value: 'poor', label: 'Poor (significant wear)' }
];

// Direct Cloudinary upload constants
const CLOUDINARY_CLOUD_NAME = 'dqduze7ep';
const CLOUDINARY_UPLOAD_PRESET = 'SWAPCRED';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export default function ExchangeForm() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    productName: '',
    brand: '',
    description: '',
    condition: '',
    images: []
  });
  
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setImageUploading(true);
      setUploadError('');
      
      // Only upload up to 5 images
      const filesToUpload = Array.from(files).slice(0, 5 - formData.images.length);
      
      for (const file of filesToUpload) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setUploadError(`File ${file.name} is too large. Max size is 5MB`);
          continue;
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
          setUploadError(`File ${file.name} is not an image`);
          continue;
        }
        
        // Create form data for direct Cloudinary upload
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('upload_preset', "SWAPCRED");
        uploadData.append('cloud_name', "dqduze7ep");
        
        // Direct upload to Cloudinary
        console.log('Uploading directly to Cloudinary...');
        const response = await axios.post(CLOUDINARY_UPLOAD_URL, uploadData, {
          headers: { 
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('Cloudinary response:', response.data);
        
        if (response.data && response.data.secure_url) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, {
              url: response.data.secure_url,
              publicId: response.data.public_id
            }]
          }));
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error.response?.data?.error?.message || error.message || 'Failed to upload image. Please try again.');
    } finally {
      setImageUploading(false);
      // Reset the file input
      e.target.value = null;
    }
  };
  
  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.productName || !formData.brand || !formData.description || !formData.condition) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Add validation for images
    if (formData.images.length === 0) {
      setError('Please upload at least one image of the product');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const token = await currentUser.getIdToken();
      
      const response = await axios.post('/api/exchange', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Navigate to the exchange detail page
      navigate(`/exchange/${response.data.id}`);
    } catch (error) {
      console.error('Error submitting exchange request:', error);
      setError(error.response?.data?.error || 'Failed to submit exchange request');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Request a Product Exchange
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Please provide details about the product you'd like to exchange for store credit.
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Product Name"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                placeholder="e.g. Women's Summer Dress"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                placeholder="e.g. Zara"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
              >
                {conditionOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                multiline
                rows={4}
                placeholder="Describe the product including size, color, material, and any other relevant details"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Product Images <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload up to 5 clear photos of your product showing its condition (Max 5MB each)
              </Typography>
              
              {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="image-upload-input"
                  disabled={formData.images.length >= 5 || imageUploading}
                />
                <label htmlFor="image-upload-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    disabled={formData.images.length >= 5 || imageUploading}
                  >
                    {imageUploading ? 'Uploading...' : 'Upload Images'}
                  </Button>
                </label>
                {imageUploading && <ButtonLoader size={24} sx={{ ml: 2 }} />}
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                  {formData.images.length === 0 ? (
                    <Box component="span" sx={{ color: 'error.main' }}>
                      At least one image required
                    </Box>
                  ) : (
                    `${formData.images.length}/5 images`
                  )}
                </Typography>
              </Box>
              
              {formData.images.length > 0 && (
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                  {formData.images.map((image, index) => (
                    <Card key={index} sx={{ width: 100, position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="100"
                        image={image.url}
                        alt={`Product image ${index + 1}`}
                        sx={{ objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Card>
                  ))}
                </Stack>
              )}
              
              {formData.images.length === 0 && (
                <Box 
                  sx={{ 
                    border: '1px dashed #ccc', 
                    borderRadius: 1, 
                    p: 3, 
                    textAlign: 'center',
                    color: 'text.secondary'
                  }}
                >
                  <ImageIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
                  <Typography variant="body2">
                    No images uploaded yet
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || imageUploading || formData.images.length === 0}
            >
              {loading ? <ButtonLoader /> : 'Submit Request'}
            </Button>
          </Box>
        </form>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ bgcolor: '#f5f5f5', p: 3, borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            What happens next?
          </Typography>
          
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>Our team will review your exchange request</li>
            <li>If approved, you'll receive instructions to ship your item</li>
            <li>Once we receive and verify the product, we'll add credit to your account</li>
            <li>You can use your credit on your next purchase</li>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
} 