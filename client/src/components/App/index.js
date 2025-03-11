import {BrowserRouter as Router, Routes, Route, useNavigate} from 'react-router-dom';
import {useState} from 'react';
import SignIn from '../SignIn';
import Search from '../Search/Search';
import Navbar from './navbar';
import PostCreation from '../Blog/blog';
import Matches from '../Matches';

function MainApp() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/search" element={<Search />} />
        <Route path="/PostCreation" element={<PostCreation />} />
        <Route path="/Matches" element={<Matches />} />
      </Routes>
    </>
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