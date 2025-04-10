import React, { useEffect, useState, useMemo } from 'react';
import {
  Typography, Button, Box, Card, CardContent,
  Paper, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Rating
} from '@mui/material';

const StarRatingComponent = ({ value, setValue }) => {
  const [hover, setHover] = useState(-1);
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
  return (
    <Box display="flex" alignItems="center">
      <Rating
        name="edit-rating"
        value={value}
        precision={0.5}
        getLabelText={getLabelText}
        onChange={(event, newValue) => setValue(newValue)}
        onChangeActive={(event, newHover) => setHover(newHover)}
        size="large"
        sx={{ color: '#2b6777' }}
      />
      {value !== null && (
        <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : value]}</Box>
      )}
    </Box>
  );
};

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', text: '', rating: 0 });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const fetchMyReviews = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!storedUser || !storedUser.userId) throw new Error("No user is logged in");
      const response = await fetch('/api/my-reviews', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'user-id': storedUser.userId }
      });
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data);
      setError(null);
    } catch (err) {
      setError('Unable to load your reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyReviews(); }, []);

  const handleEditClick = (review) => {
    setSelectedReview(review);
    setEditFormData({
      title: review.review_title || '',
      text: typeof review.content === 'string' ? review.content : '',
      rating: review.rating || 0,
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedReview(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (newValue) => {
    setEditFormData(prev => ({ ...prev, rating: newValue }));
  };

  const handleUpdateReview = async (id, updatedReview) => {
    if (!updatedReview.title || !updatedReview.text || updatedReview.rating == null) {
      setNotification({ show: true, message: "Please fill out all fields.", type: 'error' });
      return;
    }
    try {
      const storedUser = JSON.parse(localStorage.getItem('currentUser'));
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': storedUser.userId,
        },
        body: JSON.stringify({
          review_title: updatedReview.title,
          content: updatedReview.text,
          rating: updatedReview.rating
        }),
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error('Failed to update review');

      setReviews(prev =>
        prev.map(r =>
          r.review_id === id
            ? {
                ...r,
                review_title: updatedReview.title,
                content: updatedReview.text,
                rating: updatedReview.rating,
                last_updated: responseData.last_updated
              }
            : r
        )
      );

      setNotification({ show: true, message: "Review updated successfully!", type: "success" });
      setEditDialogOpen(false);
    } catch (err) {
      setNotification({ show: true, message: err.message || "Error updating review.", type: "error" });
    }
  };

  const handleDeleteClick = (review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  const handleDeleteReview = async (id) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('currentUser'));
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'user-id': storedUser.userId }
      });
      if (!response.ok) throw new Error('Failed to delete review');
      setReviews(prev => prev.filter(r => r.review_id !== id));
      setNotification({ show: true, message: "Review deleted successfully!", type: "success" });
      setDeleteDialogOpen(false);
    } catch (err) {
      setNotification({ show: true, message: err.message || "Error deleting review.", type: "error" });
    }
  };

  const averageRating = useMemo(() => {
    const validRatings = reviews.map(r => parseFloat(r.rating)).filter(r => !isNaN(r));
    if (!validRatings.length) return 0;
    return (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1);
  }, [reviews]);

  const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  });

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 4 }}>
      <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: "bold", my: 3, color: "#2b6777" }}>
        My Reviews
      </Typography>

      {reviews.length > 0 && (
        <Paper sx={{ p: 4, mb: 3, backgroundColor: '#c8d8e4', borderRadius: 3, boxShadow: 4 }}>
          <Typography variant="h5" align="center" sx={{ mb: 1, color: '#2b6777' }}>
            Average Rating: {averageRating} ★
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ flexGrow: 1, mr: 2, height: 10, borderRadius: 5, backgroundColor: '#f2f2f2' }}>
              <Box sx={{ width: `${(parseFloat(averageRating) / 5) * 100}%`, height: '100%', backgroundColor: '#52ab98', borderRadius: 5 }} />
            </Box>
            <Typography variant="body2" sx={{ color: '#2b6777' }}>{averageRating} / 5</Typography>
          </Box>
        </Paper>
      )}

      {reviews.length > 0 && (
        <Typography variant="h5" align="center" sx={{ mt: 2, mb: 3, color: "#555" }}>
          You have written {reviews.length} {reviews.length === 1 ? "review" : "reviews"}.
        </Typography>
      )}

      {error && <Paper sx={{ p: 2, mb: 3, bgcolor: '#ffebee' }}><Typography color="error">{error}</Typography></Paper>}
      {loading ? (
        <Typography align="center">Loading Your Reviews...</Typography>
      ) : (
        <Grid container spacing={3}>
          {reviews.map((review) => (
            <Grid item xs={12} key={review.review_id}>
              <Card sx={{ p: 2, boxShadow: 3, backgroundColor: "#ffffff", border: "1px solid #c8d8e4", borderRadius: "16px", transition: "0.3s", '&:hover': { boxShadow: 6 } }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2b6777" }}>{review.review_title}</Typography>
                    <Box>
                      <Button onClick={() => handleEditClick(review)} color="primary">Edit</Button>
                      <Button onClick={() => handleDeleteClick(review)} color="error">Delete</Button>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Rating value={Number(review.rating)} readOnly precision={0.5} sx={{ color: '#2b6777' }} />
                    <Typography variant="body2" sx={{ ml: 1 }}>{Number(review.rating)}/5</Typography>
                  </Box>
                  <Typography sx={{ whiteSpace: 'pre-line' }}>
                    {typeof review.content === 'string' ? review.content : '[No text review]'}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">Posted on: {formatDate(review.date_posted)}</Typography>
                    {review.last_updated && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                        Last Updated: {formatDate(review.last_updated)}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 'bold', mt: 2 }}>
                    Written for: {review.recipient_username ? review.recipient_username : 'Anonymous'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {notification.show && (
        <Box sx={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', p: 2, bgcolor: notification.type === 'success' ? '#e0f2f1' : '#ffebee', borderRadius: 2, border: `1px solid ${notification.type === 'success' ? '#52ab98' : '#f44336'}`, boxShadow: 3 }}>
          <Typography sx={{ color: notification.type === 'success' ? '#2b6777' : '#c62828' }}>{notification.message}</Typography>
        </Box>
      )}

      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#2b6777", color: "#ffffff" }}>Edit Review</DialogTitle>
        <DialogContent sx={{ bgcolor: "#f2f2f2" }}>
          <TextField
            name="title"
            label="Edit Title"
            fullWidth
            value={editFormData.title}
            onChange={handleEditFormChange}
            sx={{ mt: 3, mb: 2, bgcolor: "#ffffff" }}
          />
          <TextField
            name="text"
            label="Edit Review"
            multiline
            rows={4}
            fullWidth
            value={editFormData.text}
            onChange={handleEditFormChange}
            sx={{ mb: 2, bgcolor: "#ffffff" }}
          />
          <Typography component="legend">Rating</Typography>
          <StarRatingComponent value={editFormData.rating} setValue={handleRatingChange} />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleEditClose}
            variant="outlined"
            sx={{
              color: '#2b6777',
              borderColor: '#2b6777',
              '&:hover': {
                borderColor: '#255c6c',
                backgroundColor: 'rgba(43, 103, 119, 0.04)',
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleUpdateReview(selectedReview.review_id, editFormData)}
            variant="contained"
            sx={{ bgcolor: '#2b6777', '&:hover': { bgcolor: '#255c6c' } }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete this review?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={() => handleDeleteReview(reviewToDelete.review_id)} color="error" variant="contained">Delete Review</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyReviews;
