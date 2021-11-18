import 'bootstrap/dist/css/bootstrap.min.css';
import "./Navigationbar.css";

import {Container,Navbar,Nav} from "react-bootstrap";
import {React, useState,useEffect,useCallback,useRef,} from 'react';
import {useHistory } from "react-router-dom";
import moment from 'moment';

function Navigationbar(props) {
const [events, setEvents] = useState(['click', 'load', 'scroll']);
  const [second, setSecond] = useState(0);
const history = useHistory();
let button;
let buttond = false;
let timeStamp;
  let warningInactiveInterval = useRef();
  let startTimerInterval = useRef();

  // start inactive check
let timeChecker = () => {
  startTimerInterval.current = setTimeout(() => {
    let storedTimeStamp = sessionStorage.getItem('lastTimeStamp');
    warningInactive(storedTimeStamp);
  }, 60000);
};

// warning timer
let warningInactive = (timeString) => {
  clearTimeout(startTimerInterval.current);

  warningInactiveInterval.current = setInterval(() => {
    const maxTime = 2; // Maximum ideal time given before logout
    const popTime = 1; // remaining time (notification) left to logout.

    const diff = moment.duration(moment().diff(moment(timeString)));
    const minPast = diff.minutes();
    const leftSecond = 60 - diff.seconds();
    if (minPast === popTime) {
      setSecond(leftSecond);
      if(leftSecond==59){
      alert("Session Timeout in 1 Minute. Click OK to continue");
      window.location.reload();
      }
    }

    if (minPast === maxTime) {
      clearInterval(warningInactiveInterval.current);
      sessionStorage.removeItem('lastTimeStamp');
      // logout function here
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("dataToken");
      sessionStorage.removeItem("admintoken");
    }
  }, 1000);
};
// reset interval timer
  let resetTimer = useCallback(() => {
    if (props.tokenstatus!=null) {
      timeStamp = moment();
      sessionStorage.setItem('lastTimeStamp', timeStamp);
    } else {
      sessionStorage.removeItem('lastTimeStamp');
    }
  }, [props.tokenstatus]);

  // Life cycle hook
  useEffect(() => {
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });
// Run the timeChecker
     timeChecker();
  }, [resetTimer]);

function logout(){
var removesession = sessionStorage.removeItem("token")
sessionStorage.removeItem("dataToken")
sessionStorage.removeItem("admintoken")
 alert("Logout Successfully");
 window.location.reload();
}

if (props.tokenstatus==null){
button = <Nav.Link href="/login">Login</Nav.Link>;
}else{
button = <Nav.Link onClick={logout} >Logout</Nav.Link>;
     buttond = true;
}

if (props.admintokenstatus != null){
button = <Nav.Link onClick={logout} >Logout</Nav.Link>;
     buttond = false;
}
  return (
    <div className="Navigationbar">
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container>
            <Navbar.Brand href="/">Vanguard Bank</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="/">Home</Nav.Link>
                {button}
                {buttond && <Nav.Link href="/transfer">Transfer</Nav.Link>}
                {buttond && <Nav.Link href="/dash">Dashboard</Nav.Link>}
                {buttond && <Nav.Link href="/profile">Profile</Nav.Link>}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
    </div>
  );
}

export default Navigationbar;
