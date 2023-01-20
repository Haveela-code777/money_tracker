import Container from 'react-bootstrap/Container';
import {Navbar} from 'react-bootstrap';
import {useCookies} from 'react-cookie';
import { useNavigate } from "react-router-dom";

function NavBar(props) {
  
  let navigate = useNavigate()

  const [token, setToken, removeToken] = useCookies(['token'])

  function logoutBtn() {
    window.location.reload(false);
    removeToken(['token'])
    navigate('/login')
  }

  return (
    <Navbar bg="dark" variant="dark" style={{top: 0,right: 0,left:0}}>
      <Container>
        <Navbar.Brand href="/">Money Tracker</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          {props.data ? (
            <Navbar.Text>
              <button className='btn btn-danger' style={{textDecoration: "none"}} onClick={logoutBtn}>Logout</button>
            </Navbar.Text>
          ) : (
            <Navbar.Text>
            </Navbar.Text>
          )}
          
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;