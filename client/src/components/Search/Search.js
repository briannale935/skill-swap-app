import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Grid, Typography } from "@mui/material";
import { getAuth } from "firebase/auth";  
import { getApp } from "firebase/app";  

const Search = () => {
  const [skill, setSkill] = useState("");
  const [timeAvailability, setTimeAvailability] = useState("");
  const [results, setResults] = useState([]);
  const [sentInvites, setSentInvites] = useState({});
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null); 

  const handleSearch = async () => {
    if (!skill && !timeAvailability) {
      alert("Please enter a skill or availability.");
      return;
    }

    try {
      const response = await fetch("/api/users/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill, timeAvailability }),
      });

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error searching users:", error);
      setResults([]);
    }
  };


// aithys edits for send invite 
useEffect(() => {
  const fetchUserId = async () => {
    const auth = getAuth(getApp()); 
    const user = auth.currentUser;

    if (user) {
      console.log("Firebase User:", user);

      try {
        const response = await fetch(`/api/getUserId?firebase_uid=${user.uid}`);
        const data = await response.json();
        console.log("API Response for User ID:", data);

        if (data.user_id) {
          setLoggedInUserId(data.user_id);
          console.log("Logged-in user ID set:", data.user_id);
        } else {
          console.error("User ID not found in database.");
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    } else {
      console.log("No user is logged in.");
    }
  };

  fetchUserId();
}, []);

const sendInvite = async (receiverId) => {
  if (!loggedInUserId) {
    alert("You need to be logged in to send invites.");
    return;
  }

  if (sentInvites[receiverId]) {
    alert("Invite already sent.");
    return;
  }

  try {
    setSentInvites((prev) => ({
      ...prev,
      [receiverId]: "sending",
    }));

    const response = await fetch("/api/invites/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: loggedInUserId,
        receiver_id: receiverId,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setSentInvites((prev) => ({
        ...prev,
        [receiverId]: true,
      }));

      console.log("Invite sent successfully!");

      // Refresh pending invites immediately after sending
      fetchInvites();
    } else {
      alert("Failed to send invite: " + data.error);
      setSentInvites((prev) => ({
        ...prev,
        [receiverId]: false,
      }));
    }
  } catch (error) {
    console.error("Error sending invite:", error);
    setSentInvites((prev) => ({
      ...prev,
      [receiverId]: false,
    }));
  }
};

useEffect(() => {
  if (!loggedInUserId) return;

  const fetchInvites = async () => {
    try {
      const response = await fetch(`/api/invites/pending/${loggedInUserId}`);
      if (!response.ok) throw new Error("Failed to fetch invites");
      const data = await response.json();
      setPendingInvites(data);
    } catch (error) {
      console.error("Error fetching pending invites:", error);
    }
  };

  fetchInvites();
  const interval = setInterval(fetchInvites, 5000);
  return () => clearInterval(interval);
}, [loggedInUserId]);




// ---  
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Search Users by Skill and Availability
      </Typography>

      {pendingInvites.length > 0 && (
        <div style={{ background: "#ffeb3b", padding: "10px", marginBottom: "10px" }}>
          <Typography variant="h6"> New Invite Received!</Typography>
        </div>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField label="Skill" fullWidth value={skill} onChange={(e) => setSkill(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Time Availability"
            fullWidth
            value={timeAvailability}
            onChange={(e) => setTimeAvailability(e.target.value)}
          />
        </Grid>
      </Grid>
      <Button variant="contained" color="primary" onClick={handleSearch} sx={{ marginTop: 2 }}>
        Search
      </Button>

      <Grid container spacing={2} sx={{ marginTop: 3 }}>
        {results.length > 0 ? (
          results.map((user) => (
            <Grid item xs={12} md={4} key={user.id}>
              <div style={{ border: "1px solid #ccc", padding: 16 }}>
                <Typography variant="h6">{user.name}</Typography>
                <Typography>Skill: {user.skill}</Typography>
                <Typography>Availability: {user.time_availability}</Typography>

                {sentInvites[user.id] ? (
                  <Typography style={{ color: "green", fontWeight: "bold" }}>Invite Sent</Typography>
                ) : (
                  <Button onClick={() => sendInvite(user.id)}>Send Invite</Button>
                )}
              </div>
            </Grid>
          ))
        ) : (
          <Typography>No users found</Typography>
        )}
      </Grid>
    </Container>
  );
};

export default Search;
