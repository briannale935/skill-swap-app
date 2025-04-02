import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Avatar,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Paper,
  Box,
} from "@mui/material";
import { auth } from "../../firebase"; // Firebase authentication import
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [name, setName] = useState("");
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [timeAvailability, setTimeAvailability] = useState([]);
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
              data.time_availability
                ? data.time_availability.split(",").map((t) => Number(t.trim())).filter((t) => !isNaN(t))
                : []
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
      time_availability: timeAvailability.join(","),
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
    setTimeAvailability(value.map(Number)); // Ensure numbers only
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) => i); // Generates 0 - 23

  return (
    <Box sx={{ backgroundColor: "#c8d8e4", minHeight: "100vh", py: 5 }}>
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            padding: 4,
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: 600, color: "#2b6777" }}
          >
            Update Your Profile
          </Typography>

          {message && (
            <Typography
              variant="body2"
              align="center"
              color={message.includes("successfully") ? "green" : "error"}
              gutterBottom
            >
              {message}
            </Typography>
          )}

          <Box textAlign="center" mb={3}>
            <Avatar
              src={profilePicturePreview}
              alt="Profile Picture"
              sx={{ width: 100, height: 100, mx: "auto", mb: 1 }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files[0])}
            />
          </Box>

          {/* Input Fields */}
          {[ 
            { label: "Name", value: name, setter: setName },
            { label: "Skill", value: skill, setter: setSkill },
            { label: "Location", value: location, setter: setLocation },
            {
              label: "Years of Experience",
              value: yearsOfExperience,
              setter: setYearsOfExperience,
              type: "number",
            },
            {
              label: "Portfolio Link",
              value: portfolioLink,
              setter: setPortfolioLink,
            },
          ].map(({ label, value, setter, type = "text" }) => (
            <TextField
              key={label}
              label={label}
              fullWidth
              margin="normal"
              value={value}
              type={type}
              onChange={(e) => setter(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#2b6777" },
                  "&:hover fieldset": { borderColor: "#52ab98" },
                  "&.Mui-focused fieldset": { borderColor: "#2b6777" },
                },
              }}
            />
          ))}

          {/* Time Availability */}
          <FormControl fullWidth margin="normal">
            <InputLabel shrink sx={{ color: "#2b6777", fontWeight: 600 }}>
              Time Availability
            </InputLabel>
            <Select
              multiple
              value={timeAvailability}
              onChange={handleTimeChange}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={`${value}:00`}
                      sx={{
                        backgroundColor: "#52ab98",
                        color: "#ffffff",
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Box>
              )}
              sx={{
                mt: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#2b6777' },
                  '&:hover fieldset': { borderColor: '#52ab98' },
                  '&.Mui-focused fieldset': { borderColor: '#2b6777' },
                },
              }}
            >
              {timeOptions.map((hour) => (
                <MenuItem key={hour} value={hour}>
                  {hour}:00
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Email Field */}
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            disabled
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#2b6777" },
              },
            }}
          />

          {/* Submit Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleProfileSubmit}
            sx={{
              mt: 3,
              backgroundColor: "#2b6777",
              color: "#ffffff",
              fontWeight: 600,
              borderRadius: "10px",
              padding: "12px",
              fontSize: "16px",
              "&:hover": {
                backgroundColor: "#52ab98",
              },
            }}
          >
            Save Profile
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default Profile;
