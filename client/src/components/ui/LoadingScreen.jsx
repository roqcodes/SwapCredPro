import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

// Create a pulsing animation
const pulse = keyframes`
  0% {
    opacity: 0.6;
    transform: scale(0.98);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0.6;
    transform: scale(0.98);
  }
`;

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(45deg, #000000 0%, #1a1a1a 100%)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          animation: `${pulse} 2s infinite ease-in-out`,
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 3, 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #1a1a1a 30%, #888888 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          SwapCred
        </Typography>
        
        <CircularProgress 
          size={60} 
          thickness={4} 
          sx={{ 
            mb: 2,
            color: '#888888'
          }} 
        />
        
        <Typography variant="body1" sx={{ color: '#555555' }}>
          Loading your experience...
        </Typography>
      </Box>
    </Box>
  );
};

export default LoadingScreen; 