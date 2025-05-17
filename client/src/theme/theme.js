import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Color palette
const primaryColor = {
  main: '#1a1a1a', // Black
  light: '#555555',
  dark: '#000000',
  contrastText: '#FFFFFF',
};

const secondaryColor = {
  main: '#888888', // Silver/Gray
  light: '#c0c0c0',
  dark: '#555555',
  contrastText: '#FFFFFF',
};

// Create theme
let theme = createTheme({
  palette: {
    primary: primaryColor,
    secondary: secondaryColor,
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    success: {
      main: '#555555', // Dark gray
      light: '#888888',
      dark: '#333333',
    },
    error: {
      main: '#444444', // Dark gray
      light: '#666666',
      dark: '#222222',
    },
    info: {
      main: '#888888', // Mid gray
      light: '#a0a0a0',
      dark: '#666666',
    },
    warning: {
      main: '#666666', // Mid gray
      light: '#888888',
      dark: '#444444',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
          '&.Mui-disabled': {
            backgroundColor: 'rgba(0, 0, 0, 0.12)',
            color: 'rgba(255, 255, 255, 0.8)',
            '& .MuiCircularProgress-root': {
              color: 'rgba(255, 255, 255, 0.8)',
            }
          },
        },
        containedPrimary: {
          background: `linear-gradient(45deg, ${primaryColor.dark} 0%, ${primaryColor.main} 100%)`,
          '&.Mui-disabled': {
            background: 'rgba(0, 0, 0, 0.3)',
            color: 'rgba(255, 255, 255, 0.8)',
          },
        },
        containedSecondary: {
          background: `linear-gradient(45deg, ${secondaryColor.dark} 0%, ${secondaryColor.main} 100%)`,
          '&.Mui-disabled': {
            background: 'rgba(136, 136, 136, 0.3)',
            color: 'rgba(255, 255, 255, 0.8)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        },
        elevation3: {
          boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          borderRadius: 0,
          backgroundImage: `linear-gradient(90deg, ${primaryColor.dark} 0%, ${primaryColor.main} 100%)`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: primaryColor.main,
            },
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#f5f5f5',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          margin: '24px 0',
        },
      },
    },
  },
});

// Apply responsive font sizes
theme = responsiveFontSizes(theme);

export default theme; 