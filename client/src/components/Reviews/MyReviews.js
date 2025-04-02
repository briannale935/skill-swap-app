import React, { useEffect, useState, useMemo } from 'react';
import { 
  Typography, Button, Box, Card, CardContent, 
  Paper, Grid, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Rating 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

// Inline StarRating Component Integrated into MyReviews.js
// Inline StarRating component integrated into MyReviews.js
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
    />

        {value !== null && (
          <Box sx={{ ml: 2 }}>
            {labels[hover !== -1 ? hover : value]}
          </Box>
        )}
      </Box>
    );
  };


const MyReviews = () => {
    // State Management
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        text: '',
        rating: 0
    });

    // Delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    // Status notification
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success'});

    // Function to show snackbar notifications
    const showSnackbar = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
        setTimeout(() => setNotification({ open: false, message: '', severity: 'success' }), 3000);
    };

    // API Call to Get User's reviews
    const fetchMyReviews = async () => {
        setLoading(true);
        try {
            // Log what is in localStorage before parsing
            const storedUserString = localStorage.getItem('currentUser');
            console.log("Stored user string:", storedUserString);

            // Get the stored user (ensure that currentUser is stored as JSON)
            const storedUser = storedUserString ? JSON.parse(storedUserString) : null;
            if (!storedUser || !storedUser.userId) {
                throw new Error("No user is logged in");
            }
            const userId = storedUser.userId;
            console.log("Fetched userId:", userId);
            
            // Send a GET request to your backend endpoint, including the user-id header.
            const response = await fetch('/api/my-reviews', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Include authentication token if using JWT or similar
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}
                    'user-id': userId
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }

            const data = await response.json();
            console.log("Fetched reviews:", data);
            setReviews(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Unable to load your reviews. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch user's reviews on component mount
    useEffect(() => {
        fetchMyReviews();
    }, []);

    // Open edit dialog and populate with review data
    const handleEditClick = (review) => {
        setSelectedReview(review);
        setEditFormData({
            title: review.review_title,
            text: review.content,
            rating: review.rating
        });
        setEditDialogOpen(true);
    };

    // Close edit dialog
    const handleEditClose = () => {
        setEditDialogOpen(false);
        setSelectedReview(null);
    };

    // Handle form field changes
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev, [name]: value
        }));
    };

    // Handle rating chagne
    const handleRatingChange = (newValue) => {
        setEditFormData(prev => ({ ...prev, rating: newValue }));
    };

    // Update review in the database
    const handleUpdateReview = async (id, updatedReview) => {
        console.log("handleUpdateReview() - Received parameters:", { id, updatedReview });
        if (!updatedReview || !updatedReview.title || !updatedReview.text || updatedReview.rating == null) {
            console.error("handleUpdateReview() - Updated review data is invalid", updatedReview);
            setNotification({ open: true, message: "Error: Please fill out all fields correctly.", severity: 'error' });
            return;
          }
        console.log("handleUpdateReview() - Sending update request:", id, updatedReview);
        try {
            const storedUser = JSON.parse(localStorage.getItem('currentUser'));
            const userId = storedUser.userId;
            const response = await fetch(`/api/reviews/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': userId,
                    // Include authentication if needed
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}
                },
                body: JSON.stringify({
                    review_title: updatedReview.title,
                    content: updatedReview.text,
                    rating: updatedReview.rating
                  }),
            });
            const responseData = await response.json();
            console.log("Updated Review Response:", responseData);
            if (!response.ok) {
                throw new Error('Failed to update review');
            }

            // Update UI immediately with the new review data
            setReviews(prevReviews => 
                prevReviews.map(review => 
                    review.review_id === id
                    ? {...review, 
                        review_title: updatedReview.title,
                        content: updatedReview.text,
                        rating: updatedReview.rating,
                        last_updated: responseData.last_updated
                    }
                    :  review
                )
            );

            setNotification({ open: true, message: "Review updated successfully!", severity: "success" });
            setEditDialogOpen(false);
        } catch (err) {
        console.error('Error updating review:', err);
        setNotification({ open: true, message: error.message || "Error updating review.", severity: "error" });
        }
    };

    // Calculate Average Rating (NEW SECTION)
    const averageRating = useMemo(() => {
        const validRatings = reviews
            .map(review => parseFloat(review.rating))
            .filter(rating => !isNaN(rating));

        if (validRatings.length === 0) return 0;

        const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
        return (sum / validRatings.length).toFixed(1);
    }, [reviews]);

    // Open delete confirmation dialog
    const handleDeleteClick = (review) => {
        setReviewToDelete(review);
        setDeleteDialogOpen(true);
    };

    // Handle Deleting a Review from database
    const handleDeleteReview = async (id) => {
        if (!id) return;

        try {
            // Log the review ID and check current user
            console.log("Attempting to delete review with id:", id);
            const storedUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!storedUser || !storedUser.userId) {
                throw new Error("No user is logged in");
              }
            const userId = storedUser.userId;

            // Send delete request to the backend with the user-id
            const response = await fetch(`/api/reviews/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json',
                    'user-id': userId,
                    // Include authentication if needed
                    // 'Authorizawtion': `Bearer ${localStorage.getItem('token')}
                }
            });

            if (!response.ok) {
                const resData = await response.json();
                throw new Error(resData.error || 'Failed to delete review');
            }

            // Update local state
            setReviews(prevReviews => prevReviews.filter(review => review.review_id !== id));
            setNotification({ open: true, message: "Review deleted successfully!", severity: "success" });
            setDeleteDialogOpen(false);
        } catch (err) {
            console.error('Error deleteing review:', err);
            setNotification({ open: true, message: error.message || "Error deleting review.", severity: "error" });
        }
    };

    // // Show notification
    // const showNotification = (message, type) => {
    //     setNotification({ show: true, message, type});
    //     setTimeout(() => {
    //         setNotification({ show: false, message: '', type: 'success' });
    //     }, 3000);
    // };

    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <Box sx = {{ maxWidth: 1000, margin: "0 auto", p: 4}}>
            {/* Page Title */}
            <Typography variant = "h3" component = "h1" gutterbottom sx = {{ fontWeight: "bold", textAlign: "center", my: 3
            }} >
                My Reviews
            </Typography>

            {/* Average Rating Meter (NEW SECTION) */}
            {reviews.length > 0 && (
                <Paper sx={{ p: 4, mb: 3, backgroundColor: '#ffffff', borderRadius: 3, boxShadow: 4 }}>
                <Typography variant="h5" align="center" sx={{ mb: 1 }}>
                    Average Rating Across Your Reviews: {averageRating} ★
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flexGrow: 1, mr: 2, height: 10, borderRadius: 5, backgroundColor: '#ddd' }}>
                        <Box sx={{ width: `${(parseFloat(averageRating) / 5) * 100}%`, height: '100%', backgroundColor: '#4caf50', borderRadius: 5 }} />
                    </Box>
                        <Typography variant="body2">{averageRating} / 5</Typography>
                    </Box>
                </Paper>
      )}

            {/* Total Review Count */}
            {reviews.length > 0 && (
                <Typography 
                    variant="h5" 
                    align="center" 
                    sx={{ mt: 2, mb: 3, color: "#555", fontWeight: "500" }}
                >
                    You have currently written {reviews.length} {reviews.length === 1 ? "review" : "reviews"}.
                </Typography>
        )}

            {/* Error Message */}
            {error && (
                <Paper sx= {{ p: 2, mb: 3, bgcolor: '#ffebee' }}>
                    <Typography color = "error" >{error}</Typography>
                </Paper>
            )}

            {/* Loading State */}
            {loading ? (
                <Typography variant = "body1" sx = {{ textAlign: "center" }}>Loading Your Reviews...</Typography>
            ) : (
                <>
                    {/* No Reviews Message */}
                    {reviews.length === 0 ? (
                        <Paper sx = {{ p: 4, textAlign: "center" }}>
                            <Typography variant = "h6">
                                You haven't written any reviews yet. Be sure to share your skill swap experiences.
                            </Typography>
                        </Paper>
                    ) : ( 
                        /* Reviews Grid */
                        <Grid container spacing = {3}>
                            {reviews.map((review) => (
                                <Grid item xs={12} key={review.review_id}>
                                    <Card sx = {{
                                        p: 2,
                                        boxShadow: 3,
                                        transition: "all 0.3s",
                                        "&:hover": {boxShadow: 6}
                                    }}>
                                        <CardContent>
                                            {/* Review Header */}
                                            <Box sx = {{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-start",
                                                mb: 2
                                            }}>
                                                <Box>
                                                    <Typography variant = "h5" component = "h2" sx = {{ fontWeight: "bold" }}>
                                                        {String(review.review_title)}
                                                    </Typography>
                                                    {/* <Typography variant = "subtitle1" color = "text.secondary">
                                                        For: {review.recipient_username ? String(review.recipient_username) : 'Anonymous' }
                                                    </Typography> */}
                                                </Box>

                                                {/* Action Buttons */}
                                                <Box>
                                                    <IconButton
                                                        onClick = {() => handleEditClick(review)}
                                                        aria-label = "edit review"
                                                        color = "primary"
                                                    >
                                                        <span style={{ fontSize: "1.5rem", display: "inline-block" }}>✏️  </span>
                                                    </IconButton>
                                                    <IconButton
                                                        onClick = {() => handleDeleteClick(review)}
                                                        aria-label = "delete review"
                                                        color = "error"
                                                    >
                                                        <span style={{ fontSize: "1.5rem", display: "inline-block" }}>🗑️</span>
                                                    </IconButton>
                                                </Box>
                                            </Box>

                                            {/* Rating */}
                                            <Box sx={{ display: "flex", alignItems: "center", mb: 2}}>
                                                <Rating 
                                                    value = {review.rating}
                                                    readOnly
                                                    precision = {0.5}
                                                    emptyIcon={<span style={{ fontSize: "inherit", color: "#aaa" }}>☆</span>}
                                                    icon={<span style={{ fontSize: "inherit", color: "gold" }}>★</span>}
                                                />
                                                <Typography variant = "body2" sx = {{ ml: 1 }}>
                                                    {Number(review.rating)}/5
                                                </Typography>
                                            </Box>

                                            {/* Review Content */}
                                            <Typography>
                                                {typeof review.content === 'object' ? JSON.stringify(review.content) : review.content}
                                            </Typography>

                                            {/* Timestamps */}
                                            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
                                                <Typography variant = "caption" color = "text.secondary">
                                                    Posted on: {formatDate(review.date_posted)}
                                                </Typography>
                                                {review.last_updated && (
                                                    <Typography variant = "caption" color = "text.secondary">
                                                        Last Updated: {formatDate(review.last_updated)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* Notification */}
                    {notification.show && (
                        <Box sx = {{
                            position: 'fixed',
                            bottom: 24,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            p: 2,
                            bgcolor: notification.type === 'success' ? '#e8f5e9' : '#ffebee',
                            borderRadius: 1,
                            boxShadow: 3,
                            zIndex: 1000
                        }}>
                            <Typography color = {notification.type == 'success' ? 'success.main' : 'error.main'}>
                                {notification.message}
                            </Typography>
                        </Box>
                    )}

                    {/* Edit Review Dialog */}
                    <Dialog open = {editDialogOpen} onClose = {() => setEditDialogOpen(false)} maxWidth = "md" fullWidth>
                        
                        <DialogTitle>Edit Review</DialogTitle>
                        <DialogContent>
                            <TextField
                                margin="dense"
                                name="title"
                                label="Edit Title"
                                fullWidth
                                value={editFormData.title}
                                onChange={handleEditFormChange}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                margin = "dense"
                                name = "text"
                                label = "Edit Review"
                                fullwidth
                                multiline
                                rows = {4}
                                fullWidth
                                value = {editFormData.text}
                                onChange = {handleEditFormChange}
                                sx = {{ mb: 2 }}
                            />

                            <Typography component = "legend">Rating</Typography>
                            <StarRatingComponent value={editFormData.rating} setValue={handleRatingChange} />
                        </DialogContent>
                        <DialogActions>
                        <Button onClick={handleEditClose} color="secondary">Cancel</Button>
                            <Button onClick={() => handleUpdateReview(selectedReview.review_id, editFormData)} color = "primary" variant = "contained">
                                Save Changes
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/*Delete Confirmation Dialog*/}
                    <Dialog open = {deleteDialogOpen} onClose = {() => setDeleteDialogOpen(false)}>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Are you sure you want to delete this review? This action cannot be undone.
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick = {() => setDeleteDialogOpen(false)} color = "primary">
                                Cancel
                            </Button>
                            <Button onClick={() => handleDeleteReview(Number(reviewToDelete.review_id))} color="error" variant="contained">
                                Delete Review
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </Box>
    )

};

export default MyReviews;