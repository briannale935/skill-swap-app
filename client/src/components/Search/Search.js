import React, { useState } from "react";
import { TextField, Button, Container, Grid, Typography } from "@mui/material";

const Search = () => {
  const [skill, setSkill] = useState("");
  const [timeAvailability, setTimeAvailability] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!skill && !timeAvailability) {
      alert("Please enter a skill or availability.");
      return;
    }

    try {
      const query = "/api/users/search";
      const response = await fetch(query, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skill,
          timeAvailability,
        }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error searching users:", error);
      setResults([]);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Search Users by Skill and Availability
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Skill"
            fullWidth
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          />
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
      <Button
        variant="contained"
        color="primary"
        onClick={handleSearch}
        sx={{ marginTop: 2 }}
      >
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
                <Button>Send Invite</Button>
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
