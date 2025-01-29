import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Avatar,
  Divider,
  Rating,
  Chip,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import DoctorCard from './DoctorCard';

const AppointmentCreate = () => {
  const { doctorId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Show next 7 days
  const nextDays = [...Array(7)].map((_, i) => {
    const date = addDays(new Date(), i);
    return {
      date,
      dayName: format(date, 'EEEE', { locale: tr }),
      dayMonth: format(date, 'd MMMM', { locale: tr }),
      slots: []
    };
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/book-appointment/${doctorId}` } });
    }
    fetchDoctorDetails();
    fetchAvailableSlots();
  }, [doctorId, isAuthenticated]);

  useEffect(() => {
    if (doctor && isAuthenticated) {
      trackIncompleteAppointment('doctor_selected');
    }
  }, [doctor]);

  useEffect(() => {
    if (selectedDate && selectedTime && isAuthenticated) {
      trackIncompleteAppointment('slot_selected', { date: selectedDate, time: selectedTime });
    }
  }, [selectedDate, selectedTime]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/doctors/${doctorId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setDoctor(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      setError('Failed to load doctor details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const [availableResponse, bookedResponse] = await Promise.all([
        axios.get(
          `${process.env.REACT_APP_API_URL}/appointments/available-slots/${doctorId}`,
          { withCredentials: true }
        ),
        axios.get(
          `${process.env.REACT_APP_API_URL}/appointments/booked-slots/${doctorId}`,
          { withCredentials: true }
        )
      ]);

      // Sort slots by date
      const slots = nextDays.map(day => ({
        ...day,
        slots: generateTimeSlots(doctor?.availableHours?.start, doctor?.availableHours?.end)
      }));

      setAvailableSlots(slots);
      setBookedSlots(bookedResponse.data.data);
    } catch (error) {
      setError('Failed to fetch slots');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (start = '09:00', end = '17:00') => {
    const slots = [];
    let currentTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);

    while (currentTime < endTime) {
      slots.push(format(currentTime, 'HH:mm'));
      currentTime.setMinutes(currentTime.getMinutes() + 30); // 30 minute intervals
    }

    return slots;
  };

  const handleTimeSelect = (date, time) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/appointments/book`,
        {
          doctorId,
          date: selectedDate,
          time: selectedTime
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        navigate('/appointments', {
          state: {
            success: true,
            message: 'Appointment booked successfully'
          }
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const trackIncompleteAppointment = async (step, slotInfo = null) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/appointments/track-incomplete`,
        {
          doctorId,
          step,
          slotInfo
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Error tracking incomplete appointment:', error);
    }
  };

  const isSlotBooked = (date, time) => {
    return bookedSlots.some(slot => 
      format(new Date(slot.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && 
      slot.time === time
    );
  };

  const getSlotVariant = (date, time) => {
    if (selectedDate === date && selectedTime === time) return "contained";
    if (isSlotBooked(date, time)) return "disabled";
    return "outlined";
  };

  const getSlotColor = (date, time) => {
    if (isSlotBooked(date, time)) return "error";
    return "primary";
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!doctor) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Doctor not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Book Appointment
      </Typography>
      <Paper sx={{ p: 3 }}>
        <DoctorCard doctor={doctor} />
      </Paper>
    </Container>
  );
};

export default AppointmentCreate; 