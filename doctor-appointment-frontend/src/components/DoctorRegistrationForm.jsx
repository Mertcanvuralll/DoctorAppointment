import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import AddressSelector from './AddressSelector';
import WorkingHoursSelector from './WorkingHoursSelector';

const specializations = [
  "Emergency Medicine",
  "Family Medicine",
  "Neurosurgery",
  "Pediatrics",
  "Internal Medicine",
  "Dermatology",
  "Endocrinology",
  "Physical Therapy and Rehabilitation",
  "Gastroenterology",
  "General Surgery",
  "Pulmonology",
  "Ophthalmology",
  "Obstetrics and Gynecology",
  "Cardiovascular Surgery",
  "Cardiology",
  "Otolaryngology",
  "Neurology",
  "Orthopedics and Traumatology",
  "Plastic Surgery",
  "Psychiatry",
  "Radiology",
  "Urology"
];

const DoctorRegistrationForm = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  console.log('DoctorRegistrationForm mounting...', {
    user,
    isAuthenticated,
    pathname: location.pathname
  });

  useEffect(() => {
    const initializeForm = async () => {
      try {
        if (!isAuthenticated) {
          console.log('User not authenticated, redirecting to login...');
          navigate('/login');
          return;
        }

        if (!user) {
          console.log('Waiting for user data...');
          return;
        }

        console.log('Setting up form with user data:', user);
        setFormData(prevData => ({
          ...prevData,
          fullName: user.name || '',
          email: user.email || ''
        }));
        setLoading(false);
      } catch (error) {
        console.error('Error initializing form:', error);
        setError('Error initializing form');
        setLoading(false);
      }
    };

    initializeForm();
  }, [isAuthenticated, user, navigate]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    education: '',
    availableDays: [],
    address: {
      street: '',
      city: '',
      cityName: '',
      district: '',
      districtName: '',
      coordinates: null
    },
    availableHours: {
      days: [],
      start: '09:00',
      end: '17:00'
    },
    consultationFee: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/doctors/register`,
        formData,
        { withCredentials: true }
      );

      setSuccess('Registration successful! Waiting for admin approval.');
      setTimeout(() => {
        navigate('/doctor-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error.response?.data?.message || error.message);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (newAddress) => {
    setFormData(prev => ({
      ...prev,
      address: newAddress
    }));
  };

  const handleHoursChange = (hours) => {
    setFormData(prev => ({
      ...prev,
      availableHours: hours
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Doctor Registration Form
        </Typography>
        <Typography>
          Welcome {user?.name}! This is the registration form.
        </Typography>
      </Paper>
    </Container>
  );
};

export default DoctorRegistrationForm; 