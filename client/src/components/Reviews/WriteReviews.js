import React, { useState, useContext, useEffect } from 'react';
import { Grid, Typography, Button, TextField, Box, Card, Rating,
          Dialog, DialogTitle, DialogContent, DialogActions
 } from '@mui/material';
import { FirebaseContext } from '../Firebase/context';
import { useLocation } from 'react-router-dom';

// Rating labels
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
 
const getLabelText = (value) =>
  `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;

// Inline StarRating Component with safeguards
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
        // No custom emptyIcon—using the default icon
        size="large"
      />
      {value != null && (
        <Box sx={{ ml: 2 }}>
          {label}
        </Box>
      )}
    </Box>
  );
};

const WriteReviews = () => {
  // CORRECTION #1: Initialize reviewerId from localStorage (using the SQL DB userId)
  const storedUser = JSON.parse(localStorage.getItem('currentUser'));
  const reviewerId = storedUser?.userId; // reviewerId set
 
  // Extract recipientId from navigation state
  const location = useLocation();
  const recipientId = location.state?.recipientId || 1; // Default to 1 if not provided

  // For debugging: log recipientId
  console.log('Recipient ID for review:', recipientId);

  // // Get Firebase instance from context
  const firebase = useContext(FirebaseContext);
  console.log('Firebase context:', firebase);

  // For debugging: log firebase and attach it to the window object
  useEffect(() => {
    console.log("Firebase context:", firebase);
    if (firebase && firebase.auth) {
      console.log("Firebase current user (Firebase UID):", firebase.auth.currentUser);
    }
  }, [firebase]);

  const [formData, setFormData] = useState({
    title: '',
    text: '',
    rating: null,
  });
  const [message, setMessage] = useState('');
  const [ratingError, setRatingError] = useState(false);
  // const [reviewerId, setReviewerId] = useState(null);

  // // For now, use a dummy recipient id of 1
  // const dummyRecipientId = 1;
  
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

    try {
      // Construct the review payload. Adjust recipient_id as needed.
      const newReview = {
        reviewer_id: reviewerId,
        recipient_id: recipientId, // For testing, we're using 1. Replace or set dynamically.
        review_title: formData.title,
        content: formData.text,
        rating: formData.rating,
        date_posted: new Date().toISOString(), // Optionally let backend set this via CURRENT_TIMESTAMP
      };

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': reviewerId, // Replace with the actual logged-in user's id
        },
        body: JSON.stringify(newReview),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      setMessage('Review submitted successfully!');
      // Reset form data
      setFormData({ title: '', text: '', rating: null });
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
        backgroundColor: '#f9f9f9',
        borderRadius: 3,
      }}
    >
      <Typography
        variant="h3"
        align="center"
        sx={{
          fontFamily: 'Poppins, sans-serif',
          mb: 3,
          fontWeight: 'bold',
          color: '#333',
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
      <Box sx={{ backgroundColor: '#fff', p: 3, borderRadius: 2, boxShadow: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Title your review"
                name="title"
                fullWidth
                value={formData.title}
                onChange={handleChange}
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
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1 }}>
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