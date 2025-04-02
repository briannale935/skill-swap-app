import React, { useState, useContext, useEffect } from 'react';
import {
  Grid,
  Typography,
  Button,
  TextField,
  Box,
  Card,
  Rating
} from '@mui/material';
import { FirebaseContext } from '../Firebase/context';
import { useLocation } from 'react-router-dom';

const labels = {
  0.5: 'Very Poor',
  1: 'Poor',
  1.5: 'Fair',
  2: 'Okay',
  2.5: 'Average',
  3: 'Good',
  3.5: 'Very Good',
  4: 'Great',
  4.5: 'Excellent',
  5: 'Outstanding',
};

const getLabelText = (value) => `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;

const StarRating = ({ value, setValue }) => {
  const [hover, setHover] = useState(-1);
  const safeValue = value != null ? value : 0;
  const label = (hover !== -1 ? labels[hover] : labels[safeValue]) || '';

  return (
    <Box display="flex" alignItems="center">
      <Rating
        name="hover-feedback"
        value={safeValue}
        precision={0.5}
        getLabelText={getLabelText}
        onChange={(event, newValue) => setValue(newValue)}
        onChangeActive={(event, newHover) => setHover(newHover)}
        size="large"
        icon={<span style={{ color: '#52ab98', fontSize: 'inherit' }}>★</span>}
        emptyIcon={<span style={{ color: '#c8d8e4', fontSize: 'inherit' }}>☆</span>}
      />
      {value != null && <Box sx={{ ml: 2 }}>{label}</Box>}
    </Box>
  );
};

const WriteReviews = ({ recipientId: propRecipientId, onSuccess, onClose }) => {
  const storedUser = JSON.parse(localStorage.getItem('currentUser'));
  const reviewerId = storedUser?.userId;

  const location = useLocation();
  const recipientIdFromState = location.state?.recipientId;
  const recipientId = propRecipientId || recipientIdFromState || 1;

  const firebase = useContext(FirebaseContext);

  useEffect(() => {
    if (firebase && firebase.auth) {
      console.log("Firebase current user:", firebase.auth.currentUser);
    }
  }, [firebase]);

  const [formData, setFormData] = useState({
    title: '',
    text: '',
    rating: null,
  });

  const [message, setMessage] = useState('');
  const [ratingError, setRatingError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.text.trim() || formData.rating == null) {
      setMessage('Please provide a title, review text, and rating.');
      setRatingError(formData.rating == null);
      return;
    }

    if (!reviewerId) {
      setMessage('User not authenticated. Please log in.');
      return;
    }

    if (!recipientId) {
      setMessage('No recipient specified for this review.');
      return;
    }

    try {
      const newReview = {
        reviewer_id: reviewerId,
        recipient_id: recipientId,
        review_title: formData.title,
        content: formData.text,
        rating: formData.rating,
        date_posted: new Date().toISOString(),
      };

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': reviewerId,
        },
        body: JSON.stringify(newReview),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      setMessage('Review submitted successfully!');
      setFormData({ title: '', text: '', rating: null });
      if (typeof onSuccess === 'function') onSuccess();
      if (typeof onClose === 'function') onClose();

    } catch (error) {
      console.error('Error submitting review:', error);
      setMessage(error.message);
    }
  };

  return (
    <Card
      sx={{
        p: 4,
        mb: 5,
        boxShadow: 3,
        backgroundColor: '#ffffff',
        borderRadius: 3,
        border: '1px solid #c8d8e4',
      }}
    >
      <Typography
        variant="h3"
        align="center"
        sx={{
          fontFamily: 'Poppins, sans-serif',
          mb: 3,
          fontWeight: 'bold',
          color: '#2b6777',
        }}
      >
        Review and Rate Your Experience
      </Typography>
      {message && (
        <Typography
          color={message.includes('success') ? 'success.main' : 'error'}
          textAlign="center"
          sx={{ mb: 2 }}
        >
          {message}
        </Typography>
      )}
      <Box sx={{ backgroundColor: '#f2f2f2', p: 3, borderRadius: 2, boxShadow: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Title your review"
                name="title"
                fullWidth
                value={formData.title}
                onChange={handleChange}
                sx={{
                  backgroundColor: '#ffffff',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#c8d8e4',
                    },
                    '&:hover fieldset': {
                      borderColor: '#2b6777',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2b6777',
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Write a review..."
                name="text"
                fullWidth
                multiline
                rows={4}
                value={formData.text}
                onChange={handleChange}
                sx={{
                  backgroundColor: '#ffffff',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#c8d8e4',
                    },
                    '&:hover fieldset': {
                      borderColor: '#2b6777',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2b6777',
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1, color: '#2b6777' }}>
                Rate Your Experience:
              </Typography>
              <StarRating
                value={formData.rating}
                setValue={(newValue) => {
                  setFormData(prev => ({ ...prev, rating: newValue }));
                  setRatingError(false);
                }}
              />
              {ratingError && (
                <Typography color="error" sx={{ mt: 1 }}>
                  Please provide a rating before submitting.
                </Typography>
              )}
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{
                width: '250px',
                height: '50px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#52ab98',
                '&:hover': {
                  backgroundColor: '#2b6777'
                }
              }}
            >
              Submit Review
            </Button>
          </Box>
        </form>
      </Box>
    </Card>
  );
};

export default WriteReviews;
