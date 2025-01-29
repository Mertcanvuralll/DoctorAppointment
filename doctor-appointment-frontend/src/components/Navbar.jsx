import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>

          {!isAuthenticated && (
            <Button color="inherit" component={Link} to="/register-doctor">
              Register as Doctor
            </Button>
          )}

          {isAuthenticated && (
            <>
              <Button color="inherit" component={Link} to="/appointments">
                My Appointments
              </Button>

              {user?.role === 'admin' && (
                <Button color="inherit" component={Link} to="/admin">
                  Admin Panel
                </Button>
              )}
            </>
          )}
        </Box>

        <Box>
          {isAuthenticated ? (
            <>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 