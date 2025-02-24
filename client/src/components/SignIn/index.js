import { useState } from "react";
import { Container, TextField, Button, Typography } from "@mui/material";
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "../../firebase";

function SignIn({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError(""); // Clear previous errors
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const firebase_uid = user.uid;
  
        // ✅ Send only **email** & **firebase_uid** to backend
        await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firebase_uid, email }),
        });
  
        console.log("User registered successfully!");
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in successfully!");
      }
  
      onLogin(); // Proceed to the main site
    } catch (err) {
      setError(err.message);
    }
  };


  

  return (
    <Container maxWidth="xs" style={{ textAlign: "center", marginTop: "50px" }}>
      <Typography variant="h4" gutterBottom>
        {isSignUp ? "Sign Up" : "Sign In"}
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" color="primary" fullWidth onClick={handleSubmit} style={{ marginTop: "20px" }}>
        {isSignUp ? "Sign Up" : "Sign In"}
      </Button>
      <Button color="secondary" fullWidth onClick={() => setIsSignUp(!isSignUp)} style={{ marginTop: "10px" }}>
        {isSignUp ? "Already have an account? Sign In" : "New user? Sign Up"}
      </Button>
    </Container>
  );
}

export default SignIn;
