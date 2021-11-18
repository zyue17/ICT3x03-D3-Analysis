import './Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import http from "../AxiosSettings/http-common";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { NavLink, Link, useHistory, Redirect } from "react-router-dom";

import { React, useState } from 'react';



function Forgotusername(props) {
  const history = useHistory();
  const [result, setResult] = useState("");
  const [onetimebtn, setonetimebtn] = useState(false);



  const [Email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  function validateForm() {
    return Email.length > 0 && (phone.length >= 8 && phone.length <= 15);
  }



  function handleSubmit(event) {
    setonetimebtn(true)
    event.preventDefault();
    //const Emailclean =Email.replace(/[^\w\s]/gi, "");
    //const passwordclean =password.replace(/[^\w\s]/gi, "");
    if ((phone.length > 0 && phone.length < 8) || phone.length > 15) {
      alert("Phone must be at least 8 characters and not more than 15 characters");
      setonetimebtn(false)
      return false;
    }
    if (Email != "" && phone != "") {
      if (RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,15}/g).test(Email)) {
        http.post('/forgotusername', {
          email: Email,
          phone: phone
        })
          .then(function (response) {
            setResult(response.data.message);
            if (response.data.message == "Success") {
              alert("Success!! Your temporary username has been sent to your email. Please change your username in your profile after you have successfully login");
              setonetimebtn(false)
              history.push({ pathname: '/Login' });
            }
            else {
              alert("Unsuccessful");
              setonetimebtn(false)
            }
            //Perform action based on response
          })
          .catch(function (error) {
            alert(error);
            //Perform action based on error
          });
      } else if (Email.length == 0 || phone.length == 0) {
        alert("Email or phone cannot be empty")
        setonetimebtn(false)
        return false;
      } else {
        alert("Please enter valid email")
      }
    } else {
      alert("Email or phone cannot be empty")
    }
  }

  const styles = {
    border: '1px solid black',
    padding: '80px',
  };


  return (
    <div className="Forgotusername">
      <div style={styles}>
        <Form onSubmit={handleSubmit}>
          <Form.Group size="lg" controlId="Email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              autoFocus
              type="Email"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group size="lg" controlId="phone">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}

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

export default Forgotusername;
