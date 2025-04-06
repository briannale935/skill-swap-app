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
import Comments from '../Blog/Comments';
import PostDetails from '../Blog/PostDetails';

// Layout for authenticated pages with navbar and background color
const AppLayout = ({ onLogout }) => (
  <Box sx={{ backgroundColor: '#c8d8e4', minHeight: '100vh' }}>
    <Navbar onLogout={onLogout} />
    <Routes>
      <Route path="/search" element={<Search />} />
      <Route path="/blog" element={<PostCreation />} />
      <Route path="/PostCreation" element={<PostCreation />} />
      <Route path="/Matches" element={<Matches />} />
      <Route path="/Profile" element={<Profile />} />
      <Route path="/MyReviews" element={<MyReviews />} />
      <Route path="/WriteReviews" element={<WriteReviews />} />
      <Route path="/ProfileReviews" element={<ProfileReviews />} />
      <Route path="/PostCreation/Comments" element={<Comments />} />
      <Route path="/post/:postId" element={<PostDetails />} />
    </Routes>
  </Box>
);

function MainApp({ onLogout }) {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/*" element={<AppLayout onLogout={onLogout} />} />
    </Routes>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      {!isAuthenticated ? (
        <SignIn onLogin={() => setIsAuthenticated(true)} />
      ) : (
        <MainApp onLogout={handleLogout} />
      )}
    </Router>
  );
}

export default App;
