import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Rating, Box, TextField, Button, Typography, Paper, Container } from '@mui/material';
import axios from 'axios';

const Review = () => {
  const { appointmentId } = useParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const axiosInstance = axios.create({
        baseURL: 'http://localhost:3001',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Sending review:', {
        appointmentId,
        rating,
        comment
      });

      const response = await axiosInstance.post(`/api/v1/appointments/${appointmentId}/review`, {
        rating,
        comment
      });

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Review submission error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || err.response?.data?.error || 'Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="primary" gutterBottom>
            Thank you for your feedback!
          </Typography>
          <Typography variant="body1">
            Your review has been submitted successfully.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Rate Your Visit
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Your Rating
            </Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
              size="large"
              sx={{ mt: 1 }}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Your Comment (Optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 3 }}
          />

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !rating}
            sx={{ mt: 2 }}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Review;