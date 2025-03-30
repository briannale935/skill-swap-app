
import React, { useEffect, useState } from 'react';
import { Grid, Typography, Button, TextField, Box, Card, CardContent, Paper, Snackbar, Alert } from '@mui/material';
import StarRating from './StarRating';
import AverageRatingMeter from './AverageRatingMeter';
import ReviewConfirmationDialog from './ReviewConfirmationDialog';
import ReviewActions from './ReviewActions';
import EditReviewDialog from './EditReviewDialog'
import SnackbarNotification from "./SnackbarNotification";
import AllReviews from "./AllReviews";
import { useLocation } from "react-router-dom";
import DeleteConfirmation from "./DeleteConfirmationDialog";

const [reviews, setReviews] = useState([]);
const [formData, setFormData] = useState({ title: "", text: "", rating: null });
const [message, setMessage] = useState("");
const [ratingError, setRatingError] = useState(false);
const [confirmationOpen, setConfirmationOpen] = useState(false);
const [editOpen, setEditOpen] = useState(false);
const [selectedReview, setSelectedReview] = useState(null);
// const [currentPage, setCurrentPage] = useState("Share Your Skillswap Experience");
const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");
const [snackbarSeverity, setSnackbarSeverity] = useState("success");
const [allReviews, setAllReviews] = useState([]);
const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
const [reviewToDelete, setReviewToDelete] = useState(null);

const showSnackbar = (message, severity = "success") => {
  setSnackbarMessage(message);
  setSnackbarSeverity(severity);
  setSnackbarOpen(true);
};

const location = useLocation();
const isAddReviewPage = location.state?.fromSearchPage || false;

// Fetch user's reviews
const fetchReviews = async () => { /* ... */ };

// Fetch all reviews
const fetchAllReviews = async () => { /* ... */ };

// Submit a new review
const handleSubmit = async () => { /* ... */ };

// Update an existing review
const handleUpdateReview = async (id, updatedReview) => { /* ... */ };

// Delete a review
const handleDeleteReview = async (id) => { /* ... */ };

// Input change handler
const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

// Confirmation dialog handlers
const handleShowConfirmation = (e) => { /* ... */ };

// Edit dialog handlers
const handleEditClick = (review) => { /* ... */ };
const handleEditClose = () => { /* ... */ };

const [form, setForm] = useState({ 
  data: { title: "", text: "", rating: null },
  error: { rating: false },
  message: ""
});

// In a separate file: useReviews.js
function useReviews() {
  const [reviews, setReviews] = useState([]);
  
  const fetchReviews = async () => { /* ... */ };
  const submitReview = async (reviewData) => { /* ... */ };
  // etc.
  
  return { reviews, fetchReviews, submitReview /* etc. */ };
}

function ReviewForm({ onSubmit, /* ... */ }) { /* ... */ }
function UserReviews({ reviews, onEdit, onDelete }) { /* ... */ }

function Review() {
  // Core state and logic
  return (
    <Box>
      {isAddReviewPage ? <ReviewForm /* ... */ /> : (
        <>
          <UserReviews /* ... */ />
          <AllReviews /* ... */ />
        </>
      )}
    </Box>
  );
}


import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Avatar,
  Divider, Rating, Chip, CircularProgress,
  Button, IconButton, Grid, Paper 
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate, Link } from 'react-router-dom';

