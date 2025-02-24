import React, { useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FirebaseAuth } from '../Firebase/firebase'; 

const Login = ({ setAuthUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userCredential = await FirebaseAuth.signIn(email, password);
      setAuthUser(userCredential.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <Typography variant="h4">Login</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TextField label="Email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" />
      <TextField label="Password" fullWidth type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" />
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Login
      </Button>
    </div>
  );
};

export default Login;