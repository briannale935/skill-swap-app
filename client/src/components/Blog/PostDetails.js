import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';
import Comments from '../Blog/Comments';
import {useLocation} from "react-router-dom";




const PostDetails = () => {
  const location = useLocation();
  const {username} = location.state || {};


  const { postId } = useParams(); // Get postId from URL parameters
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]); // Manage comments here


  useEffect(() => {
    // Fetch the post details
    fetch(`/api/getPost/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setPost(data);
          // Fetch comments for the post
          fetch(`/api/getComments/${postId}`) // Fetch comments associated with the post
            .then(res => res.json())
            .then(commentsData => setComments(commentsData))
            .catch(err => console.error('Error fetching comments:', err));
        } else {
          console.error('No data found for this post.');
        }
      })
      .catch((err) => console.error('Error fetching post:', err));
  }, [postId]);


  // Show loading text while post is being fetched
  if (!post) return <Typography>Loading post {postId}...</Typography>


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
        <Comments username={username} postId={postId} comments={comments} /> {/* Pass postId and comments */}
      </Box>
    </Box>
  );
};


export default PostDetails;
