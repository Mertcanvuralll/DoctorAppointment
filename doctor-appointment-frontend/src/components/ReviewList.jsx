import React from 'react';
import {
  Box,
  Typography,
  Rating,
  Card,
  CardContent,
  Divider
} from '@mui/material';

const ReviewList = ({ reviews }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Reviews
      </Typography>

      {reviews.map((review) => (
        <Card key={review._id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating value={review.rating} readOnly />
              <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body1">
              {review.comment}
            </Typography>
          </CardContent>
        </Card>
      ))}

      {reviews.length === 0 && (
        <Typography color="text.secondary">
          No reviews yet
        </Typography>
      )}
    </Box>
  );
};

export default ReviewList; 