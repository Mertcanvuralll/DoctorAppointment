import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Rating,
  Chip,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/v1/appointments/my-appointments');
      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'error',
      completed: 'info'
    };
    return statusColors[status] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {location.state?.success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {location.state.message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        My Appointments
      </Typography>

      {appointments.length === 0 ? (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography align="center" color="text.secondary">
              No appointments found
            </Typography>
          </CardContent>
        </Card>
      ) : (
        appointments.map((appointment) => (
          <Card key={appointment._id} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Dr. {appointment.doctorId.fullName}
                </Typography>
                <Chip
                  label={appointment.status.toUpperCase()}
                  color={getStatusColor(appointment.status)}
                  size="small"
                />
              </Box>

              <Typography color="text.secondary" gutterBottom>
                {appointment.doctorId.specialization}
              </Typography>

              <Box display="flex" gap={2} mb={2}>
                <Typography variant="body2">
                  Date: {format(new Date(appointment.date), 'MMM d, yyyy')}
                </Typography>
                <Typography variant="body2">
                  Time: {appointment.time}
                </Typography>
              </Box>

              {appointment.status === 'completed' && !appointment.review && (
                <Button
                  variant="outlined"
                  size="small"
                  href={`/review/${appointment._id}`}
                >
                  Leave a Review
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
};

export default Appointments; 