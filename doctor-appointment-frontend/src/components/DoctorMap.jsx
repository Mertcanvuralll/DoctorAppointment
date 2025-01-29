import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Rating,
  Chip,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 41.0082, // Istanbul coordinates
  lng: 28.9784
};

const DoctorMap = ({ doctors, selectedCity }) => {
  const [center, setCenter] = useState(defaultCenter);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Filter doctors with coordinates
  const doctorsWithCoordinates = doctors.filter(
    doctor => doctor.address?.coordinates?.lat && doctor.address?.coordinates?.lng
  );

  useEffect(() => {
    if (selectedCity) {
      getCityCoordinates(selectedCity).then(coords => {
        if (coords) {
          setCenter(coords);
        }
      });
    }
  }, [selectedCity]);

  useEffect(() => {
    // If no doctor has coordinates, show an alert
    if (doctors.length > 0 && doctorsWithCoordinates.length === 0) {
      setError('Some doctors do not have location information on the map');
    } else {
      setError('');
    }
  }, [doctors, doctorsWithCoordinates]);

  const getCityCoordinates = async (cityName) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityName)}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      }
      return null;
    } catch (error) {
      console.error('Error getting city coordinates:', error);
      return null;
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          options={{
            styles: mapStyles,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false
          }}
        >
          {doctorsWithCoordinates.map((doctor) => (
            <Marker
              key={doctor._id}
              position={{
                lat: doctor.address.coordinates.lat,
                lng: doctor.address.coordinates.lng
              }}
              onClick={() => setSelectedDoctor(doctor)}
              icon={{
                url: '/doctor-marker.png',
                scaledSize: new window.google.maps.Size(40, 40)
              }}
            />
          ))}

          {selectedDoctor && (
            <InfoWindow
              position={{
                lat: selectedDoctor.address.coordinates.lat,
                lng: selectedDoctor.address.coordinates.lng
              }}
              onCloseClick={() => setSelectedDoctor(null)}
            >
              <Card sx={{ maxWidth: 300, boxShadow: 'none' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Dr. {selectedDoctor.fullName}
                  </Typography>
                  <Chip
                    label={selectedDoctor.specialization}
                    color="primary"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating
                      value={selectedDoctor.rating || 0}
                      readOnly
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      ({selectedDoctor.reviewCount || 0})
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {selectedDoctor.address.district}, {selectedDoctor.address.city}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    onClick={() => navigate(`/book-appointment/${selectedDoctor._id}`)}
                    sx={{ mt: 1 }}
                  >
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </Box>
  );
};

// Map styles
const mapStyles = [
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'transit',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }]
  }
];

export default DoctorMap; 