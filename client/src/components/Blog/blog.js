import React, { useState, useEffect } from 'react';
import { Grid, Typography, TextField, Button, Select, MenuItem, InputLabel, FormControl, Box, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PostCreation = () => {
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [name, setName] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [submittedPosts, setSubmittedPosts] = useState([]);
  const navigate = useNavigate();

  const tags = ['Music', 'Science', 'Fitness', 'Art', 'Technology', 'General'];

  const fetchPosts = () => {
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => setSubmittedPosts(data))
      .catch((err) => console.error('Error fetching posts:', err));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async () => {
    const newErrors = {};
    let hasError = false;
    if (!postTitle) { newErrors.postTitle = true; hasError = true; }
    if (!postContent) { newErrors.postContent = true; hasError = true; }
    if (!selectedTag) { newErrors.selectedTag = true; hasError = true; }
    if (!name) { newErrors.name = true; hasError = true; }
    setErrors(newErrors);
    if (hasError) return;

    const user_id = 1; // Placeholder for user ID
    const newPost = { user_id, title: postTitle, content: postContent, name, tag: selectedTag };

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post.');
      }

      const data = await response.json();
      console.log('Post created with ID:', data.postId);
      setShowConfirmation(true);
      setPostTitle('');
      setPostContent('');
      setSelectedTag('');
      setName('');
      setErrors({});
      fetchPosts();
      navigate("/");
      
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 5 }}>
      <Typography variant="h3" sx={{ fontFamily: 'Courier New', textAlign: 'center', mb: 3 }}>
        Welcome to SkillSwap Discussions
      </Typography>
      {!showForm ? (
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
              Create a Post
            </Button>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h3" sx={{ fontFamily: 'Courier New', textAlign: 'center' }}>
              Create a New Post
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField 
              label="Post Title" 
              variant="outlined" 
              fullWidth 
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              error={!!errors.postTitle}
              helperText={errors.postTitle ? "Title is required" : ""}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined" error={!!errors.selectedTag}>
              <InputLabel id="tag-label">Tag</InputLabel>
              <Select
                labelId="tag-label"
                value={selectedTag}
                label="Tag"
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                {tags.map((tag, index) => (
                  <MenuItem key={index} value={tag}>{tag}</MenuItem>
                ))}
              </Select>
              {errors.selectedTag && <Typography color="error">Please select a tag</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField 
              label="Post Content" 
              variant="outlined" 
              fullWidth 
              multiline 
              rows={4}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              error={!!errors.postContent}
              helperText={errors.postContent ? "Content is required" : ""}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField 
              label="Name" 
              variant="outlined" 
              fullWidth 
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name ? "Name is required" : ""}
            />
          </Grid>
          <Grid item xs={12} display="flex" justifyContent="center">
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Submit Post
            </Button>
          </Grid>
          {showConfirmation && (
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontFamily: 'Courier New', textAlign: 'center' }}>
                Post Submitted Successfully!
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
      {submittedPosts.length > 0 && (
        <Box sx={{ mt: 4 }}>
          {submittedPosts.map((post) => (
            <Card key={post.id} sx={{ mb: 2, p: 2 }}>
              <CardContent>
                <Typography variant="h5">{post.title}</Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  By: {post.name || 'Unknown'} | {new Date(post.created_at).toLocaleString()}
                </Typography>
                <Typography variant="body1">{post.content}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PostCreation;