import {AppBar, Toolbar, Button, Typography} from '@mui/material';
import {Link} from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Button color="inherit" component={Link} to="/Search">
          Search
        </Button>
        <Button color="inherit" component={Link} to="/Matches">
          Matches
        </Button>
        <Button color="inherit" component={Link} to="/PostCreation">
          Blog
        </Button>
        <Button color="inherit" component={Link} to="/Profile">
          Profile
        </Button>
        <Button color="inherit" component={Link} to="/MyReviews ">
          My Reviews
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;