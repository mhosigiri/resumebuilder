import { Box, CircularProgress, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useMemo } from 'react';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { AuthScreen } from './components/auth/AuthScreen';
import { useAuth } from './contexts/AuthContext';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#111827',
    },
    secondary: {
      main: '#4b5563',
    },
    background: {
      default: '#f3f4f6',
    },
  },
  typography: {
    fontFamily: ['"Inter"', 'Arial', 'sans-serif'].join(', '),
  },
});

function App() {
  const { user, loading } = useAuth();
  const content = useMemo(() => {
    if (loading) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (!user) {
      return <AuthScreen />;
    }
    return <DashboardLayout />;
  }, [loading, user]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {content}
    </ThemeProvider>
  );
}

export default App;
