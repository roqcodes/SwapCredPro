import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardActionArea,
  Modal,
  IconButton,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Image as ImageIcon
} from '@mui/icons-material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: '90vw',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 0,
  outline: 'none',
  borderRadius: 1,
  display: 'flex',
  flexDirection: 'column'
};

/**
 * Image Gallery Component
 * @param {Object} props
 * @param {Array} props.images - Array of image objects with url property
 * @param {string} props.title - Optional title for the gallery
 * @param {boolean} props.showTitle - Whether to show the title
 * @param {number} props.maxHeight - Maximum height of the gallery
 * @param {number} props.columns - Number of columns in the grid (xs size)
 * @param {string} props.emptyMessage - Message to show when there are no images
 */
const ImageGallery = ({ 
  images = [], 
  title = "Product Images", 
  showTitle = true,
  maxHeight = 300,
  columns = 3,
  emptyMessage = "No images available"
}) => {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleOpen = (index) => {
    setSelectedIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setSelectedIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  if (!images || images.length === 0) {
    return (
      <Box>
        {showTitle && (
          <Typography variant="subtitle1" gutterBottom>
            {title}
          </Typography>
        )}
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
            {emptyMessage}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {showTitle && (
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
      )}
      
      <Box sx={{ maxHeight: maxHeight, overflow: 'auto', mb: 2 }}>
        <Grid container spacing={1}>
          {images.map((image, index) => (
            <Grid item xs={12 / columns} key={index}>
              <Card>
                <CardActionArea onClick={() => handleOpen(index)}>
                  <CardMedia
                    component="img"
                    height={100}
                    image={image.url}
                    alt={`Product image ${index + 1}`}
                    sx={{ objectFit: 'cover' }}
                  />
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="image-modal-title"
      >
        <Paper sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1 }}>
            <img
              src={images[selectedIndex].url}
              alt={`Product view ${selectedIndex + 1}`}
              style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block' }}
            />
            
            {images.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrev}
                  sx={{
                    position: 'absolute',
                    left: 8,
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                  }}
                >
                  <PrevIcon />
                </IconButton>
                <IconButton
                  onClick={handleNext}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                  }}
                >
                  <NextIcon />
                </IconButton>
              </>
            )}
          </Box>
          
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Image {selectedIndex + 1} of {images.length}
            </Typography>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
};

export default ImageGallery; 