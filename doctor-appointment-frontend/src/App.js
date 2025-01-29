import React from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import RegisterDoctor from './components/RegisterDoctor';
import Appointments from './components/Appointments';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Box, CircularProgress } from '@mui/material';
import Review from './components/Review';
import AdminPanel from './components/AdminPanel';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated && user?.role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <div className="App">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/register-doctor"
                  element={
                    <PrivateRoute>
                      <RegisterDoctor />
                    </PrivateRoute>
                  }
                />
                <Route 
                  path="/appointments" 
                  element={
                    <PrivateRoute>
                      <Appointments />
                    </PrivateRoute>
                  }
                />
                <Route path="/review/:appointmentId" element={<Review />} />
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminPanel />
                    </AdminRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}

export default App; 