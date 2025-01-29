import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Rating,
  TextField,
  Button,
  Alert,
  Box
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoctorReview = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/reviews/appointments/${appointmentId}/review`,
        { rating, comment },
        { withCredentials: true }
      );

      navigate('/appointments', {
        state: {
          success: true,
          message: 'Thank you for your review!'
        }
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom align="center">
          Rate Your Doctor Visit
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography component="legend" gutterBottom>
              Your Rating
            </Typography>
            <Rating
              size="large"
              value={rating}
              onChange={(_, value) => setRating(value)}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Comment (Optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!rating || loading}
          >
            Submit Review
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default DoctorReview; 