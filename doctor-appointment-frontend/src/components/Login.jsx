import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, setUser, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get previous page information
  const from = location.state?.from || '/';

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');

      await login(credentialResponse.credential);

      // Redirect to previous page
      if (location.state?.from) {
        // If previous page information exists, go to that page
        const returnPath = location.state.from.pathname;
        const returnSearch = location.state.from.search || '';
        navigate(returnPath + returnSearch, { replace: true });
      } else {
        // If no previous page information, go to home page
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
    setError('Google login failed. Please try again.');
  };

  const handleLogout = async () => {
    try {
      await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/logout`,
        { withCredentials: true }
      );
      
      // Clear the user state in the context
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
        Welcome to DoctorAppointment.com!
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          {loading ? (
            <CircularProgress />
          ) : (
            <GoogleLogin
              clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              auto_select
            />
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 