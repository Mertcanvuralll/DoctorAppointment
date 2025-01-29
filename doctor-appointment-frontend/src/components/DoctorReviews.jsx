import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Rating,
  Typography,
  Box,
  Divider,
  IconButton,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';

const DoctorReviews = ({ open, onClose, doctorName, reviews, totalReviews }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Reviews for Dr. {doctorName}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {reviews.length === 0 ? (
          <Typography color="text.secondary" align="center" py={3}>
            No reviews yet
          </Typography>
        ) : (
          <Stack spacing={2}>
            {reviews.map((review, index) => (
              <Box key={review.id}>
                {index > 0 && <Divider sx={{ my: 2 }} />}
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {review.userName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                  <Rating value={review.rating} readOnly size="small" />
                  {review.comment && (
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {review.comment}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DoctorReviews; 