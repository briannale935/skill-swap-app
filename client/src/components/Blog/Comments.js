import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Divider } from '@mui/material';
import { getAuth } from "firebase/auth";




const Comments = ({ username, postId, comments: initialComments = [] }) => {


  const [comments, setComments] = useState(initialComments);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');




  useEffect(() => {
    const callApiGetComments = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/comments`); // Updated API endpoint


        if (!response.ok) {
          throw new Error(`error! status: ${response.status}`);
        }


        const body = await response.json();
        setComments(body);
        console.log("API Response:", body);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };


    callApiGetComments();
  }, [postId]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const addedComment = await callApiAddComment();
        console.log("callApiAddComment returned: ", addedComment)
        setComments([...comments, addedComment]);
        setContent('');
        setShowForm(false);
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
    console.log("Comment added");
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
