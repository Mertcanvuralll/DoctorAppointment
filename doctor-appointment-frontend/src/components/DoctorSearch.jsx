import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Grid,
  Card,
  CardContent,
  Typography,
  Rating,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';

const DoctorSearch = () => {
  const [cities, setCities] = useState([]);
  const [searchParams, setSearchParams] = useState({
    specialization: '',
    city: '',
    name: ''
  });
  
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/locations/cities`);
        if (response.data.success) {
          const formattedCities = Object.entries(response.data.data).map(([id, name]) => ({
            id: id.padStart(2, '0'),
            name
          }));
          console.log('Formatted cities:', formattedCities);
          setCities(formattedCities);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    fetchCities();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        city: searchParams.city,
        specialization: searchParams.specialization
      };
      
      console.log('Search params:', params);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/doctors/search`,
        { params }
      );

      console.log('Search response:', response.data);

      if (response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Error searching doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.specialization || searchParams.city || searchParams.name) {
      const debounce = setTimeout(() => {
        handleSearch();
      }, 500);

      return () => clearTimeout(debounce);
    }
  }, [searchParams]);

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const center = {
    lat: 38.4237,
    lng: 27.1428
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>City</InputLabel>
            <Select
              value={searchParams.city || ''}
              onChange={(e) => {
                const selectedCityId = e.target.value;
                console.log('Selected city ID:', selectedCityId);
                setSearchParams(prev => ({
                  ...prev,
                  city: selectedCityId
                }));
              }}
              label="City"
            >
              {cities.map((city) => (
                <MenuItem key={city.id} value={city.id}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <Autocomplete
            options={specializations}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Specialization, interest area and disease, name"
                fullWidth
              />
            )}
            onChange={(_, value) => setSearchParams(prev => ({
              ...prev,
              specialization: value
            }))}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <LoadScript googleMapsApiKey="AIzaSyD41ctEoidSVQUWUSNs_Kv6IA6FUbgyPYw">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={10}
            >
              {doctors.map((doctor) => (
                doctor.address?.coordinates && (
                  <Marker
                    key={doctor._id}
                    position={{
                      lat: doctor.address.coordinates.lat,
                      lng: doctor.address.coordinates.lng
                    }}
                    title={doctor.fullName}
                  />
                )
              ))}
            </GoogleMap>
          </LoadScript>
        </Grid>

        <Grid item xs={12} md={6}>
          {doctors.map((doctor) => (
            <Card key={doctor._id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" component="div">
                  {doctor.fullName}
                </Typography>
                <Typography color="text.secondary">
                  {doctor.specialization}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={doctor.rating} readOnly />
                  <Typography sx={{ ml: 1 }}>
                    ({doctor.reviewCount} değerlendirme)
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {`${doctor.address?.street}, ${doctor.address?.town}, ${doctor.address?.city}`}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => {/* Appointment page redirect */}}
                >
                  Appointment
                </Button>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DoctorSearch; 