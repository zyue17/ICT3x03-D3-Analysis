import './Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import http from "../AxiosSettings/http-common";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { NavLink, Link, useHistory, Redirect } from "react-router-dom";

import { React, useState } from 'react';


function Login(props) {
  const history = useHistory();
  const [replies, setReplies] = useState([]);
  const [result, setResult] = useState("");
  const [onetimebtn, setonetimebtn] = useState(false);
  /*http.get(`/`)
  .then(res => {
    const persons = res.data;

    setReplies(persons.message);
  })*/

  console.log("login page");

  const [Username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errormessage, setErrorMessage] = useState("");

  function validateForm() {
    return Username.length > 0 && (password.length >= 8 && password.length <= 15);
  }

  function handleSubmit(event) {
    setonetimebtn(true)
    event.preventDefault();
    const Usernameclean = Username.replace(/[^\w\s]/gi, "");
    //const passwordclean =password.replace(/[^\w\s]/gi, "");
    if ((password.length > 0 && password.length < 8) || password.length > 15) {
      alert("Password must be at least 8 characters and not more than 15 characters");
      setonetimebtn(false)
      return false;
    }
    if (Usernameclean != "" && password != "") {
      http.post('/loginauthentication', {
        username: Usernameclean,
        password: password
      })
        .then(function (response) {
          setResult(response.data.message);
          if (response.data.message == "Success") {
            alert("Success");
            setonetimebtn(false)
            history.push({ pathname: '/TwoFA', state: [response.data.User, response.data.Data] });
          } else {
            alert("Invalid Username or Password!")
            setonetimebtn(false)
          }// else {
          //   alert("Unsuccessful Login");
          //   setonetimebtn(false)
          // }
          //Perform action based on response
        })
        .catch(function (error) {
          alert(error);
          //setErrorMessage = error
          //alert("An error occured, please try again.")
          //Perform action based on error
        });


    } else {
      alert("The search query cannot be empty")
      setonetimebtn(false)
      return false;
    }

  }




  const styles = {
    border: '1px solid black',
    padding: '80px',
  };


  return (
    <div className="Login">
      <div style={styles}>
        <Form onSubmit={handleSubmit}>
          <Form.Group size="lg" controlId="Username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              autoFocus
              type="Username"
              value={Username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>
          <Form.Group size="lg" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}

            />


            <br />
          </Form.Group>
          <Button block size="lg" type="submit" disabled={onetimebtn}>
            Login
          </Button>
        </Form>

        <Link to="/Register">
          <Button block size="lg" type="submit" style={{ marginLeft: "150px", marginTop: "-75px" }}>
            Register
          </Button>
        </Link>
        <br />
        <NavLink
          className="navbar-item"
          to="/Forgotusername">
          Forgot Username
        </NavLink>
        <br />
        <NavLink
          className="navbar-item"
          to="/Forgotpassword">
          Forgot Password
        </NavLink>
      </div>
    </div>
  );
}

export default Login;
