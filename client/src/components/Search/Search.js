import React, { useState, useEffect } from "react";
import { Container, TextField, Button, CircularProgress, Typography, Chip, 
  Card, CardContent, CardMedia, Grid, Box,
  Dialog, DialogTitle, DialogContent, IconButton
 } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ProfileReviews from "../Reviews/ProfileReviews";
import WriteReviews from "../Reviews/WriteReviews";

import CloseIcon from '@mui/icons-material/Close';



function Search() {
  const [skill, setSkill] = useState("");
  const [timeAvailability, setTimeAvailability] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [inviteSending, setInviteSending] = useState({});
  const [inviteStatus, setInviteStatus] = useState({});

  // Controls Write Review dialog
  const [openWriteReviewDialog, setOpenWriteReviewDialog] = useState(false);
  const [selectedUserForReview, setSelectedUserForReview] = useState(null);

  const [openReviewsDialog, setOpenReviewsDialog] = useState(false);
  const [selectedUserForReviews, setSelectedUserForReviews] = useState(null);

  const navigate = useNavigate();

  // Get the current user from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (skill === "" && timeAvailability === "") {
      setSearchResults([]);
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/users/search?skill=${skill}&timeAvailability=${timeAvailability}`);
        const data = await response.json();
        if (response.ok) {
          setSearchResults(data);
        } else {
          console.error(data.error);
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [skill, timeAvailability]);

  const handleSelectUser = (userId) => {
    navigate(`/profile/${userId}`); // Redirect to the selected user's profile
  };

  const handleSendInvite = async (userId) => {
    if (!currentUser) {
      alert("You must be logged in to send invites");
      return;
    }

    setInviteSending(prev => ({ ...prev, [userId]: true }));
    
    try {
      // Make sure we have the current user's ID
      if (!currentUser.userId) {
        console.error("Current user ID is missing:", currentUser);
        throw new Error("User ID not available");
      }
      
      console.log("Sending invite from", currentUser.userId, "to", userId);
      
      // Send the invite with the correct IDs
      const response = await fetch('/api/invites/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: currentUser.userId,
          receiver_id: userId
        }),
      });

      const data = await response.json();
      console.log("Invite response:", data);
      
      if (response.ok) {
        setInviteStatus(prev => ({ 
          ...prev, 
          [userId]: { success: true, message: 'Invite sent successfully!' } 
        }));
      } else {
        console.error("Failed to send invite:", data.error);
        setInviteStatus(prev => ({ 
          ...prev, 
          [userId]: { success: false, message: data.error || 'Failed to send invite' } 
        }));
      }
    } catch (error) {
      console.error("Error sending invite:", error);
      setInviteStatus(prev => ({ 
        ...prev, 
        [userId]: { success: false, message: 'Error sending invite: ' + error.message } 
      }));
    } finally {
      setInviteSending(prev => ({ ...prev, [userId]: false }));
      
      // Clear status message after 5 seconds
      setTimeout(() => {
        setInviteStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[userId];
          return newStatus;
        });
      }, 5000);
    }
  };

  // Open the Write review dialog for a specific user.
  const handleOpenWriteReview = (user) => {
    setSelectedUserForReview(user);
    setOpenWriteReviewDialog(true);
  };

  // NEW: Function to handle successful review submission.
  const handleReviewSubmitSuccess = () => {
    setOpenWriteReviewDialog(false);
  };

  // Open the reviews dialog for a specific user
  const handleOpenReviews = (user) => {
    setSelectedUserForReviews(user);
    setOpenReviewsDialog(true);
  };

  // Function to fetch profile reviews for the selected user
  const fetchProfileReviews = async() => {
    if (!selectedUserForReviews) {
      throw new Error("No user selected for reviews");
    }
    const response = await fetch(`/api/reviews?recipient_id=${selectedUserForReviews.id}`);
    if (!response.ok) {
      throw new Error("Error fetching reviews");
    }
    return response.json();
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: "50px", textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Search for Users
      </Typography>

      <TextField
        label="Search by Skill"
        variant="outlined"
        fullWidth
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
        style={{ marginBottom: "20px" }}
      />
      <TextField
        label="Search by Time Availability"
        variant="outlined"
        fullWidth
        value={timeAvailability}
        onChange={(e) => setTimeAvailability(e.target.value)}
        style={{ marginBottom: "20px" }}
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        style={{ marginTop: "20px" }}
        onClick={() => {
          setSkill("");
          setTimeAvailability("");
        }} // Clear search fields
      >
        Clear Search
      </Button>

      {loading && <CircularProgress color="inherit" />}
      {searchResults.length > 0 && (
        <Grid container spacing={3} style={{ marginTop: "20px" }}>
          {searchResults.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Card>
                <CardMedia
                  component="img"
                  alt={user.name}
                  height="200"
                  image={user.profile_picture || "https://via.placeholder.com/200"}
                  title={user.name}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSelectUser(user.id)}
                />
                <CardContent>
                  <Typography variant="h6">{user.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Skill:</strong> {user.skill}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Location:</strong> {user.location}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Time Availability:</strong> {user.time_availability}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Portfolio Link:</strong> <a href={user.portfolio_link} target="_blank" rel="noopener noreferrer">{user.portfolio_link}</a>
                  </Typography>
                  
                  <Box mt={2}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      fullWidth
                      disabled={inviteSending[user.id] || !currentUser}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendInvite(user.id);
                      }}
                    >
                      {inviteSending[user.id] ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Send Invite"
                      )}
                    </Button>

                    {/* Write a Review Button
                    <Button 
                      variant="contained" 
                      color="secondary"
                      fullWidth
                      style={{ marginTop: "10px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/WriteReviews', { state: {recipientId: user.id } });
                      }}
                    >
                      Write a Review
                    </Button> */}

                    {/* NEW: Write a Review Button that opens a popup dialog */}
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      style={{ marginTop: "10px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenWriteReview(user);
                      }}
                    >
                      Write a Review
                    </Button>

                    {/* New Button: Reviews for Profile */}
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      style={{ marginTop: "10px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenReviews(user);
                      }}
                    >
                      Reviews for Profile
                    </Button>
                    
                    {inviteStatus[user.id] && (
                      <Typography 
                        variant="body2" 
                        color={inviteStatus[user.id].success ? "success.main" : "error.main"}
                        style={{ marginTop: "8px" }}
                      >
                        {inviteStatus[user.id].message}
                      </Typography>
                    )}
                    
                    {!currentUser && (
                      <Typography variant="caption" color="error.main" style={{ marginTop: "4px" }}>
                        Login to send invites
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Write Review Dialog: Opens when "Write a Review" is clicked */}
      <Dialog
        open={openWriteReviewDialog}
        onClose={() => setOpenWriteReviewDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ m: 0, p: 2, position: "relative" }}>
          Write a Review for {selectedUserForReview ? selectedUserForReview.name : ""}
          <IconButton
            aria-label="close"
            onClick={() => setOpenWriteReviewDialog(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              padding: 0,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                cursor: "pointer",
                color: "#f44336",
                backgroundColor: "#fff",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";
              }}
            >
              X
            </span>
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {/* WriteReviews receives an onSuccess callback that will close the dialog when submission succeeds */}
          <WriteReviews  
            recipientId={selectedUserForReview ? selectedUserForReview.id : 1} 
            onSuccess={handleReviewSubmitSuccess}
            onClose={() => setOpenWriteReviewDialog(false)}
            />
        </DialogContent>
      </Dialog>

      {/* Reviews Dialog using Material-UI's Dialog with Close Button */}
      <Dialog
        open={openReviewsDialog}
        onClose={() => setOpenReviewsDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ m: 0, p: 2, position: "relative" }}>
          Profile Reviews for {selectedUserForReviews ? selectedUserForReviews.name : ""}
          <IconButton
            aria-label="close"
            onClick={() => setOpenReviewsDialog(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              padding: 0,
            }}
          >
            <span
    style={{
      fontSize: "1.5rem",
      fontWeight: "bold",
      cursor: "pointer",
      color: "#f44336", // red text
      backgroundColor: "#fff", // white background
      borderRadius: "50%",
      width: "32px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = "scale(1.1)";
      e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";
    }}
  >
    X
  </span>
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <ProfileReviews fetchProfileReviews={fetchProfileReviews} />
        </DialogContent>
      </Dialog>

    </Container>
  );
}

export default Search;