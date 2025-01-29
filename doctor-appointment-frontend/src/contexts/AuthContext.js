import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    isAuthenticated: false,
    loading: true
  });

  const checkAuth = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/check`,
        { withCredentials: true }
      );
      
      console.log('Auth check response:', response.data);

      if (response.data.success) {
        setState({
          user: response.data.user,
          isAuthenticated: true,
          loading: false
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          loading: false
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setState({
        user: null,
        isAuthenticated: false,
        loading: false
      });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credential) => {
    try {
      console.log('Sending credential to backend:', credential);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/google`,
        { credential },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Login response:', response.data);

      if (response.data.success) {
        setState({
          user: response.data.user,
          isAuthenticated: true,
          loading: false
        });
        return response.data.user;
      }
    } catch (error) {
      console.error('Login error details:', error.response?.data);
      setState({
        user: null,
        isAuthenticated: false,
        loading: false
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      setState({
        user: null,
        isAuthenticated: false,
        loading: false
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: null,
    login,
    logout
  };

  if (state.loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 