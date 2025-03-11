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
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 