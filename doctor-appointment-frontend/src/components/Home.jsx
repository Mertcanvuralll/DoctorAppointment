import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Autocomplete,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Avatar,
  Rating,
  Chip,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VerifiedIcon from '@mui/icons-material/Verified';
import DoctorCard from './DoctorCard';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [cities, setCities] = useState([]);
  const [specializations] = useState([
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
  ]);

  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);

  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/locations/cities`,
        { withCredentials: true }
      );
      const cityData = response.data.data || [];
      setCities(cityData.map(city => city.name));
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/doctors/search`,
        {
          params: {
            city: selectedCity,
            specialization: selectedSpecialization
          },
          withCredentials: true
        }
      );

      setDoctors(response.data.data);
    } catch (error) {
      setError('Failed to fetch doctors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom>
            Find Your Doctor
          </Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>
            Book appointments with the best doctors in your city
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/register-doctor')}
            startIcon={<LocalHospitalIcon />}
          >
            REGISTER AS A DOCTOR
          </Button>
        </Container>
      </Box>

      {/* Search Section */}
      <Container maxWidth="lg" sx={{ mt: -4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            borderRadius: 2
          }}
        >
          <Autocomplete
            value={selectedCity}
            onChange={(event, newValue) => setSelectedCity(newValue)}
            options={cities}
            getOptionLabel={(option) => option || ''}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select City"
                placeholder="Where?"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            )}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />

          <Autocomplete
            value={selectedSpecialization}
            onChange={(event, newValue) => setSelectedSpecialization(newValue)}
            options={specializations}
            getOptionLabel={(option) => option || ''}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Specialization"
                placeholder="What kind of doctor?"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <LocalHospitalIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            )}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />

          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            startIcon={<SearchIcon />}
            sx={{ height: 56, px: 4 }}
          >
            SEARCH
          </Button>
        </Paper>

        {/* Results Section */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {doctors.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Available Doctors ({doctors.length})
              </Typography>

              <Grid container spacing={3}>
                {doctors.map((doctor) => (
                  <Grid item xs={12} key={doctor._id}>
                    <DoctorCard doctor={doctor} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {!loading && doctors.length === 0 && (
            <Box 
              sx={{ 
                textAlign: 'center', 
                mt: 8,
                p: 4,
                bgcolor: 'background.paper',
                borderRadius: 4
              }}
            >
              <Typography 
                variant="h6" 
                color="textSecondary"
                gutterBottom
              >
                No doctors found
              </Typography>
              <Typography color="textSecondary">
                Try different search criteria or check back later
              </Typography>
            </Box>
          )}
        </Container>
      </Container>
    </Box>
  );
};

export default Home; 