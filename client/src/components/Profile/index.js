import React, { useState, useEffect } from "react";
import { Container, TextField, Button, Typography, Avatar, Select, MenuItem, InputLabel, FormControl, Chip } from "@mui/material";
import { auth } from "../../firebase"; // Firebase authentication import
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [name, setName] = useState("");
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [timeAvailability, setTimeAvailability] = useState([]); // Stores selected times as an array of numbers
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [email, setEmail] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const storage = getStorage();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email);

      const fetchProfile = async () => {
        try {
          const response = await fetch(`/api/users/profile?firebase_uid=${user.uid}`);
          if (response.ok) {
            const data = await response.json();
            setName(data.name || "");
            setSkill(data.skill || "");
            setLocation(data.location || "");
            setTimeAvailability(
              data.time_availability ? data.time_availability.split(",").map((t) => Number(t.trim())).filter((t) => !isNaN(t)) : []
            );
            setYearsOfExperience(data.years_of_experience || "");
            setPortfolioLink(data.portfolio_link || "");
            setProfilePicturePreview(data.profile_picture || "");
          } else {
            setMessage("Error fetching profile data.");
          }
        } catch (error) {
          setMessage("Error fetching profile data.");
        }
      };

      fetchProfile();
    }
  }, []);

  const handleProfileSubmit = async () => {
    const user = auth.currentUser;
    const firebase_uid = user ? user.uid : "";

    let profilePictureURL = profilePicturePreview;

    // Upload new profile picture if changed
    if (profilePicture) {
      const imageRef = ref(storage, `profile_pictures/${firebase_uid}`);
      try {
        await uploadBytes(imageRef, profilePicture);
        profilePictureURL = await getDownloadURL(imageRef);
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        setMessage("Error uploading profile picture.");
        return;
      }
    }

    const profileData = {
      firebase_uid,
      name,
      skill,
      location,
      time_availability: timeAvailability.join(","), // Save as comma-separated string
      years_of_experience: parseInt(yearsOfExperience) || null,
      email,
      portfolio_link: portfolioLink,
      profile_picture: profilePictureURL,
    };

    try {
      const response = await fetch("/api/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setMessage("Profile updated successfully!");
      } else {
        const data = await response.json();
        setMessage(data.error || "An error occurred while updating your profile.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage("An unexpected error occurred. Please try again later.");
    }
  };

  const handleTimeChange = (event) => {
    const value = event.target.value;
    setTimeAvailability(value.map(Number)); // Ensure numbers only, avoid NaN
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) => i); // Generates 0 - 23

  return (
    <Container maxWidth="xs" style={{ textAlign: "center", marginTop: "50px" }}>
      <Typography variant="h4" gutterBottom>
        Update Your Profile
      </Typography>

      {message && (
        <Typography variant="body2" color={message.includes("successfully") ? "green" : "red"} gutterBottom>
          {message}
        </Typography>
      )}

      <Avatar src={profilePicturePreview} alt="Profile Picture" sx={{ width: 100, height: 100, margin: "auto", marginBottom: "20px" }} />
      <input type="file" accept="image/*" onChange={(e) => setProfilePicture(e.target.files[0])} />

      <TextField label="Name" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
      <TextField label="Skill" fullWidth margin="normal" value={skill} onChange={(e) => setSkill(e.target.value)} />
      <TextField label="Location" fullWidth margin="normal" value={location} onChange={(e) => setLocation(e.target.value)} />

      <FormControl fullWidth margin="normal">
        <InputLabel>Time Availability</InputLabel>
        <Select
          multiple
          value={timeAvailability}
          onChange={handleTimeChange}
          renderValue={(selected) => (
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {selected.map((value) => (
                <Chip key={value} label={`${value}:00`} style={{ margin: 2 }} />
              ))}
            </div>
          )}
        >
          {timeOptions.map((hour) => (
            <MenuItem key={hour} value={hour}>
              {hour}:00
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Years of Experience"
        fullWidth
        margin="normal"
        type="number"
        value={yearsOfExperience}
        onChange={(e) => setYearsOfExperience(e.target.value)}
      />
      <TextField label="Portfolio Link" fullWidth margin="normal" value={portfolioLink} onChange={(e) => setPortfolioLink(e.target.value)} />
      <TextField label="Email" fullWidth margin="normal" value={email} disabled />

      <Button variant="contained" color="primary" fullWidth onClick={handleProfileSubmit} style={{ marginTop: "20px" }}>
        Save Profile
      </Button>
    </Container>
  );
}

export default Profile;