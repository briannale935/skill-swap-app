import React, { useEffect, useState, useMemo } from 'react';
import { Grid, Typography, Card, CardContent, Box, Paper, LinearProgress } from '@mui/material';

const ProfileReviews = ({ fetchProfileReviews }) => {
  // State for storing reviews and any message (e.g., error messages)
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (fetchProfileReviews) {
      fetchProfileReviews()
        .then((data) => setReviews(data))
        .catch((error) => {
          console.error("Error fetching profile reviews:", error);
          setMessage("Error fetching profile reviews.");
        });
    }
  }, [fetchProfileReviews]);

  // Calculate the average rating using useMemo for performance
  const averageRating = useMemo(() => {
    const validRatings = reviews
      .map((review) => parseFloat(review.rating))
      .filter((rating) => !isNaN(rating));

    if (validRatings.length === 0) return 0;

    const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
    return (sum / validRatings.length).toFixed(1);
  }, [reviews]);

  return (
    <Box sx={{ maxWidth: 900, margin: 'auto', p: 4 }}>
      <Paper sx={{ p: 4, backgroundColor: '#ffffff', borderRadius: 3, boxShadow: 4 }}>
        <Typography
          variant="h4"
          align="center"
          sx={{ mb: 3, fontWeight: 'bold', color: '#222' }}
        >
          Profile Reviews
        </Typography>

        {reviews.length > 0 && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Card sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 1 }}>
                Average Rating For This Profile: {averageRating} ★
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LinearProgress
                  variant="determinate"
                  value={(parseFloat(averageRating) / 5) * 100}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#ddd',
                    flexGrow: 1,
                    mr: 2,
                  }}
                />
                <Typography variant="body2">{averageRating} / 5</Typography>
              </Box>
            </Card>
          </Box>
        )}

        {reviews.length > 0 ? (
          <Typography
            variant="h5"
            align="center"
            sx={{ mt: 2, mb: 3, color: '#555', fontWeight: '500' }}
          >
            There are currently {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} for this profile.
          </Typography>
        ) : (
          <Typography align="center" sx={{ fontSize: '18px', color: '#666' }}>
            No reviews available yet.
          </Typography>
        )}

        <Grid container spacing={3}>
          {reviews.map((review) => (
            <Grid item xs={12} key={review.review_id}>
              <Card sx={{ p: 3, mb: 2, boxShadow: 2, borderRadius: 2 }}>
                <CardContent>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: '#333', mb: 1 }}
                  >
                    {review.review_title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: '#444', mt: 1, fontSize: '16px', lineHeight: '1.6' }}
                  >
                    {review.content}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="primary"
                    sx={{ mt: 2, fontWeight: 'bold', fontSize: '16px' }}
                  >
                    Rating: {review.rating ? `${review.rating}` : 'No rating provided'}
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#666' }}>
                    <strong>Posted on:</strong>{' '}
                    {review.date_posted
                      ? new Date(review.date_posted).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })
                      : 'Date not available'}
                  </Typography>
                  {review.last_updated && (
                    <Typography
                      variant="caption"
                      sx={{ mt: 1, display: 'block', color: '#666' }}
                    >
                      <strong>Last Updated:</strong>{' '}
                      {new Date(review.last_updated).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </Typography>
                  )}
                  <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 'bold', mt: 2 }}>
                    Written by: {review.reviewer_username ? review.reviewer_username : 'Anonymous'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProfileReviews;
