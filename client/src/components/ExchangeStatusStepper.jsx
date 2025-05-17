import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Button,
  Paper
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
  Done as DoneIcon
} from '@mui/icons-material';

// Get active step based on exchange status
const getActiveStep = (exchange) => {
  if (!exchange) return 0;
  
  if (exchange.status === 'completed') return 4;
  if (exchange.creditAmount > 0) return 3;
  if (exchange.transitStatus === 'received') return 2;
  if (exchange.transitStatus === 'shipping') return 1;
  if (exchange.shippingDetails) return 1; // Also check for shippingDetails directly
  if (exchange.status === 'approved') return 0;
  return 0;
};

/**
 * A reusable stepper component that shows the exchange process status
 * 
 * @param {Object} props
 * @param {Object} props.exchange - The exchange request object
 * @param {boolean} props.isAdmin - Whether the viewer is an admin
 * @param {function} props.onShippingClick - Optional callback when shipping details button is clicked
 * @param {function} props.onReceiveClick - Optional callback when receive button is clicked (admin only)
 * @param {function} props.onCreditClick - Optional callback when credit button is clicked (admin only)
 * @param {function} props.onCompleteClick - Optional callback when complete button is clicked (admin only)
 */
const ExchangeStatusStepper = ({ 
  exchange, 
  isAdmin = false,
  onShippingClick,
  onReceiveClick,
  onCreditClick,
  onCompleteClick
}) => {
  if (!exchange) return null;
  
  const activeStep = getActiveStep(exchange);
  
  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        <Step>
          <StepLabel>
            <Typography variant="subtitle1">Review & Approval</Typography>
          </StepLabel>
          <StepContent>
            <Typography variant="body2" color="text.secondary">
              {exchange.status === 'approved'
                ? 'This request has been approved.'
                : exchange.status === 'pending'
                ? 'Request is under review by our team.'
                : 'This request was declined.'}
            </Typography>
            
            {exchange.adminFeedback && (
              <Paper variant="outlined" sx={{ p: 1, mt: 1, bgcolor: '#f9f9f9' }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  Admin feedback: {exchange.adminFeedback}
                </Typography>
              </Paper>
            )}
          </StepContent>
        </Step>
        
        <Step>
          <StepLabel>
            <Typography variant="subtitle1">Shipping</Typography>
          </StepLabel>
          <StepContent>
            {exchange.status === 'approved' && (
              <>
                {!exchange.shippingDetails ? (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Please ship your item and provide shipping details.
                    </Typography>
                    
                    {!isAdmin && onShippingClick && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ShippingIcon />}
                        onClick={onShippingClick}
                        sx={{ mt: 1 }}
                      >
                        Submit Shipping Details
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Item has been shipped.
                    </Typography>
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Carrier:</strong> {exchange.shippingDetails.carrierName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Tracking:</strong> {exchange.shippingDetails.trackingNumber}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Shipped on:</strong> {new Date(exchange.shippingDetails.shippingDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    {isAdmin && onReceiveClick && exchange.transitStatus !== 'received' && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={onReceiveClick}
                        sx={{ mt: 1 }}
                      >
                        Mark as Received
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
          </StepContent>
        </Step>
        
        <Step>
          <StepLabel>
            <Typography variant="subtitle1">Inspection & Valuation</Typography>
          </StepLabel>
          <StepContent>
            {exchange.transitStatus === 'received' ? (
              <>
                <Typography variant="body2" color="text.secondary">
                  Your item is being inspected to determine its value.
                </Typography>
                
                {isAdmin && onCreditClick && !exchange.creditAmount && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ReceiptIcon />}
                    onClick={onCreditClick}
                    sx={{ mt: 1 }}
                  >
                    Assign Credit
                  </Button>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                This step will be available once your item has been received.
              </Typography>
            )}
          </StepContent>
        </Step>
        
        <Step>
          <StepLabel>
            <Typography variant="subtitle1">Credit Assignment</Typography>
          </StepLabel>
          <StepContent>
            {exchange.creditAmount > 0 ? (
              <>
                <Typography variant="body2" color="text.secondary">
                  Credit has been assigned to your account.
                </Typography>
                
                <Typography variant="subtitle1" sx={{ mt: 1, color: 'success.main', fontWeight: 'bold' }}>
                  ${exchange.creditAmount.toFixed(2)}
                </Typography>
                
                {isAdmin && onCompleteClick && exchange.status !== 'completed' && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DoneIcon />}
                    onClick={onCompleteClick}
                    sx={{ mt: 1 }}
                  >
                    Complete Exchange
                  </Button>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                This step will be available once your item has been valued.
              </Typography>
            )}
          </StepContent>
        </Step>
        
        <Step>
          <StepLabel>
            <Typography variant="subtitle1">Exchange Complete</Typography>
          </StepLabel>
          <StepContent>
            {exchange.status === 'completed' ? (
              <Typography variant="body2" color="text.secondary">
                Exchange process has been completed successfully. 
                Your credit of ${exchange.creditAmount.toFixed(2)} is ready to use.
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                The exchange will be completed after credit has been assigned.
              </Typography>
            )}
          </StepContent>
        </Step>
      </Stepper>
    </Box>
  );
};

export default ExchangeStatusStepper; 