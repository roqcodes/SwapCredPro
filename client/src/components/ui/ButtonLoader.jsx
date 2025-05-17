import React from 'react';
import { CircularProgress, Box } from '@mui/material';

/**
 * ButtonLoader - Consistent loading indicator for buttons
 * 
 * @param {Object} props
 * @param {number} props.size - Size of the circular progress (default: 24)
 * @param {string} props.color - Color of the circular progress (default: inherit)
 * @returns {JSX.Element} - CircularProgress component with consistent styling
 */
const ButtonLoader = ({ size = 24, color = 'inherit' }) => {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <CircularProgress 
        size={size} 
        color={color} 
        thickness={4}
        sx={{ 
          color: 'rgba(255, 255, 255, 0.8)',
        }} 
      />
    </Box>
  );
};

export default ButtonLoader; 