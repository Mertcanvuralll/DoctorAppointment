import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Rating,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const ReviewForm = ({ appointmentId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.length < 10) {
      setError('Please write a comment (minimum 10 characters)');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/reviews`,
        {
          appointmentId,
          rating,
          comment
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        onSuccess?.();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Rate Your Experience
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography component="legend" gutterBottom>
            Rating
          </Typography>
          <Rating
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            size="large"
            precision={0.5}
          />
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Your Review"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          error={comment.length > 0 && comment.length < 10}
          helperText={
            comment.length > 0 && comment.length < 10
              ? 'Minimum 10 characters required'
              : ''
          }
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading || rating === 0 || comment.length < 10}
          sx={{ minWidth: 200 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Review'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ReviewForm; 