import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Typography, Container, Paper, Box, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

export default function NotFound() {
  const { currentUser } = useAuth();
  
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h1" component="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'primary.main' }}>
          404
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={currentUser ? "/dashboard" : "/"}
          startIcon={<HomeIcon />}
          size="large"
        >
          {currentUser ? "Back to Dashboard" : "Go to Home"}
        </Button>
      </Paper>
    </Container>
  );
} 