import React from 'react';
import {
  Box,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Grid,
  TextField
} from '@mui/material';

const WorkingHoursSelector = ({ value, onChange }) => {
  const days = [
    { id: 'mon', label: 'Monday' },
    { id: 'tue', label: 'Tuesday' },
    { id: 'wed', label: 'Wednesday' },
    { id: 'thu', label: 'Thursday' },
    { id: 'fri', label: 'Friday' },
    { id: 'sat', label: 'Saturday' },
    { id: 'sun', label: 'Sunday' }
  ];

  const selectedDays = value?.days || [];

  const handleDayChange = (day) => (event) => {
    const newDays = event.target.checked
      ? [...selectedDays, day]
      : selectedDays.filter(d => d !== day);

    onChange({
      ...value,
      days: newDays
    });
  };

  const handleTimeChange = (field) => (event) => {
    onChange({
      ...value,
      [field]: event.target.value
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Working Hours
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <Typography variant="subtitle1" gutterBottom>
              Available Days
            </Typography>
            <FormGroup>
              {days.map((day) => (
                <FormControlLabel
                  key={day.id}
                  control={
                    <Checkbox
                      checked={selectedDays.includes(day.id)}
                      onChange={handleDayChange(day.id)}
                    />
                  }
                  label={day.label}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Start Time"
            type="time"
            value={value.start}
            onChange={handleTimeChange('start')}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="End Time"
            type="time"
            value={value.end}
            onChange={handleTimeChange('end')}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkingHoursSelector; 