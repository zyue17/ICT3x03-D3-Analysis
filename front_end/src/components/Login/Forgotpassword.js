import './Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import http from "../AxiosSettings/http-common";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { NavLink, Link, useHistory, Redirect } from "react-router-dom";

import { React, useState } from 'react';



function Forgotpassword(props) {
  const history = useHistory();
  const [result, setResult] = useState("");
  const [onetimebtn, setonetimebtn] = useState(false);



  const [Username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  function validateForm() {
    return Username.length > 0 && (email.length >= 8 && email.length <= 15);
  }



  function handleSubmit(event) {
    setonetimebtn(true)
    event.preventDefault();
    const Usernameclean = Username.replace(/[^\w\s.-]/gi, "");
    //const passwordclean =password.replace(/[^\w\s]/gi, "");

    if (Usernameclean != "" && email != "") {
      if (RegExp(/[a-zA-Z\d]*_?.?[a-zA-Z\d]+/g).test(Username) && RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,15}/g).test(email)) {
        http.post('/forgotpassword', {
          username: Usernameclean,
          email: email
        })
          .then(function (response) {
            setResult(response.data.message);
            if (response.data.message == "Success") {
              alert("Success!! Your temporary password has been sent to your email. Please change your password in your profile after you have successfully login");
              setonetimebtn(false)
              history.push({ pathname: '/Login' });
            }
            else {
              alert("Please enter valid username or email");
              setonetimebtn(false)
            }
            //Perform action based on response
          })
          .catch(function (error) {
            alert(error);
            //Perform action based on error
          });
      } else {
        alert("Please enter valid username or email")
      }
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
    <div className="Forgotpassword">
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
          <Form.Group size="lg" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}

            />


            <br />
          </Form.Group>
          <Button block size="lg" type="submit" disabled={onetimebtn}>
            Submit
          </Button>
        </Form>

        <Link to="/Register">
          <Button block size="lg" type="submit" style={{ marginLeft: "150px", marginTop: "-75px" }}>
            Register
          </Button>
        </Link>
        <br />

      </div>
    </div>
  );
}

export default Forgotpassword;
