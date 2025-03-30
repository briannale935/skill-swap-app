import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, Rating,
    Card, CardContent, Container, paper,
    Snackbar, Alert, CircularProgress
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const WriteReview = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const location = useLocation();
    const recipientInfo = location.state?.recipientInfo || {};
}

// Review form state
const [formData, setFormData] = useState ({
    title: '',
    content: '',
    rating: null
});

// UI state
const [errors, setErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
});
const [recipient, setRecipient] = useState(recipientInfo);

// Fetch recipient info if it wasn't passed through navigation state
useEffect(() => {
    if (!recipient.username && userId) {
        fetchRecipientInfo();
    }
}, [userId, recipient]);

const fetchRecipientInfo = async () => {
    try {
        const response = await fetch(`/api/users/%{userId}`);
        if (!response.ok) throw new Error('Failed to fetch user info');

        const userDate = await response.json();
        setRecipient(userData);
    } catch (error) {
        console.error('Error fetching recipient info:', error);
        setSnackbar({
            open: true,
            message: 'Unable to load user information',
            severity: 'error'
        });
    }
};


// Handle form field changes
const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: value
    }));

    // Clear error for the field being changed
    if (errors[name]) {
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    }
};

// Handle Rating Chagne
const handleRatingChange = (newValue) => {
    setFormData(prev => ({
        ...prev,
        rating: newValue
    }));

    if (errors.rating) {
        setErrors(prev => ({
            ...prev,
            rating: ''
        }));
    }
};

// Form validation
const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()){
        newErrors.content = 'Review content is required';
    } else if (formData.content.length < 10) {
        newErrors.content = 'Review content must be at least 10 characters';
    }

    if (formData.rating === null) {
        newwErrors.rating = 'Please provide a rating';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

// Handle form submission
const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    setIsSubmitting(true);

    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include authentication header if using JWT
                // 'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                recipient_id: userId,
                review_title: formData.title,
                content: formData.content,
                rating: formData.rating
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to submit review');
        }

        setSnackbar({
            open: true,
            message: 'Review submitted successfully!',
            severity: 'success'
        });

        // Reset form after successful submission
        setFormData({
            title: '',
            content: '',
            rating: null
        });

        // Redirect after a short delay to allow the user to see the success message
        setTimeout(() => {
            navigate(`/profile/${userId}`);
        }, 1500);

    } catch (error) {
        console.error('Error submitting review:', error);
        setSnackbar({
            open: true,
            message: error.message || 'Failed to submit review. Please try again.',
            severity: 'error'
        });
    } finally {
        setIsSubmitting(false);
    }
};

// Handle Snackbar close
const handleSnackbarClose = () => {
    setSnackbar(prev => ({
        ...prev,
        open: false
    }));
};

// Cancel and go back
const handleCancel = () => {
    navigate(-1)
};

return (
    <Container maxWidth = "md">
        <Box sx = {{ my: 4}}>
            <Paper
                elevation = {3}
                sx = {{
                    p: 4,
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9'
                }}
            > 
                <Typography
                    variant = "h4"
                    component = "h1"
                    gutterBottom
                    sx = {{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        mb: 3
                    }}
                >
                    Write a Review
                </Typography>

                {recipient.username ? (
                    <Typography
                        variant = "h6"
                        sx = {{ 
                            textAlign: 'center',
                            mb: 4,
                            color: 'text.secondary'
                        }}
                    >
                        Share your experience with {recipient.username}
                    </Typography>
                ) : (
                    <Box sx = {{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}

                <Card sx = {{ mb: 4, backgroundColor: 'white'}}>
                    <CardContent>
                        <form onSubmit = {handleSubmit}>
                            <Box sx = {{ mb: 3 }}>
                                <Typography variant = "subtitle1" sx = {{ mb: 1, fontWeight: 'medium' }}>
                                    Review Title
                                </Typography>
                                <TextField
                                    name = "title"
                                    placeholder = "Summarize your experience"
                                    fullWidth
                                    value = {formData.title}
                                    onChange = {handleChange}
                                    error = {!!errors.title}
                                    helperText = {errors.title}
                                    disabled = {isSubmitting}
                                />
                            </Box>

                            <Box sx = {{ mb: 3 }}>
                                <Typography variant = "subtitle1" sx = {{ mb: 1, fontWeight: 'medium' }}>
                                    Your Experience
                                </Typography>
                                <TextField 
                                    name = "content"
                                    placeholder = "Describe your skill swap experience in detail..."
                                    multiline
                                    rows = {6}
                                    fullWidth
                                    value = {formData.content}
                                    onChagne = {handleChange}
                                    error = {!!errors.content}
                                    helperText = {errors.content}
                                    disabled = {isSubmitting}
                                />
                            </Box>

                            <Box sx = {{ mb: 4 }}>
                                <Typography variant = "subtitle1" sx = {{ mb: 1, fontWeight: 'medium' }}>
                                    Rating
                                </Typography>
                                <Box sx = {{ display: 'flex', alignItems: 'center' }}>
                                    <Rating 
                                        name = "rating"
                                        value = {formData.rating}
                                        precision = {0.5}
                                        onChange = {(event, newValue) => {
                                            handleRatingChange(newValue);
                                        }}
                                        disabled = {isSubmitting}
                                        icon = {<StarIcon fontSize = "inherit" />}
                                        emptyIcon = {<StarIcon fontSize = "inherit" />}
                                        sx = {{
                                            fontSize: '2rem',
                                            '& .MuiRating-iconEmpty': {
                                                opacity: 0.5
                                            }
                                        }}
                                    />
                                    {formData.rating !== null && (
                                        <Typography variant = "body2" sx = {{ ml: 2 }}>
                                            {formData.rating} out of 5 stars
                                        </Typography>
                                    )}
                                </Box>
                                {errors.rating && (
                                    <Typography color = "error" variant = "caption" sx = {{ display: 'block', mt: 1 }}>
                                        {errors.rating}
                                    </Typography>
                                )}  
                            </Box>

                            <Box sx = {{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mt: 4
                            }}>
                                <Button
                                    variant = "outlined"
                                    onClick = {handleCancel}
                                    disabled = {isSubmitting}
                                    sx = {{ width: '120px' }}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type = "submit"
                                    variant = "contained"
                                    color = "primary"
                                    disabled = {isSubmitting}
                                    sx = {{
                                        width: '200px',
                                        position: 'relative'
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <CircularProgress 
                                                size = {24}
                                                sx = {{
                                                    color: 'white',
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    marginTop: '-12px',
                                                    marginLeft: '-12px'
                                                }}
                                            />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Review'
                                    )}
                                </Button>
                            </Box>
                        </form>
                    </CardContent>
                </Card>

                <Typography variant = "body2" color = "text.secondary" sx = {{ textAlign: 'center' }}>
                    Your honest feedback helps improve our community's skill swapping experience.
                </Typography>
            </Paper>
        </Box>

        <Snackbar
            open = {snackbar.open}
            autoHideDuration = {6000}
            onClose = {handleSnackbarClose}
            anchorOrigin = {{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert 
                onClose = {handleSnackbarClose}
                severity = {snackbar.severity}
                sx = {{ width: '100%' }}
            >
                {snackbar.message}
            </Alert>
        </Snackbar>
    </Container>
)

export default WriteReview;