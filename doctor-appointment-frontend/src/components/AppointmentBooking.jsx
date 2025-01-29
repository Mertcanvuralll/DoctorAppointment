import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const AppointmentBooking = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  
  // Get appointment information from URL
  const selectedDateFromUrl = searchParams.get('date');
  const selectedTimeFromUrl = searchParams.get('time');
  
  const [selectedDate, setSelectedDate] = useState(selectedDateFromUrl || null);
  const [selectedTime, setSelectedTime] = useState(selectedTimeFromUrl || null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Start appointment process after login
  useEffect(() => {
    if (isAuthenticated && selectedDateFromUrl && selectedTimeFromUrl) {
      handleBookAppointment(selectedDateFromUrl, selectedTimeFromUrl);
    }
  }, [isAuthenticated, selectedDateFromUrl, selectedTimeFromUrl]);

  const handleTimeSelect = (time) => {
    if (!isAuthenticated) {
      // Add appointment information to URL
      const searchParams = new URLSearchParams();
      searchParams.set('date', selectedDate);
      searchParams.set('time', time);
      const searchString = searchParams.toString();

      // Redirect to login page
      navigate('/login', {
        state: {
          from: {
            pathname: location.pathname,
            search: `?${searchString}`
          }
        }
      });
      return;
    }

    handleBookAppointment(selectedDate, time);
  };

  const handleBookAppointment = async (date, time) => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/appointments/book`,
        {
          doctorId,
          date: date,
          time: time
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Clear URL parameters
        setSearchParams({});
        
        navigate('/appointments', {
          state: {
            success: true,
            message: 'Appointment booked successfully!'
          }
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.response?.data?.message || 'Error booking appointment');
    } finally {
      setLoading(false);
    }
  };

  // ... other functions and JSX

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* ... other JSX elements ... */}
        
        {availableTimes.map((time) => (
          <Button
            key={time}
            variant="outlined"
            onClick={() => handleTimeSelect(time)}
            disabled={loading}
            color={selectedTimeFromUrl === time ? "primary" : "inherit"}
          >
            {time}
          </Button>
        ))}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default AppointmentBooking; 