import React, { useEffect, useState } from "react";
import { Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert } from "@mui/material";

const Matches = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedMatches, setAcceptedMatches] = useState([]);
  const [notification, setNotification] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const userId = currentUser?.userId || "1";
    
    fetch(`/api/matches?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setPendingRequests(data.pending || []);
        
        // Deduplicate accepted matches by name
        const uniqueMatches = [];
        const matchNames = new Set();
        
        (data.accepted || []).forEach(match => {
          if (!matchNames.has(match.name)) {
            matchNames.add(match.name);
            uniqueMatches.push(match);
          }
        });
        
        setAcceptedMatches(uniqueMatches);
      })
      .catch((err) => console.error("Error fetching matches:", err));
  }, [currentUser]);

  const handleAccept = async (id) => {
    try {
      const response = await fetch(`/api/matches/accept/${id}`, { method: "POST" });
      const data = await response.json();
      
      if (response.ok) {
        // Find the request that was accepted
        const acceptedRequest = pendingRequests.find(request => request.id === id);
        
        // Remove from pending requests
        setPendingRequests(prev => prev.filter(request => request.id !== id));
        
        // Only add to accepted matches if it's not already there and not marked as already matched
        const isDuplicate = acceptedMatches.some(match => match.name === acceptedRequest.sender_name);
        
        if (!isDuplicate && !data.alreadyMatched) {
          // Create a new match object from the accepted request
          const newMatch = {
            id: acceptedRequest.id,
            name: acceptedRequest.sender_name,
            skill: acceptedRequest.sender_skill,
            location: "Online", // Default location
            time_availability: acceptedRequest.time_availability,
            email: data.email || "aithy@example.com" // Use the email from the response or a default
          };
          
          setAcceptedMatches(prev => [...prev, newMatch]);
        }
        
        setNotification({ message: "Skill swap accepted! Contact details shared.", severity: "success" });
      } else {
        console.error("Error accepting request:", data);
        setNotification({ message: "Failed to accept request: " + (data.message || "Unknown error"), severity: "error" });
      }
    } catch (err) {
      console.error("Error accepting request:", err);
      setNotification({ message: "Error accepting request: " + err.message, severity: "error" });
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

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Pending Requests</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Sender Name</b></TableCell>
              <TableCell><b>Sender Skill</b></TableCell>
              <TableCell><b>Requested Skill</b></TableCell>
              <TableCell><b>Time Availability</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.sender_name}</TableCell>
                  <TableCell>{request.sender_skill}</TableCell>
                  <TableCell>{request.requested_skill || "N/A"}</TableCell>
                  <TableCell>{request.time_availability}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => handleAccept(request.id)}>Accept</Button>
                    <Button variant="contained" color="secondary" onClick={() => handleReject(request.id)} style={{ marginLeft: "10px" }}>Reject</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} style={{ textAlign: "center" }}>No pending requests</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h4" gutterBottom style={{ marginTop: "30px" }}>Accepted Matches</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Skill</b></TableCell>
              <TableCell><b>Location</b></TableCell>
              <TableCell><b>Time Availability</b></TableCell>
              <TableCell><b>Email</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {acceptedMatches.length > 0 ? (
              acceptedMatches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell>{match.name}</TableCell>
                  <TableCell>{match.skill}</TableCell>
                  <TableCell>{match.location || "Online"}</TableCell>
                  <TableCell>{match.time_availability}</TableCell>
                  <TableCell>{match.email || "Email not available"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} style={{ textAlign: "center" }}>No accepted matches</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
