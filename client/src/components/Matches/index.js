import React, { useEffect, useState } from "react";
import { Container, Typography, Button, Card, CardContent, Grid, Snackbar, Alert } from "@mui/material";

const Matches = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedMatches, setAcceptedMatches] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetch("/api/matches?user_id=1") // Replace '1' with actual logged-in user ID
      .then((res) => res.json())
      .then((data) => {
        setPendingRequests(data.pending || []);
        setAcceptedMatches(data.accepted || []);
      })
      .catch((err) => console.error("Error fetching matches:", err));
  }, []);

  const handleAccept = async (id) => {
    try {
      const response = await fetch(`/api/matches/accept/${id}`, { method: "POST" });
      if (response.ok) {
        setPendingRequests((prev) => prev.filter((request) => request.id !== id));
        setAcceptedMatches((prev) => [...prev, pendingRequests.find((request) => request.id === id)]);
        setNotification({ message: "Skill swap accepted! Contact details shared.", severity: "success" });
      }
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(`/api/matches/reject/${id}`, { method: "POST" });
      if (response.ok) {
        setPendingRequests((prev) => prev.filter((request) => request.id !== id));
        setNotification({ message: "Skill swap request rejected.", severity: "info" });
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  const handleWithdraw = async (id) => {
    try {
      const response = await fetch(`/api/matches/withdraw/${id}`, { method: "POST" });
      if (response.ok) {
        setPendingRequests((prev) => prev.filter((request) => request.id !== id));
        setNotification({ message: "Skill swap request withdrawn.", severity: "warning" });
      }
    } catch (err) {
      console.error("Error withdrawing request:", err);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Pending Requests</Typography>
      <Grid container spacing={2}>
        {pendingRequests.length > 0 ? (
          pendingRequests.map((request) => (
            <Grid item xs={12} md={6} key={request.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{request.sender_name}</Typography>
                  <Typography>Skill Offered: {request.sender_skill}</Typography>
                  <Typography>Time Availability: {request.time_availability}</Typography>
                  <Button variant="contained" color="primary" onClick={() => handleAccept(request.id)}>
                    Accept
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => handleReject(request.id)} style={{ marginLeft: "10px" }}>
                    Reject
                  </Button>
                  <Button variant="outlined" color="warning" onClick={() => handleWithdraw(request.id)} style={{ marginLeft: "10px" }}>
                    Withdraw
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No pending requests</Typography>
        )}
      </Grid>

      <Typography variant="h4" gutterBottom style={{ marginTop: "30px" }}>Accepted Matches</Typography>
      <Grid container spacing={2}>
        {acceptedMatches.length > 0 ? (
          acceptedMatches.map((match) => (
            <Grid item xs={12} md={6} key={match.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{match.sender_name}</Typography>
                  <Typography>Skill: {match.sender_skill}</Typography>
                  <Typography>Email: {match.email}</Typography>
                  <Typography>Time Availability: {match.time_availability}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No accepted matches</Typography>
        )}
      </Grid>

      {notification && (
        <Snackbar open autoHideDuration={6000} onClose={() => setNotification(null)}>
          <Alert onClose={() => setNotification(null)} severity={notification.severity} sx={{ width: "100%" }}>
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
};

export default Matches;
