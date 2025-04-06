import React, { useState, useEffect, useContext } from "react";  
import {
  Grid, Typography, TextField, Button, Select, MenuItem, InputLabel,
  FormControl, Box, Card, CardContent, CardActionArea
} from "@mui/material";
import { useNavigate } from "react-router-dom";




const PostCreation = () => {
  const navigate = useNavigate();


  const [user, setUser] = React.useState(null);
  const [username, setUsername] = React.useState("");
 
  useEffect(() => {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) setUser(JSON.parse(storedUser));
    }, []);
 
  useEffect(() => {
    if (!user) return;
 
    fetch("/api/loadUserSettings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userID: user.userId }) // assuming user_id is the correct key
    })
      .then(res => res.json())
      .then(data => {
        const parsed = JSON.parse(data.express);
        setUsername(parsed[0].name);
      })
      .catch(console.error);
  }, [user]);


  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [submittedPosts, setSubmittedPosts] = useState([]);
  const [filterTag, setFilterTag] = useState(""); // State for tag filtering


  const tags = ["Music", "Science", "Fitness", "Art", "Technology", "General"];


  // Fetch posts from the database, filtering by logged-in user's id if available.
  const fetchPosts = () => {
    const url =
      user && user.user_id ? `/api/posts?user_id=${user.user_id}` : "/api/posts";
    console.log("Fetching posts for user_id:", user && user.user_id);
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetched posts:", data);
        setSubmittedPosts(data);
      })
      .catch((err) => console.error("Error fetching posts:", err));
  };




  useEffect(() => {
    fetchPosts();
  }, [user]);


  const handleSubmit = async () => {
    // Validate form fields
    const newErrors = {};
    let hasError = false;


    if (!postTitle) {
      newErrors.postTitle = "Title is required";
      hasError = true;
    }
    if (!postContent) {
      newErrors.postContent = "Content is required";
      hasError = true;
    }
    if (!selectedTag) {
      newErrors.selectedTag = "Please select a tag";
      hasError = true;
    }


    // const user = auth.currentUser;
    // if (!user) {
    //   console.error("User not signed in");
    //   return;
    // }


    // const authorName = user.displayName || "Anonymous";


    setErrors(newErrors);
    if (hasError) return;


    if (!user || !user.userId) {
      console.error("User not logged in");
      return;
    }


    const newPost = {
      title: postTitle,
      content: postContent,
      tag: selectedTag,
      user: user.userId,
      username: username || "Anonymous"
    };


    try {
      console.log("Submitting new post:", newPost);
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": user.userId
        },
        body: JSON.stringify(newPost),
      });


      if (!response.ok) {
        throw new Error("Failed to create post.");
      }


      const data = await response.json();
      console.log("Post created with ID:", data.postId);


      // Reset form and refresh posts
      setShowConfirmation(true);
      setPostTitle("");
      setPostContent("");
      setSelectedTag("");
      setErrors({});
      fetchPosts();
      navigate("/blog");
    } catch (error) {
      console.error("Error submitting post:", error);
    }
  };


  // Filter posts by the selected tag
  const filteredPosts = filterTag
    ? submittedPosts.filter(post => post.tag === filterTag)
    : submittedPosts;


  return (
    <Box sx={{ flexGrow: 1, p: 5 }}>
      <Typography variant="h3" sx={{ fontFamily: "Courier New", textAlign: "center", mb: 3 }}>
        Welcome to SkillSwap Discussions
      </Typography>


      <Grid container spacing={2} justifyContent="center" sx={{ mb: 2 }}>
        <Grid item>
          <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
            Create a Post
          </Button>
        </Grid>
        <Grid item>
          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel id="filter-tag-label">Filter by Tag</InputLabel>
            <Select
              labelId="filter-tag-label"
              value={filterTag}
              label="Filter by Tag"
              onChange={(e) => setFilterTag(e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {tags.map((tag, index) => (
                <MenuItem key={index} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>


      {showForm && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h3" sx={{ fontFamily: "Courier New", textAlign: "center" }}>
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
              helperText={errors.postTitle}
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
                  <MenuItem key={index} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </Select>
              {errors.selectedTag && <Typography color="error">{errors.selectedTag}</Typography>}
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
              helperText={errors.postContent}
            />
          </Grid>
          <Grid item xs={12} display="flex" justifyContent="center">
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Submit Post
            </Button>
          </Grid>
          {showConfirmation && (
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontFamily: "Courier New", textAlign: "center" }}>
                Post Submitted Successfully!
              </Typography>
            </Grid>
          )}
        </Grid>
      )}


      {/* Display Filtered Posts */}
      {filteredPosts.length > 0 && (
        <Box sx={{ mt: 4 }}>
          {filteredPosts.map((post) => (
            <Card key={post.id} sx={{ mb: 2, p: 2 }}>
              <CardActionArea onClick={() => navigate(`/post/${post.id}`, {state: {username}})}>
                <CardContent>
                  <Typography variant="h5">{post.title}</Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    By: {post.author || "Unknown"} | {new Date(post.created_at).toLocaleString()}
                  </Typography>
                  <Typography variant="body1">{post.content}</Typography>
                  <Typography variant="body2" color="primary">
                    Tag: {post.tag}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};


export default PostCreation;
