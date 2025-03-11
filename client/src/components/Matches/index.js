import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem
} from "@mui/material";
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useNavigate } from 'react-router-dom';

const Matches = () => {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedMatches, setAcceptedMatches] = useState([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "info" });
  const [matchesViewMode, setMatchesViewMode] = useState('card');
  const [pendingViewMode, setPendingViewMode] = useState('card');

  useEffect(() => {
    loadData();
    setupWebSocket();
  }, []);

  const loadData = async () => {
    try {
      const [matchesResponse, successfulMatchesResponse] = await Promise.all([
        fetch('/api/matches'),
        fetch('/api/matches/successful')
      ]);

      if (!matchesResponse.ok || !successfulMatchesResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const matchesData = await matchesResponse.json();
      const successfulMatchesData = await successfulMatchesResponse.json();

      setPendingRequests(matchesData.sent.filter(request => request.status === 'pending'));
      setAcceptedMatches(successfulMatchesData);
    } catch (err) {
      console.error("Error fetching data:", err);
      showNotification("Error fetching matches data", "error");
    }
  };

  const setupWebSocket = () => {
    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//localhost:3001/ws`;
      console.log('Attempting to connect to WebSocket at:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      let reconnectTimeout;
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
        
        ws.send(JSON.stringify({ 
          type: 'init', 
          message: 'Client connected',
          timestamp: new Date().toISOString()
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);
          
          switch (data.type) {
            case 'new_request':
              showNotification(`New skill swap request from ${data.senderName}!`, "info");
              loadData();
              break;
            case 'connection':
              console.log('Connection confirmed:', data.message);
              break;
            case 'acknowledgment':
              console.log('Server acknowledged:', data.message);
              break;
            default:
              console.log('Unhandled message type:', data.type);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.log('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed, attempting to reconnect in 5 seconds...');
        
        const pollInterval = setInterval(() => {
          loadData();
        }, 30000);
        
        reconnectTimeout = setTimeout(() => {
          console.log('Attempting to reconnect...');
          clearInterval(pollInterval);
          setupWebSocket();
        }, 5000);
      };

      return () => {
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      console.log('WebSocket setup failed:', error);
      const pollInterval = setInterval(() => {
        loadData();
      }, 30000);

      return () => clearInterval(pollInterval);
    }
  };

  const showNotification = (message, severity = "info") => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleAccept = async (inviteId) => {
    try {
      const response = await fetch(`/api/matches/accept/${inviteId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to accept request');
      }

      const data = await response.json();
      setAcceptedMatches((prev) => [...prev, data.match]);
      showNotification("Skill swap accepted! Your partner's contact details are now available.", "success");
    } catch (err) {
      console.error("Error accepting invite:", err);
      showNotification("Error accepting skill swap request", "error");
    }
  };

  const handleReject = async (inviteId) => {
    try {
      const response = await fetch(`/api/matches/reject/${inviteId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to reject request');
      }

      await response.json();
      showNotification("Skill swap request rejected", "info");
    } catch (err) {
      console.error("Error rejecting invite:", err);
      showNotification("Error rejecting skill swap request", "error");
    }
  };

  const handleWithdraw = async (requestId) => {
    try {
      const response = await fetch(`/api/matches/withdraw/${requestId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to withdraw request');
      }

      await response.json();
      setPendingRequests((prev) => prev.filter((request) => request.id !== requestId));
      showNotification("Skill swap request withdrawn", "info");
    } catch (err) {
      console.error("Error withdrawing request:", err);
      showNotification("Error withdrawing skill swap request", "error");
    }
  };

  const handlePreviewRequest = (request) => {
    setCurrentRequest(request);
    setPreviewDialogOpen(true);
  };

  const handleSendRequest = async () => {
    try {
      const response = await fetch('/api/matches/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentRequest)
      });

      if (!response.ok) {
        throw new Error('Failed to send request');
      }

      const data = await response.json();
      setPendingRequests((prev) => [...prev, data]);
      showNotification("Skill swap request sent successfully", "success");
    } catch (err) {
      console.error("Error sending request:", err);
      showNotification("Error sending skill swap request", "error");
    }
    setPreviewDialogOpen(false);
  };

  const handleUpdateProgress = async (swapId, progressData) => {
    try {
      const response = await fetch(`/api/matches/progress/${swapId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData)
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      const updatedMatch = await response.json();
      setAcceptedMatches((prev) =>
        prev.map((match) =>
          match.id === swapId ? { ...match, ...updatedMatch } : match
        )
      );
      showNotification("Progress updated successfully", "success");
    } catch (err) {
      console.error("Error updating progress:", err);
      showNotification("Error updating progress", "error");
    }
  };

  const handleMatchesViewChange = (event, newView) => {
    if (newView !== null) {
      setMatchesViewMode(newView);
    }
  };

  const handlePendingViewChange = (event, newView) => {
    if (newView !== null) {
      setPendingViewMode(newView);
    }
  };

  return (
    <Container>
      {/* Pending Requests Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 4 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Pending Requests
        </Typography>
        <ToggleButtonGroup
          value={pendingViewMode}
          exclusive
          onChange={handlePendingViewChange}
          aria-label="pending view mode"
        >
          <ToggleButton value="card" aria-label="card view">
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="table" aria-label="table view">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {pendingViewMode === 'card' ? (
        <Grid container spacing={2} sx={{ mb: 6 }}>
          {pendingRequests.map((request) => (
            <Grid item xs={12} md={4} key={request.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom><strong>To:</strong> {request.recipient_name}</Typography>
                    <Typography gutterBottom><strong>Your Skill:</strong> {request.sender_skill}</Typography>
                    <Typography gutterBottom><strong>Requested Skill:</strong> {request.requested_skill}</Typography>
                    <Typography gutterBottom><strong>Time Availability:</strong> {request.time_availability}</Typography>
                  </Box>
                  <Box sx={{ mt: 'auto' }}>
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      fullWidth
                      onClick={() => handleWithdraw(request.id)}
                    >
                      Withdraw Request
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {pendingRequests.length === 0 && (
            <Grid item xs={12}>
              <Typography>No pending requests</Typography>
            </Grid>
          )}
        </Grid>
      ) : (
        <Box sx={{ mb: 6 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>To</strong></TableCell>
                  <TableCell><strong>Your Skill</strong></TableCell>
                  <TableCell><strong>Requested Skill</strong></TableCell>
                  <TableCell><strong>Time Availability</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.recipient_name}</TableCell>
                    <TableCell>{request.sender_skill}</TableCell>
                    <TableCell>{request.requested_skill}</TableCell>
                    <TableCell>{request.time_availability}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => handleWithdraw(request.id)}
                      >
                        Withdraw Request
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pendingRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No pending requests</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Accepted Matches Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Accepted Matches
        </Typography>
        <ToggleButtonGroup
          value={matchesViewMode}
          exclusive
          onChange={handleMatchesViewChange}
          aria-label="matches view mode"
        >
          <ToggleButton value="card" aria-label="card view">
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="table" aria-label="table view">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {matchesViewMode === 'card' ? (
        <Grid container spacing={2} sx={{ mb: 6 }}>
          {acceptedMatches.map((match) => (
            <Grid item xs={12} md={4} key={match.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>{match.name}</Typography>
                    <Typography gutterBottom><strong>Skill:</strong> {match.skill}</Typography>
                    <Typography gutterBottom><strong>Location:</strong> {match.location}</Typography>
                    <Typography gutterBottom><strong>Time Availability:</strong> {match.time_availability}</Typography>
                    <Typography gutterBottom><strong>Years of Experience:</strong> {match.years_of_experience}</Typography>
                    <Typography gutterBottom><strong>Email:</strong> {match.email}</Typography>
                    <Typography gutterBottom><strong>Sessions Completed:</strong> {match.sessions_completed}</Typography>
                  </Box>
                  <Box sx={{ mt: 'auto' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => handleUpdateProgress(match.id, { sessions_completed: match.sessions_completed + 1 })}
                    >
                      Complete Session
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {acceptedMatches.length === 0 && (
            <Grid item xs={12}>
              <Typography>No accepted matches</Typography>
            </Grid>
          )}
        </Grid>
      ) : (
        <Box sx={{ mb: 6 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Skill</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell><strong>Time Availability</strong></TableCell>
                  <TableCell><strong>Years of Experience</strong></TableCell>
                  <TableCell><strong>Email Address</strong></TableCell>
                  <TableCell><strong>Sessions Completed</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {acceptedMatches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>{match.name}</TableCell>
                    <TableCell>{match.skill}</TableCell>
                    <TableCell>{match.location}</TableCell>
                    <TableCell>{match.time_availability}</TableCell>
                    <TableCell>{match.years_of_experience}</TableCell>
                    <TableCell>{match.email}</TableCell>
                    <TableCell>{match.sessions_completed}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleUpdateProgress(match.id, { sessions_completed: match.sessions_completed + 1 })}
                      >
                        Complete Session
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {acceptedMatches.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">No accepted matches</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)}>
        <DialogTitle>Preview Skill Swap Request</DialogTitle>
        <DialogContent>
          {currentRequest && (
            <Box sx={{ pt: 2 }}>
              <Typography gutterBottom><strong>To:</strong> {currentRequest.recipient_name}</Typography>
              <Typography gutterBottom><strong>Your Skill:</strong> {currentRequest.sender_skill}</Typography>
              <Typography gutterBottom><strong>Requested Skill:</strong> {currentRequest.requested_skill}</Typography>
              <Typography gutterBottom><strong>Time Availability:</strong> {currentRequest.time_availability}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSendRequest} variant="contained" color="primary">
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Matches;
