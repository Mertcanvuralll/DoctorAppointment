import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography
} from '@mui/material';
import axios from 'axios';
import LocationPicker from './LocationPicker';

const AddressSelector = ({ address, onChange }) => {
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/locations/cities`);
        if (response.data.success) {
          setCities(Object.entries(response.data.data).map(([id, name]) => ({
            id,
            name
          })));
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (address.city) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/locations/districts/${address.city}`
          );
          if (response.data.success) {
            setDistricts(Object.entries(response.data.data).map(([id, name]) => ({
              id,
              name
            })));
          }
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      }
    };
    fetchDistricts();
  }, [address.city]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newAddress = { ...address };

    if (name === 'city') {
      const selectedCity = cities.find(city => city.id === value);
      newAddress = {
        ...newAddress,
        city: value,
        cityName: selectedCity?.name || '',
        district: '',
        districtName: ''
      };
    } else if (name === 'district') {
      const selectedDistrict = districts.find(district => district.id === value);
      newAddress = {
        ...newAddress,
        district: value,
        districtName: selectedDistrict?.name || ''
      };
    } else {
      newAddress[name] = value;
    }

    onChange(newAddress);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Address Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Street Address"
            name="street"
            value={address.street}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>City</InputLabel>
            <Select
              name="city"
              value={address.city}
              onChange={handleChange}
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
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required disabled={!address.city}>
            <InputLabel>District</InputLabel>
            <Select
              name="district"
              value={address.district}
              onChange={handleChange}
              label="District"
            >
              {districts.map((district) => (
                <MenuItem key={district.id} value={district.id}>
                  {district.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <LocationPicker 
        value={address.coordinates}
        onChange={(coordinates) => onChange({ ...address, coordinates })}
      />
    </Box>
  );
};

export default AddressSelector; 