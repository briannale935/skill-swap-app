import { AppBar, Toolbar, Button, IconButton, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function Navbar() {
  return (
    <AppBar
      position="static"
      elevation={4}
      sx={{
        backgroundColor: '#52ab98',
        borderRadius: '0 0 16px 16px',
        padding: '0 12px',
        fontFamily: '"Comic Neue", cursive',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar>
        <Button
          color="inherit"
          component={RouterLink}
          to="/Search"
          sx={navButtonStyle}
        >
          🔍 Search
        </Button>
        <Button
          color="inherit"
          component={RouterLink}
          to="/Matches"
          sx={navButtonStyle}
        >
          💞 Matches
        </Button>
        <Button
          color="inherit"
          component={RouterLink}
          to="/PostCreation"
          sx={navButtonStyle}
        >
          ✍️ Blog
        </Button>
        <Button
          color="inherit"
          component={RouterLink}
          to="/MyReviews"
          sx={navButtonStyle}
        >
          🌟 Reviews
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton
          component={RouterLink}
          to="/Profile"
          color="inherit"
          sx={{ '&:hover': { transform: 'scale(1.1)' }, transition: '0.2s' }}
        >
          <AccountCircleIcon fontSize="large" />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

// Reusable nav button style
const navButtonStyle = {
  marginRight: '12px',
  fontWeight: 'bold',
  fontSize: '16px',
  textTransform: 'none',
  borderRadius: '12px',
  padding: '6px 12px',
  transition: '0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-1px)',
  },
};

export default Navbar;
