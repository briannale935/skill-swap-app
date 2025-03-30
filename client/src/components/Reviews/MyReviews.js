import React, { useEffect, useState } from 'react';
import { 
  Typography, Button, Box, Card, CardContent, 
  Paper, Grid, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Rating 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const MyReviews = () => {
    // State Management
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [currentReview, setCurrentReview] = useState(null);
    const [editFormData, setEditFormData] = useState({
        review_title: '',
        content: '',
        rating: 0
    });

    // Delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);


    // Status notification
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success'});

    // Fetch user's reviews on component mount
    useEffect(() => {
        fetchMyReviews();
    }, []);

    // API Call to Get User's reviews
    const fetchMyReviews = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/my-reviews', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                    // Include authentication token if using JWT or similar
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}

                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }

            const data = await response.json();
            setReviews(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Unable to load your reviews. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Open edit dialog and populate with review data
    const handleEditClick = (review) => {
        setEditFormData({
            review_title: review.review_title,
            content: review.content,
            rating: review.rating
        });
        setEditDialogOpen(true);
    };

    // Handle form field changes
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle rating chagne
    const handleRatingChange = (newValue) => {
        setEditFormData(prev => ({
            ...prev,
            rating: newValue
        }));
    };

    // Update review in the database
    const handleUpdateReview = async () => {
        try {
            const response = await fetch(`/api/reviews/${currentReview.review_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Include authentication if needed
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}
                },
                body: JSON.stringify(editFormData)
            });

            if (!response.ok) {
                throw new Error('Failed to update review');
            }

            // Update local state
            setReviews(prevReviews => 
                prevReviews.map(review => 
                    review.review_id === currentReview.review_id
                    ? {...review, editFormData, last_updated: new Date().toISOString() }
                    :  review
                )
            );

            setEditDialogOpen(false);
            showNotification('Review updated successfully!', 'success');
        } catch (err) {
        console.error('Error updating review:', err);
        showNotification('Failed to update review. Please try again.', 'error');
        }
    };

    // Open delete confirmation dialog
    const handleDeleteClick = (review) => {
        setReviewToDelete(review);
        setDeleteDialogOpen(true);
    };

    // Delete review from the database
    const handleDeleteReview = async () => {
        try {
            const response = await fetch(`/api/reviews/${reviewToDelete.review_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json',
                    // Include authentication if needed
                    // 'Authorizawtion': `Bearer ${localStorage.getItem('token')}
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete review');
            }

            // Update local state
            setReviews(prevReviews =>
                prevReviews.filter(review => review.review_id !== reviewToDelete.review_id)
            );

            setDeleteDialogOpen(false);
            showNotification('Review deleted successfully!', 'success');
        } catch (err) {
            console.error('Error deleteing review:', err);
            showNotification('Failed to delete review. Please try again.', 'error');
        }
    };

    // Show notification
    const showNotification = (message, type) => {
        setNotification({ show: true, message, type});
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
    };

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
            <Typography variant = "h3" component = "h1" gutterbottom sx = {{
                fontWeight: "bold",
                textAlign: "center",
                my: 3
            }} >
                My Reviews
            </Typography>

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
                                You haven't written any reviews yet.
                            </Typography>
                        </Paper>
                    ) : (
                        /* Reviews Grid */
                        <Grid container spacing = {3}>
                            {reviews.map((review) => (
                                <Grid item sx={12} key={review.review_id}>
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
                                                        {review.review_title}
                                                    </Typography>
                                                    <Typography variant = "subtitle1" color = "text.secondary">
                                                        For: {review.recipient_username}
                                                    </Typography>
                                                </Box>

                                                {/* Action Buttons */}
                                                <Box>
                                                    <IconButton
                                                        onClick = {() => handleEditClick(review)}
                                                        aria-label = "edit review"
                                                        color = "primary"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick = {() => handleDeleteClick(review)}
                                                        aria-label = "delete review"
                                                        color = "error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </Box>

                                            {/* Rating */}
                                            <Box sx={{ display: "flex", alignItems: "center", mb: 2}}>
                                                <Rating 
                                                    value = {review.rating}
                                                    readOnly
                                                    precision = {0.5}
                                                    emptyIcon = {<StarBorderIcon fontSize="inherit" />}
                                                    icon = {<StarIcon fontSize = "inherit" />}
                                                />
                                                <Typography variant = "body2" sx = {{ ml: 1 }}>
                                                    ({review.rating}/5)
                                                </Typography>
                                            </Box>

                                            {/* Review Content */}
                                            <Typography>
                                                {review.content}
                                            </Typography>

                                            {/* Timestamps */}
                                            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
                                                <Typography variant = "caption" color = "text.secondary">
                                                    Posted on: {formatDate(review.date_posted)}
                                                </Typography>
                                                {review.last_updated && review.last_updated !== review.date_posted && (
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

                    {/* Edit Dialog */}
                    <Dialog open = {editDialogOpen} onClose = {() => setEditDialogOpen(false)} maxWidth = "md" fullWidth>
                        <DialogTitle>Edit Review</DialogTitle>
                        <DialogContent>
                            <TextField
                                margin = "dense"
                                name = "content"
                                label = "Review Content"
                                multiline
                                rows = {4}
                                fullWidth
                                value = {editFormData.content}
                                onChange = {handleEditFormChange}
                                sx = {{ mb: 2 }}
                            />
                            <Typography component = "legend">Rating</Typography>
                            <Rating 
                                name = "rating"
                                value = {editFormData.rating}
                                precision = {0.5}
                                onChange = {(event, newValue) => {
                                    handleRatingChange(newValue);
                                }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick = {() => setEditDialogOpen(false)} color = "primary">
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateReview} color = "primary" variant = "contained">
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
                            <Button onClick = {handleDeleteReview} color = "error" variant = "contained">
                                Delete Review
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </Box>
    )

};

export default MyReviews