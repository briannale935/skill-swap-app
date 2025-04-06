import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';
import Comments from '../Blog/Comments';

const PostDetails = () => {
  const location = useLocation();
  const { username } = location.state || {};
  const { postId } = useParams();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  const fetchComments = useCallback(() => {
    fetch(`/api/getComments/${postId}`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error('Error fetching comments:', err));
  }, [postId]);

  useEffect(() => {
    fetch(`/api/getPost/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setPost(data);
          fetchComments(); // Initial comment fetch
        } else {
          console.error('No data found for this post.');
        }
      })
      .catch((err) => console.error('Error fetching post:', err));
  }, [postId, fetchComments]);

  if (!post) return <Typography>Loading post {postId}...</Typography>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Card sx={{ p: 3 }}>
        <CardContent>
          <Typography variant="h4">{post.title}</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            By: {post.name} | {new Date(post.created_at).toLocaleString()}
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>{post.content}</Typography>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4 }}>
        <Comments
          username={username}
          postId={postId}
          comments={comments}
          refreshComments={fetchComments} // Pass the refresh function
        />
      </Box>
    </Box>
  );
};

export default PostDetails;
