import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { Box } from '@mui/material';
import SignIn from '../SignIn';
import Search from '../Search/Search';
import Navbar from './navbar';
import PostCreation from '../Blog/blog';
import Matches from '../Matches';
import Profile from '../Profile';
import Landing from '../Landing';
import MyReviews from '../Reviews/MyReviews';
import WriteReviews from '../Reviews/WriteReviews';
import ProfileReviews from '../Reviews/ProfileReviews';

// Layout for authenticated pages with navbar and background color
const AppLayout = () => (
  <Box sx={{ backgroundColor: '#c8d8e4', minHeight: '100vh' }}>
    <Navbar />
    <Routes>
      <Route path="/search" element={<Search />} />
      <Route path="/PostCreation" element={<PostCreation />} />
      <Route path="/Matches" element={<Matches />} />
      <Route path="/Profile" element={<Profile />} />
      <Route path="/MyReviews" element={<MyReviews />} />
      <Route path="/WriteReviews" element={<WriteReviews />} />
      <Route path="/ProfileReviews" element={<ProfileReviews />} />
    </Routes>
  </Box>
);

function MainApp() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      {!isAuthenticated ? (
        <SignIn onLogin={() => setIsAuthenticated(true)} />
      ) : (
        <MainApp />
      )}
    </Router>
  );
}

export default App;
