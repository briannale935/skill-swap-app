import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function MovieSelection({ movies, selectedMovie, handleMovieChange }) {
  return (
    <FormControl fullWidth>
      <InputLabel id="movie-select-label">Select a movie of your choice!</InputLabel>
      <Select
        value={selectedMovie}
        onChange={handleMovieChange}
        labelId="movie-select-label"
        id="movie-select"
      >
        {movies.map((movie, index) => (
          <MenuItem key={index} value={movie}>
            {movie}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default MovieSelection;