// This component displays all reviews for a specific user
const UserReviews = ({ userId, currentUserId, allowWriteReview = true }) => {
  const navigate = useNavigate();
  
  // State management
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  
  // Sorting and filtering
  const [sortOption, setSortOption] = useState('newest');
  const [filterValue, setFilterValue] = useState(null);
  
  // Check if the current user has already reviewed this user
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState(null);

  // Fetch user reviews
  useEffect(() => {
    if (userId) {
      fetchUserReviews();
      fetchUserInfo();
      
      // Check if current user has already reviewed this user
      if (currentUserId) {
        checkExistingReview();
      }
    }
  }, [userId, currentUserId]);

  const fetchUserReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      
      const data = await response.json();
      
      // Apply initial sorting (newest first)
      const sortedData = sortReviews(data, 'newest');
      setReviews(sortedData);
      
      // Calculate stats
      calculateStats(data);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      setError('Unable to load reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user information');
      
      const userData = await response.json();
      setUserInfo(userData);
    } catch (err) {
      console.error('Error fetching user info:', err);
      // We don't set the main error state here to still allow reviews to display
    }
  };

  const checkExistingReview = async () => {
    try {
      const response = await fetch(`/api/reviews/check?reviewer_id=${currentUserId}&recipient_id=${userId}`);
      if (!response.ok) throw new Error('Failed to check review status');
      
      const data = await response.json();
      setHasReviewed(data.exists);
      if (data.exists && data.review) {
        setUserReview(data.review);
      }
    } catch (err) {
      console.error('Error checking existing review:', err);
    }
  };

  // Calculate review statistics
  const calculateStats = (reviewsData) => {
    if (!reviewsData.length) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
      return;
    }
    
    const total = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    const average = total / reviewsData.length;
    
    // Calculate rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach(review => {
      const roundedRating = Math.round(review.rating);
      if (distribution[roundedRating] !== undefined) {
        distribution[roundedRating]++;
      }
    });
    
    setStats({
      averageRating: parseFloat(average.toFixed(1)),
      totalReviews: reviewsData.length,
      ratingDistribution: distribution
    });
  };

  // Sort reviews
  const sortReviews = (reviewsToSort, option) => {
    const sortedReviews = [...reviewsToSort];
    
    switch (option) {
      case 'newest':
        return sortedReviews.sort((a, b) => new Date(b.date_posted) - new Date(a.date_posted));
      case 'oldest':
        return sortedReviews.sort((a, b) => new Date(a.date_posted) - new Date(b.date_posted));
      case 'highest':
        return sortedReviews.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sortedReviews.sort((a, b) => a.rating - b.rating);
      default:
        return sortedReviews;
    }
  };

  // Handle sort change
  const handleSortChange = (option) => {
    setSortOption(option);
    setReviews(sortReviews([...reviews], option));
  };

  // Handle filter change
  const handleFilterChange = (stars) => {
    if (filterValue === stars) {
      // If clicking the same filter, clear it
      setFilterValue(null);
    } else {
      setFilterValue(stars);
    }
  };

  // Navigate to write review page
  const handleWriteReview = () => {
    navigate(`/write-review/${userId}`, { 
      state: { recipientInfo: userInfo } 
    });
  };

  // Navigate to edit review page
  const handleEditReview = () => {
    navigate(`/edit-review/${userReview.review_id}`, {
      state: { review: userReview, recipientInfo: userInfo }
    });
  };

  // Get filtered reviews based on current filter
  const getFilteredReviews = () => {
    if (filterValue === null) return reviews;
    
    return reviews.filter(review => {
      const roundedRating = Math.round(review.rating);
      return roundedRating === filterValue;
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredReviews = getFilteredReviews();

  return (
    <Box sx={{ mt: 4, mb: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, md: 4 }, 
          borderRadius: 2,
          backgroundColor: '#f9f9f9'
        }}
      >
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom 
          sx={{ 
            mb: 3, 
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#333' 
          }}
        >
          {userInfo ? `Reviews for ${userInfo.username}` : 'User Reviews'}
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
            <Typography>{error}</Typography>
          </Box>
        ) : (
          <>
            {/* Reviews Summary Section */}
            <Card sx={{ mb: 4, backgroundColor: 'white' }}>
              <CardContent>
                <Grid container spacing={3}>
                  {/* Average Rating Card */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      p: 2
                    }}>
                      <Typography variant="h2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                        {stats.averageRating}
                      </Typography>
                      <Rating 
                        value={stats.averageRating} 
                        precision={0.1} 
                        readOnly 
                        sx={{ fontSize: '1.5rem', my: 1 }}
                      />
                      <Typography variant="subtitle1">
                        {stats.totalReviews} {stats.totalReviews === 1 ? 'Review' : 'Reviews'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {/* Rating Distribution */}
                  <Grid item xs={12} md={8}>
                    <Box sx={{ pl: { md: 2 } }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                        Rating Distribution
                      </Typography>
                      
                      {Object.keys(stats.ratingDistribution)
                        .sort((a, b) => Number(b) - Number(a))
                        .map(rating => {
                          const count = stats.ratingDistribution[rating];
                          const percentage = stats.totalReviews
                            ? Math.round((count / stats.totalReviews) * 100)
                            : 0;
                            
                          return (
                            <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                width: '80px' 
                              }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                  {rating}
                                </Typography>
                                <StarIcon fontSize="small" />
                              </Box>
                              
                              <Box sx={{ 
                                flexGrow: 1, 
                                backgroundColor: '#f0f0f0', 
                                borderRadius: 1, 
                                height: 8,
                                mr: 2
                              }}>
                                <Box sx={{ 
                                  width: `${percentage}%`, 
                                  height: '100%', 
                                  backgroundColor: '#1976d2',
                                  borderRadius: 1
                                }} />
                              </Box>
                              
                              <Typography variant="body2" sx={{ width: '40px' }}>
                                {count}
                              </Typography>
                            </Box>
                          );
                        })}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {/* Write/Edit Review Button */}
            {allowWriteReview && (
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                {hasReviewed ? (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<EditIcon />}
                    onClick={handleEditReview}
                  >
                    Edit Your Review
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleWriteReview}
                  >
                    Write a Review
                  </Button>
                )}
              </Box>
            )}
            
            {/* Sort and Filter Section */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              mb: 3 
            }}>
              {/* Sorting Options */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mb: { xs: 2, sm: 0 } 
              }}>
                <SortIcon sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ mr: 2 }}>Sort by:</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['newest', 'oldest', 'highest', 'lowest'].map(option => (
                    <Chip
                      key={option}
                      label={option.charAt(0).toUpperCase() + option.slice(1)}
                      onClick={() => handleSortChange(option)}
                      color={sortOption === option ? 'primary' : 'default'}
                      variant={sortOption === option ? 'filled' : 'outlined'}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
              
              {/* Filter Options */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <FilterListIcon sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ mr: 2 }}>Filter:</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[5, 4, 3, 2, 1].map(stars => (
                    <Chip
                      key={stars}
                      label={`${stars} ★`}
                      onClick={() => handleFilterChange(stars)}
                      color={filterValue === stars ? 'primary' : 'default'}
                      variant={filterValue === stars ? 'filled' : 'outlined'}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </Box>
            
            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
              <Box sx={{ 
                p: 4, 
                textAlign: 'center', 
                backgroundColor: 'white',
                borderRadius: 2
              }}>
                <Typography variant="body1" color="text.secondary">
                  {filterValue 
                    ? `No ${filterValue}-star reviews found`
                    : `No reviews yet for ${userInfo?.username || 'this user'}`
                  }
                </Typography>
              </Box>
            ) : (
              <Box>
                {filteredReviews.map((review, index) => (
                  <Card key={review.review_id} sx={{ 
                    mb: 2,
                    backgroundColor: 'white'
                  }}>
                    <CardContent>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start',
                        justifyContent: 'space-between' 
                      }}>
                        {/* Reviewer Info */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={review.reviewer_avatar || ''} 
                            alt={review.reviewer_username}
                            sx={{ width: 50, height: 50, mr: 2 }}
                          />
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {review.reviewer_username}
                            </Typography>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              mt: 0.5 
                            }}>
                              <Rating 
                                value={review.rating} 
                                readOnly 
                                precision={0.5}
                                size="small"
                              />
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ ml: 1 }}
                              >
                                {review.rating} out of 5
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Review Date */}
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                        >
                          {formatDate(review.date_posted)}
                        </Typography>
                      </Box>
                      
                      {/* Review Title and Content */}
                      <Box sx={{ mt: 2 }}>
                        <Typography 
                          variant="h6" 
                          component="h3"
                          sx={{ fontWeight: 'medium' }}
                        >
                          {review.review_title}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            mt: 1, 
                            whiteSpace: 'pre-line' 
                          }}
                        >
                          {review.content}
                        </Typography>
                      </Box>
                      
                      {/* Show edited timestamp if relevant */}
                      {review.last_updated && new Date(review.last_updated).getTime() !== new Date(review.date_posted).getTime() && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            display: 'block', 
                            mt: 2,
                            fontStyle: 'italic' 
                          }}
                        >
                          Edited on {formatDate(review.last_updated)}
                        </Typography>
                      )}
                      
                      {/* If this is the current user's review, show edit button */}
                      {review.reviewer_id === currentUserId && (
                        <Box sx={{ 
                          display: 'flex',
                          justifyContent: 'flex-end',
                          mt: 2 
                        }}>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={handleEditReview}
                          >
                            Edit
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default UserReviews;