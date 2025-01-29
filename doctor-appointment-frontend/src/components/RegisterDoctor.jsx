import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { 
  LocalHospital,
  AccessTime,
  LocationOn,
  Email,
  Person,
  MedicalServices
} from '@mui/icons-material';
import LocationPicker from './LocationPicker';

// Custom style components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(to right, #1976d2, #64b5f6)'
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  color: theme.palette.primary.main,
  '& svg': {
    marginRight: theme.spacing(1)
  }
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }
  }
}));

const DaysContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1)
}));

const DayChip = styled(Box)(({ theme, selected }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: '20px',
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.grey[300]}`,
  backgroundColor: selected ? theme.palette.primary.main : 'transparent',
  color: selected ? theme.palette.common.white : theme.palette.text.primary,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : theme.palette.grey[100]
  }
}));

const RegisterDoctor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    specialization: '',
    availableDays: {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false
    },
    workingHours: {
      start: '10:00',
      end: '20:00'
    },
    address: {
      street: '',
      city: '',
      district: '',
      coordinates: null
    }
  });

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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

  const weekDays = [
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' }
  ];

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ 
        ...prev, 
        email: user.email,
        fullName: user.name || ''
      }));
    }
    fetchCities();
  }, [user]);

  const fetchCities = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/locations/cities`);
      if (response.data.success) {
        setCities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchDistricts = async (cityId) => {
    try {
      console.log('Fetching districts for city:', cityId); 
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/locations/districts/${cityId}`);
      console.log('Districts response:', response.data);
      if (response.data.success) {
        setDistricts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const handleCloseDialog = () => {
    if (registrationSuccess) {
      navigate('/');
    }
    setOpenDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Debug form data
    console.log('User:', user);
    console.log('Form Data:', formData);

    if (!user?.email) {
      setError('Email is required. Please login again.');
      setLoading(false);
      return;
    }

    try {
      // Edit working days
      const availableDays = Object.entries(formData.availableDays)
        .filter(([_, isSelected]) => isSelected)
        .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1));

      const doctorData = {
        email: user.email, 
        userId: user._id, 
        fullName: formData.fullName,
        specialization: formData.specialization,
        availableDays: availableDays,
        workingHours: formData.workingHours,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          district: formData.address.district,
          coordinates: formData.address.coordinates
        }
      };

      console.log('Sending doctor data:', doctorData); 

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/doctors/register`,
        doctorData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setError('');
        setRegistrationSuccess(true);
        setOpenDialog(true);
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      setError(error.response?.data?.message || 'An error occurred during registration');
      setOpenDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));

      if (parent === 'address' && child === 'city') {
        fetchDistricts(value);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDayChange = (day) => {
    setFormData(prev => ({
      ...prev,
      availableDays: {
        ...prev.availableDays,
        [day]: !prev.availableDays[day]
      }
    }));
  };

  const handleLocationChange = (coordinates) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        coordinates
      }
    }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <StyledPaper>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LocalHospital sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            ADD ME AS DOCTOR
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Join our medical community and start helping patients
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(255,0,0,0.1)' 
            }}
          >
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,255,0,0.1)' 
            }}
          >
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <IconWrapper>
                <Email />
                <Typography variant="subtitle2">Email Address</Typography>
              </IconWrapper>
              <StyledTextField
                fullWidth
                value={formData.email}
                disabled
                sx={{ backgroundColor: 'grey.50' }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <IconWrapper>
                <Person />
                <Typography variant="subtitle2">Full Name</Typography>
              </IconWrapper>
              <StyledTextField
                fullWidth
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </Grid>

            <Grid item xs={12}>
              <IconWrapper>
                <MedicalServices />
                <Typography variant="subtitle2">Area of Interest</Typography>
              </IconWrapper>
              <StyledFormControl fullWidth required>
                <Select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  displayEmpty
                >
                  <MenuItem disabled value="">
                    Select your specialization
                  </MenuItem>
                  {specializations.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </Select>
              </StyledFormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <IconWrapper>
                <AccessTime />
                <Typography variant="subtitle2">Available Days</Typography>
              </IconWrapper>
              <DaysContainer>
                {weekDays.map(({ key, label }) => (
                  <DayChip
                    key={key}
                    selected={formData.availableDays[key]}
                    onClick={() => handleDayChange(key)}
                  >
                    {label}
                  </DayChip>
                ))}
              </DaysContainer>
            </Grid>

            <Grid item xs={12} md={6}>
              <IconWrapper>
                <AccessTime />
                <Typography variant="subtitle2">Working Hours</Typography>
              </IconWrapper>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <StyledTextField
                    fullWidth
                    label="Start Time"
                    type="time"
                    name="workingHours.start"
                    value={formData.workingHours.start}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <StyledTextField
                    fullWidth
                    label="End Time"
                    type="time"
                    name="workingHours.end"
                    value={formData.workingHours.end}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <IconWrapper>
                <LocationOn />
                <Typography variant="subtitle2">Location Details</Typography>
              </IconWrapper>
              <StyledTextField
                fullWidth
                label="Address"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                multiline
                rows={2}
                required
                placeholder="Enter your office address"
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <StyledFormControl fullWidth required>
                    <InputLabel>City</InputLabel>
                    <Select
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      label="City"
                    >
                      {cities.map((city) => (
                        <MenuItem key={city.id} value={city.id}>
                          {city.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </StyledFormControl>
                </Grid>
                <Grid item xs={6}>
                  <StyledFormControl fullWidth required disabled={!formData.address.city}>
                    <InputLabel>District</InputLabel>
                    <Select
                      name="address.district"
                      value={formData.address.district}
                      onChange={handleChange}
                      label="District"
                    >
                      {Array.isArray(districts) && districts.map((district) => (
                        <MenuItem 
                          key={district} 
                          value={district}
                        >
                          {district}
                        </MenuItem>
                      ))}
                    </Select>
                  </StyledFormControl>
                </Grid>
              </Grid>

              <LocationPicker
                value={formData.address.coordinates}
                onChange={handleLocationChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
                sx={{
                  py: 1.5,
                  mt: 2,
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(25,118,210,0.4)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'REGISTER AS DOCTOR'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </StyledPaper>

      {/* Result Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="registration-dialog-title"
        aria-describedby="registration-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minWidth: { xs: '90%', sm: '400px' }
          }
        }}
      >
        <DialogTitle 
          id="registration-dialog-title"
          sx={{
            bgcolor: registrationSuccess ? 'success.light' : 'error.light',
            color: 'white',
            py: 2
          }}
        >
          {registrationSuccess ? 'Registration Successful!' : 'Registration Failed'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText id="registration-dialog-description">
            {registrationSuccess ? (
              <>
                Your registration has been submitted successfully!
                <br /><br />
                Our admin team will review your application and you will be notified via email
                once your account is approved. This process usually takes 24-48 hours.
              </>
            ) : (
              error
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            color={registrationSuccess ? "success" : "primary"}
            fullWidth
            sx={{
              borderRadius: '8px',
              py: 1,
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            {registrationSuccess ? "Got it, take me home" : "Close"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RegisterDoctor; 