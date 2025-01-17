import React, { useState } from 'react';
import { Grid, Typography, Button } from '@mui/material';
import MovieSelection from './MovieSelection';
import ReviewTitle from './ReviewTitle';
import ReviewBody from './ReviewBody';
import ReviewRating from './ReviewRating';

function Review() {
  const [movies, setMovies] = useState([
    'Movie 1',
    'Movie 2',
    'Movie 3',
    'Movie 4',
    'Movie 5',
  ]);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [enteredTitle, setEnteredTitle] = useState('');
  const [enteredReview, setEnteredReview] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState({});

  const handleMovieChange = (event) => {
    setSelectedMovie(event.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, selectedMovie: false }));
    setShowConfirmation(false);
  };

  const handleTitleChange = (event) => {
    setEnteredTitle(event.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, enteredTitle: false }));
    setShowConfirmation(false);
  };

  const handleReviewChange = (event) => {
    setEnteredReview(event.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, enteredReview: false }));
    setShowConfirmation(false);
  };

  const handleRatingChange = (event) => {
    setSelectedRating(event.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, selectedRating: false }));
    setShowConfirmation(false);
  };

  const handleSubmit = () => {
    let hasErrors = false;
    const newErrors = {};

    if (!selectedMovie) {
      newErrors.selectedMovie = true;
      hasErrors = true;
    }
    if (!enteredTitle) {
      newErrors.enteredTitle = true;
      hasErrors = true;
    }
    if (!enteredReview) {
      newErrors.enteredReview = true;
      hasErrors = true;
    }
    if (!selectedRating) {
      newErrors.selectedRating = true;
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      setShowConfirmation(false);
    } else {
      setShowConfirmation(true);
      setErrors({});
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h3">Review a movie</Typography>
      </Grid>
      <Grid item xs={12}>
        <MovieSelection
          movies={movies}
          selectedMovie={selectedMovie}
          handleMovieChange={handleMovieChange}
        />
        {errors.selectedMovie && <Typography color="red">Select your movie!!</Typography>}
      </Grid>
      <Grid item xs={12}>
        <ReviewTitle enteredTitle={enteredTitle} handleTitleChange={handleTitleChange} />
        {errors.enteredTitle && <Typography color="red">Enter your review title!!</Typography>}
      </Grid>
      <Grid item xs={12}>
        <ReviewBody enteredReview={enteredReview} handleReviewChange={handleReviewChange} />
        {errors.enteredReview && <Typography color="red">Enter your review!!</Typography>}
      </Grid>
      <Grid item xs={12}>
        <ReviewRating selectedRating={selectedRating} handleRatingChange={handleRatingChange} />
        {errors.selectedRating && <Typography color="red">Select the rating!!</Typography>}
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={handleSubmit} id="submit-button">
          Submit
        </Button>
      </Grid>
      {showConfirmation && (
        <Grid item xs={12}>
          <Typography variant="h6" id="confirmation-message">Your review has been received</Typography>
          <Typography variant="subtitle1">Movie: {selectedMovie}</Typography>
          <Typography variant="subtitle1">Review Title: {enteredTitle}</Typography>
          <Typography variant="subtitle1">Review Body: {enteredReview}</Typography>
          <Typography variant="subtitle1">Rating: {selectedRating}</Typography>
        </Grid>
      )}
    </Grid>
  );
}

export default Review;
