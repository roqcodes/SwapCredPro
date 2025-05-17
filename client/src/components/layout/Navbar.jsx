import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Box,
  Avatar,
  Divider,
  Container,
  Tooltip,
  Badge,
  useMediaQuery,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon, 
  Logout as LogoutIcon, 
  SwapHoriz as SwapIcon, 
  AccountCircle as AccountIcon,
  AdminPanelSettings as AdminIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material';

export default function Navbar() {
  const { currentUser, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const isAdmin = userProfile?.isAdmin;
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    try {
      signOut();
      navigate('/email-signin');
    } catch (error) {
      console.error('Failed to log out', error);
    }
    handleClose();
  };
  
  // Close mobile drawer when location changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      condition: !!currentUser
    },
    {
      text: 'New Exchange',
      icon: <SwapIcon />,
      path: '/exchange/new',
      condition: !!currentUser
    },
    {
      text: 'Admin Panel',
      icon: <AdminIcon />,
      path: '/admin',
      condition: !!currentUser && isAdmin
    }
  ];
  
  // Filter menu items based on conditions
  const filteredMenuItems = menuItems.filter(item => item.condition);
  
  const drawer = (
    <Box sx={{ width: 250, pt: 2, bgcolor: alpha('#f5f5f5', 0.9), height: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
        <Avatar 
          sx={{ 
            width: 64, 
            height: 64, 
            mb: 1, 
            background: 'linear-gradient(45deg, #1a1a1a 30%, #888888 90%)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}
        >
          {currentUser?.email.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
          {currentUser?.email}
        </Typography>
        {isAdmin && (
          <Badge 
            badgeContent="Admin" 
            sx={{ 
              mt: 0.5, 
              '& .MuiBadge-badge': { 
                bgcolor: '#1a1a1a', 
                color: 'white' 
              } 
            }}
          />
        )}
      </Box>
      <Divider sx={{ bgcolor: alpha('#1a1a1a', 0.1) }} />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem 
            button 
            component={Link} 
            to={item.path} 
            key={item.text}
            sx={{
              borderRadius: '0 20px 20px 0',
              my: 0.5,
              mx: 1,
              color: '#555',
              '&.active': {
                bgcolor: alpha('#1a1a1a', 0.1),
                '& .MuiListItemIcon-root': {
                  color: '#1a1a1a',
                },
                '& .MuiListItemText-primary': {
                  color: '#1a1a1a',
                  fontWeight: 'bold',
                },
              },
              '&:hover': {
                bgcolor: alpha('#1a1a1a', 0.05),
              },
            }}
            className={location.pathname === item.path ? 'active' : ''}
          >
            <ListItemIcon sx={{ color: '#555', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        
        <ListItem 
          button 
          onClick={handleLogout}
          sx={{
            borderRadius: '0 20px 20px 0',
            my: 0.5,
            mx: 1,
            color: '#777',
            '&:hover': {
              bgcolor: alpha('#000', 0.05),
            },
          }}
        >
          <ListItemIcon sx={{ color: '#777', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ 
        bgcolor: '#1a1a1a',
        backgroundImage: 'linear-gradient(90deg, #000000 0%, #1a1a1a 100%)',
      }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 0.5 }}>
            {currentUser && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Typography 
              variant="h6" 
              component={Link} 
              to="/"
              sx={{ 
                flexGrow: 1, 
                textDecoration: 'none', 
                color: 'inherit',
                fontWeight: 'bold',
                letterSpacing: 1
              }}
            >
              PSK Xchange
            </Typography>
            
            {currentUser ? (
              <>
                <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                  {filteredMenuItems.map((item) => (
                    <Button
                      key={item.text}
                      component={Link}
                      to={item.path}
                      color="inherit"
                      sx={{ 
                        mx: 0.5,
                        borderRadius: 2,
                        px: 2,
                        backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.25)'
                        }
                      }}
                      startIcon={item.icon}
                    >
                      {item.text}
                    </Button>
                  ))}
                </Box>
                
                <Tooltip title="Account Menu">
                  <IconButton
                    color="inherit"
                    onClick={handleMenu}
                    edge="end"
                  >
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        fontSize: 14
                      }}
                    >
                      {currentUser.email.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  sx={{
                    '& .MuiPaper-root': {
                      borderRadius: 2,
                      mt: 1.5,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      bgcolor: alpha('#fff', 0.95),
                      backdropFilter: 'blur(10px)',
                    }
                  }}
                >
                  <MenuItem onClick={() => {handleClose(); navigate('/dashboard');}}>
                    <ListItemIcon>
                      <DashboardIcon fontSize="small" sx={{ color: '#1a1a1a' }} />
                    </ListItemIcon>
                    <Typography variant="inherit" sx={{ color: '#1a1a1a' }}>Dashboard</Typography>
                  </MenuItem>
                  
                  <MenuItem onClick={() => {handleClose(); navigate('/exchange');}}>
                    <ListItemIcon>
                      <CreditCardIcon fontSize="small" sx={{ color: '#1a1a1a' }} />
                    </ListItemIcon>
                    <Typography variant="inherit" sx={{ color: '#1a1a1a' }}>My Exchanges</Typography>
                  </MenuItem>
                  
                  {isAdmin && (
                    <MenuItem onClick={() => {handleClose(); navigate('/admin');}}>
                      <ListItemIcon>
                        <AdminIcon fontSize="small" sx={{ color: '#1a1a1a' }} />
                      </ListItemIcon>
                      <Typography variant="inherit" sx={{ color: '#1a1a1a' }}>Admin Dashboard</Typography>
                    </MenuItem>
                  )}
                  
                  <Divider />
                  
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" sx={{ color: '#777' }} />
                    </ListItemIcon>
                    <Typography variant="inherit" sx={{ color: '#777' }}>Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button 
                color="inherit" 
                component={Link} 
                to="/email-signin"
              >
                Login
              </Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        PaperProps={{
          sx: {
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
            boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            width: 250,
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
} 