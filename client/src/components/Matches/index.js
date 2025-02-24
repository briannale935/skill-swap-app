import React, { useEffect, useState } from "react";
import { Container, Typography, Button, Card, CardContent, Grid } from "@mui/material";

const Matches = () => {
  const [pendingInvites, setPendingInvites] = useState([]);
  const [acceptedMatches, setAcceptedMatches] = useState([]);

  useEffect(() => {
    fetch("/api/matches")
      .then((res) => res.json())
      .then((data) => {
        setPendingInvites(data.pending || []);
        setAcceptedMatches(data.accepted || []);
      })
      .catch((err) => console.error("Error fetching matches:", err));
  }, []);

  const handleAccept = async (inviteId) => {
    try {
      await fetch("/api/matches/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      });

      setPendingInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
      setAcceptedMatches((prev) => [...prev, pendingInvites.find((invite) => invite.id === inviteId)]);
    } catch (err) {
      console.error("Error accepting invite:", err);
    }
  };

  const handleReject = async (inviteId) => {
    try {
      await fetch("/api/matches/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      });

      setPendingInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
    } catch (err) {
      console.error("Error rejecting invite:", err);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Pending Invites
      </Typography>
      <Grid container spacing={2}>
        {pendingInvites.length > 0 ? (
          pendingInvites.map((invite) => (
            <Grid item xs={12} md={4} key={invite.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{invite.sender_name}</Typography>
                  <Typography>Skill: {invite.skill}</Typography>
                  <Typography>Availability: {invite.time_availability}</Typography>
                  <Button variant="contained" color="primary" onClick={() => handleAccept(invite.id)}>
                    Accept
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => handleReject(invite.id)} style={{ marginLeft: "10px" }}>
                    Reject
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No pending invites</Typography>
        )}
      </Grid>

      <Typography variant="h4" gutterBottom style={{ marginTop: "30px" }}>
        Accepted Matches
      </Typography>
      <Grid container spacing={2}>
        {acceptedMatches.length > 0 ? (
          acceptedMatches.map((match) => (
            <Grid item xs={12} md={4} key={match.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{match.sender_name}</Typography>
                  <Typography>Skill: {match.skill}</Typography>
                  <Typography>Availability: {match.time_availability}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No accepted matches</Typography>
        )}
      </Grid>
    </Container>
  );
};

export default Matches;
