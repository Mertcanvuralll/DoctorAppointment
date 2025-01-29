import React, { useState } from 'react';
import {
  Box,
  Card,
  Avatar,
  Typography,
  Button,
  Rating,
  Divider,
  IconButton,
  Collapse,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import DoctorReviews from './DoctorReviews';
import MessageIcon from '@mui/icons-material/Message';

const mapContainerStyle = {
  width: '100%',
  height: '200px',
  borderRadius: '8px',
  marginTop: '16px'
};

const DoctorCard = ({ doctor }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openReviews, setOpenReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);

  // Show next 7 days
  const nextDays = [...Array(7)].map((_, i) => {
    const date = addDays(new Date(), i);
    return {
      date,
      dayName: format(date, 'EEEE', { locale: tr }),
      dayMonth: format(date, 'd MMMM', { locale: tr }),
      slots: generateTimeSlots(doctor.availableHours?.start, doctor.availableHours?.end)
    };
  });

  function generateTimeSlots(start = '09:00', end = '17:00') {
    const slots = [];
    let currentTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);

    while (currentTime < endTime) {
      slots.push(format(currentTime, 'HH:mm'));
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return slots;
  }

  const handlePrevDay = () => {
    setCurrentDayIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextDay = () => {
    setCurrentDayIndex(prev => Math.min(6, prev + 1));
  };

  const handleSlotSelect = (date, time) => {
    setSelectedSlot({ date, time });
  };

  const handleBookAppointment = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/book-appointment/${doctor._id}` } });
      return;
    }

    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const formattedDate = format(selectedSlot.date, 'yyyy-MM-dd');
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/appointments/book`,
        {
          doctorId: doctor._id,
          date: formattedDate,
          time: selectedSlot.time
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccessMessage('Your appointment has been successfully created. Details have been sent to your email.');
        setTimeout(() => {
          navigate('/appointments', {
            state: { success: true, message: 'Appointment created successfully' }
          });
        }, 2000);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login', { state: { from: `/book-appointment/${doctor._id}` } });
      } else {
        console.error('Booking error details:', {
          error: error.response?.data || error.message,
          status: error.response?.status,
          url: error.config?.url
        });
        setError(error.response?.data?.message || 'Appointment creation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReviewsClick = async () => {
    if (!loading) {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/doctors/${doctor._id}/reviews`);
        if (response.data.success) {
          setReviews(response.data.data.reviews);
          setTotalReviews(response.data.data.totalReviews);
          setOpenReviews(true);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Custom marker settings for Google Maps
  const getMarkerOptions = () => {
    if (window.google && window.google.maps) {
      return {
        position: doctor.address.coordinates,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png', // Safer icon
          scaledSize: new window.google.maps.Size(32, 32)
        },
        title: doctor.fullName,
        animation: window.google.maps.Animation.DROP
      };
    }
    return {
      position: doctor.address.coordinates
    };
  };

  return (
    <>
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Avatar
            src={doctor.userId?.picture}
            sx={{ width: 80, height: 80, border: '2px solid #eee' }}
          />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Typography variant="h6" component="h2">
                {doctor.title} {doctor.fullName}
              </Typography>
              {doctor.isVerified && (
                <VerifiedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {doctor.specialization}
            </Typography>
            <Box display="flex" alignItems="center" mb={2} sx={{ cursor: 'pointer' }} onClick={handleReviewsClick}>
              <Rating value={doctor.rating || 0} readOnly precision={0.5} />
              <Button 
                startIcon={<MessageIcon />}
                size="small"
                sx={{ ml: 1 }}
              >
                {doctor.totalReviews || 0} reviews
              </Button>
            </Box>
          </Box>
        </Box>

        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2, 
            cursor: 'pointer' 
          }}
          onClick={() => setShowMap(!showMap)}
        >
          <LocationOnIcon color="action" sx={{ fontSize: 20, mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {doctor.address.street}, {doctor.address.district}, {doctor.address.city}
          </Typography>
        </Box>

        <Collapse in={showMap}>
          <Box sx={{ mb: 2 }}>
            {doctor.address?.coordinates && (
              <LoadScript 
                googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                onLoad={() => console.log('Google Maps loaded')}
              >
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={doctor.address.coordinates}
                  zoom={15}
                  options={{
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false
                  }}
                >
                  <Marker {...getMarkerOptions()} />
                </GoogleMap>
              </LoadScript>
            )}
          </Box>
        </Collapse>

        <Divider sx={{ my: 2 }} />

        {/* Error and Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Appointment Times */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <IconButton 
              onClick={handlePrevDay}
              disabled={currentDayIndex === 0}
              size="small"
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
            <Typography 
              variant="subtitle2" 
              sx={{ flex: 1, textAlign: 'center' }}
            >
              {nextDays[currentDayIndex].dayName}, {nextDays[currentDayIndex].dayMonth}
            </Typography>
            <IconButton 
              onClick={handleNextDay}
              disabled={currentDayIndex === 6}
              size="small"
            >
              <KeyboardArrowRightIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {nextDays[currentDayIndex].slots.map((time) => {
              const isSelected = selectedSlot?.date === nextDays[currentDayIndex].date && 
                               selectedSlot?.time === time;
              return (
                <Button
                  key={time}
                  variant={isSelected ? "contained" : "outlined"}
                  size="small"
                  onClick={() => handleSlotSelect(nextDays[currentDayIndex].date, time)}
                  sx={{
                    minWidth: '80px',
                    borderRadius: 2,
                    textTransform: 'none',
                    bgcolor: isSelected ? 'primary.main' : 'transparent'
                  }}
                >
                  {time}
                </Button>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleBookAppointment}
            disabled={!selectedSlot || loading}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              minWidth: 140,
              width: '100%'
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Book Appointment'
            )}
          </Button>
        </Box>
      </Card>

      <DoctorReviews
        open={openReviews}
        onClose={() => setOpenReviews(false)}
        doctorName={doctor.fullName}
        reviews={reviews}
        totalReviews={totalReviews}
      />
    </>
  );
};

export default DoctorCard; 