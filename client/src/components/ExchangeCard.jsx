import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  Button,
  Divider,
  alpha,
  useTheme,
  Paper,
  Badge
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  ArrowForward as ArrowForwardIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const formatCondition = (condition) => {
  if (!condition) return 'Not specified';
  // Capitalize first letter and replace underscores with spaces
  return condition.charAt(0).toUpperCase() + condition.slice(1).replace(/_/g, ' ');
};

const StatusChip = ({ status }) => {
  switch (status) {
    case 'approved':
      return <Chip icon={<CheckCircleIcon />} label="Approved" color="info" variant="outlined" size="small" sx={{ bgcolor: 'white', borderColor: '#2196f3', color: '#2196f3' }} />;
    case 'declined':
      return <Chip icon={<CancelIcon />} label="Declined" color="error" variant="outlined" size="small" sx={{ bgcolor: 'white', borderColor: '#f44336', color: '#f44336' }} />;
    case 'completed':
      return <Chip icon={<CheckCircleIcon />} label="Completed" color="success" variant="outlined" size="small" sx={{ bgcolor: 'white', borderColor: '#4caf50', color: '#4caf50' }} />;
    case 'pending':
    default:
      return <Chip icon={<PendingIcon />} label="Pending" color="warning" variant="outlined" size="small" sx={{ bgcolor: 'white', borderColor: '#ff9800', color: '#ff9800' }} />;
  }
};

const TransitStatusChip = ({ status }) => {
  switch (status) {
    case 'shipped':
      return <Chip icon={<ShippingIcon />} label="Shipped" color="info" size="small" sx={{ bgcolor: 'white', borderColor: '#2196f3', color: '#2196f3' }} />;
    case 'received':
      return <Chip icon={<CheckCircleIcon />} label="Received" color="success" size="small" sx={{ bgcolor: 'white', borderColor: '#4caf50', color: '#4caf50' }} />;
    case 'inspected':
      return <Chip icon={<CheckCircleIcon />} label="Inspected" color="success" size="small" sx={{ bgcolor: 'white', borderColor: '#4caf50', color: '#4caf50' }} />;
    case 'not_started':
    default:
      return null; // Don't show a chip for not started
  }
};

const formatCredit = (creditAmount) => {
  if (creditAmount === null || creditAmount === undefined) return 'Pending';
  return `$${creditAmount.toFixed(2)}`;
};

export default function ExchangeCard({ exchange, isAdmin = false }) {
  const theme = useTheme();
  
  if (!exchange) {
    return (
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.light',
            boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.15)}`
          },
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <CircularProgress />
        </CardContent>
      </Paper>
    );
  }

  const { 
    id, 
    status, 
    productName, 
    brand, 
    condition, 
    description, 
    createdAt,
    transitStatus,
    trackingNumber,
    creditAmount
  } = exchange;

  const formattedDate = new Date(createdAt).toLocaleDateString();
  const formattedCredit = formatCredit(creditAmount);
  
  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.15)}`
        },
        overflow: 'hidden'
      }}
    >
      {status === 'approved' && creditAmount > 0 && (
        <Box 
          sx={{ 
            bgcolor: alpha(theme.palette.success.main, 0.1), 
            py: 0.75, 
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            borderBottom: '1px solid',
            borderColor: alpha(theme.palette.success.main, 0.2),
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'success.main', 
              fontWeight: 'medium',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <MoneyIcon fontSize="small" sx={{ mr: 0.5 }} />
            Credit Assigned: {formattedCredit}
          </Typography>
        </Box>
      )}
      
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box>
            <Typography 
              variant="subtitle1" 
              component="div" 
              sx={{ 
                fontWeight: 600,
                mb: 0.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1
              }}
            >
              {productName}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {formattedDate} • {brand}
            </Typography>
          </Box>
          
          <StatusChip status={status} />
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip 
            label={`Condition: ${formatCondition(condition)}`} 
            size="small" 
            variant="outlined" 
            color="primary"
          />
          
          {transitStatus && (
            <Chip 
              icon={<ShippingIcon fontSize="small" />} 
              label={`Transit: ${transitStatus.charAt(0).toUpperCase() + transitStatus.slice(1)}`} 
              size="small" 
              color="info" 
              variant="outlined" 
            />
          )}
        </Box>
        
        {description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {description}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            component={Link}
            to={isAdmin ? `/admin/exchange/${id}` : `/exchange/${id}`}
            color="primary"
            size="small"
            endIcon={<ArrowForwardIcon />}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Paper>
  );
} 