import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Divider } from '@mui/material';

const Comments = ({ username, postId, comments, refreshComments }) => {
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await callApiAddComment();
      setContent('');
      setShowForm(false);
      refreshComments(); // Refresh comments after submission
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const callApiAddComment = async () => {
    const url = '/api/addComment';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: username,
        post_id: postId,
        content
      }),
    });

    if (!response.ok) {
      throw new Error(`error! status: ${response.status}`);
    }

    const body = await response.json();
    return body;
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowForm(!showForm)}
        sx={{ mb: 2 }}
      >
        {showForm ? 'Cancel' : 'Comment'}
      </Button>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <TextField
            label="Write your comment..."
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="primary" type="submit">
            Submit
          </Button>
        </form>
      )}

      <Divider sx={{ mt: 2, mb: 2 }} />
      <Typography variant="h6">Comments:</Typography>
      <Box>
        {comments.map((comment, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <strong>{comment.name || "Unknown"}:</strong> {comment.content}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Comments;
