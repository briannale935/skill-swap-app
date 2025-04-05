import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#52ab98', boxShadow: 3 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left side buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            to="/Search"
            sx={{ color: 'white', fontWeight: 'bold', '&:hover': { backgroundColor: '#3e8e7e' } }}
          >
            Search
          </Button>
          <Button
            component={Link}
            to="/Matches"
            sx={{ color: 'white', fontWeight: 'bold', '&:hover': { backgroundColor: '#3e8e7e' } }}
          >
            Matches
          </Button>
          <Button
            component={Link}
            to="/PostCreation"
            sx={{ color: 'white', fontWeight: 'bold', '&:hover': { backgroundColor: '#3e8e7e' } }}
          >
            Blog
          </Button>
        </Box>

        {/* Right side Profile button */}
        <Box>
          <Button
            component={Link}
            to="/Profile"
            sx={{ color: 'white', fontWeight: 'bold', '&:hover': { backgroundColor: '#3e8e7e' } }}
          >
            Profile
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
