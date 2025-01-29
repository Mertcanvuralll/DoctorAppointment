import axios from 'axios';

export const login = async (credential) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/auth/google`,
      { credential },
      { withCredentials: true }
    );
    
    if (response.data.success) {
      return response.data.user;
    }
    throw new Error(response.data.message || 'Login failed');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const authenticateWithGoogle = async (credential) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/auth/google`,
      { credential },
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Authentication failed');
    }

    return response.data.data; // User data
  } catch (error) {
    console.error('Google auth error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Authentication failed');
  }
};

export const checkAuthStatus = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/auth/status`,
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error) {
    return null;
  }
};

export const logout = async () => {
  try {
    // Log out from the backend
    await axios.post(
      `${process.env.REACT_APP_API_URL}/auth/logout`,
      {},
      { withCredentials: true }
    );

    // Clear the token from the frontend
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}; 