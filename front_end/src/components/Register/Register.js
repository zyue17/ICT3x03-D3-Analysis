import './Register.css';
import 'bootstrap/dist/css/bootstrap.min.css';


import http from "../AxiosSettings/http-common";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { NavLink, Link, useHistory, Redirect } from "react-router-dom";
import InputGroup from "react-bootstrap/InputGroup";

import { React, useState } from 'react';

function Register(props) {
  const [replies, setReplies] = useState([]);
  // http.get(`/`)
  //   .then(res => {
  //     const persons = res.data;

  //     setReplies(persons.message);
  //   })
  // http.post(`/asd/${props.score}`);


  const [Fullname, setFullname] = useState("");
  const [Address, setAddress] = useState("");
  const [Email, setEmail] = useState("");
  const [PhoneNumber, setPhonenumber] = useState("");
  const [result, setResult] = useState("");
  const [TwoFAEmail, setTwoFAEmail] = useState("");
  const [EmailCode, setEmailCode] = useState("");
  const [Emailcodealert, setEmailcodealert] = useState(false);
  const [Gender, setGender] = useState("");
  const [Username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setconfirmPassword] = useState("");
  const [Passwordflag, setPasswordFlag] = useState(false);


  // if disable in html F12 and enable itself, object in main would be empty.
  // save that ipaddress of the attacker and timestamp of the attack.

  // for control of 2FA EMAIL (unlocking the disable)
  const [Flag, setFlag] = useState(false);
  const [Sent, setSent] = useState(false);
  const [EmailCodeFlag, setEmailCodeFlag] = useState(false);

  // for control of 2FA Phone (unlocking the disable)
  const [PhoneFlag, setPhoneFlag] = useState(false);
  const [PhoneSent, setPhoneSent] = useState(false);
  const [PhoneCode, setPhoneCode] = useState("");
  const [Phonecodealert, setPhonecodealert] = useState(false);

  // for control of both 2FA preferences (unlocking the disable)
  const [Preferences, setPreferences] = useState("");

  // Making sure both of the 2FA is done even moving on
  const [EmailOtpSuccess, setEmailOtpSuccess] = useState(false);
  const [PhoneOtpSuccess, setPhoneOtpSuccess] = useState(false);
  // check available of username
  const [UsernameAvailable, setUsernameAvailableFlag] = useState(false);
  const [EmailAvailable, setEmailAvailableFlag] = useState(false);
  const [PhoneNumberAvailable, setPhoneNumberAvailableFlag] = useState(false);
  const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");

  const history = useHistory();
  const state = {
    button: 0
  };


  function validateForm() {
    return Fullname.length > 0 && password.length > 0;
  }


  function Codesent() {
    return Flag
  }

  function EnableField() {
    return Sent
  }

  function PhoneCodesent() {
    return PhoneFlag
  }

  function EnablePhoneField() {
    return PhoneSent
  }

  function analyze(e) {
    setPassword(e);
    if (strongRegex.test(e)) {
      alert("correct");
      setPasswordFlag(true);
    } else {
      setPasswordFlag(false);
    }
  }


  function validCode(e) {
    setEmailCode(e.target.value)
    alert(EmailCode.length)
    if (EmailCode.length == 5) {
      setEmailcodealert(true)
    } 
    return EmailCodeFlag
  }

  function validPhoneCode(e) {
    setPhoneCode(e.target.value)
    alert(PhoneCode.length)
    if (PhoneCode.length == 5) {
      setPhonecodealert(true)
    } else {
    }
    return setPhonecodealert
  }



  function validateForm() {
    return Username.length > 0 && (password.length >= 8 && password.length <= 15);
  }

  function handleSubmit(event) {
    event.preventDefault();
    /////////////////// STATE 1 SEND EMAIL OTP ////////////////////
    if (state.button == 1) {
      if (!EnableField()) {
        if (Email.length != 0) {
          setFlag(!Flag);
          setSent(!Sent);
          if (RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,15}/g).test(Email)) {
            http.post('/send_register_email', {
              Email: Email,
            })
              .then(function (response) {
                if (response.data.message == "Success") {
                  alert("Success");
                }
                else {
                  alert("Unsuccessful Login");
                }
                //Perform action based on response
              })
              .catch(function (error) {
                alert(error);
                //Perform action based on error
              });
          } else if (Email.length == 0) {
            alert("Please fill in your email");
          } else {
            alert("Please enter valid email");
          }
        }
      }
    }
    ////////////////////////// STATE 2 VERIFY EMAIL OTP ////////////////////////
    else if (state.button == 2) {
      if (EmailCode.length != 0) {
        if (RegExp(/^[A-Z0-9]{6}$/g).test(EmailCode)) {
          http.post('/verifyemail', {
            EmailCode: EmailCode,
          }).then(function (response) {
            if (response.data.message == "Success") {
              alert("Success");
              setEmailOtpSuccess(true);
            }
            else {
              alert("Unsuccessful Login");
            }
            //Perform action based on response
          })
            .catch(function (error) {
              alert(error);
              //Perform action based on error
            });
        } else {
          alert("Please enter valid OTP");
        }
      } else {
        alert("Please Try Again");
      }
    }
    /////////////////////////////State 3 SEND OTP PHONE##########################
    else if (state.button == 3) {
      if (!EnablePhoneField()) {
        setPhoneFlag(!PhoneFlag);
        setPhoneSent(!PhoneSent);
        http.post('/send_register_phone', {
          PhoneNumber: PhoneNumber,
        }).then(function (response) {
          if (response.data.message == "Success") {
            alert("Success");
          }
          else {
            alert("Unsuccessful Login");
          }
          //Perform action based on response
        })
          .catch(function (error) {
            alert(error);
            //Perform action based on error
          });
      }
    }
    /////////////////////////////////// STATE 4 verify Phone OTP /////////////////////////////////////
    else if (state.button == 4) {
      http.post('/verifyphone', {
        PhoneCode: PhoneCode,
      }).then(function (response) {
        if (response.data.message == "Success") {
          alert("Success");
          setPhoneOtpSuccess(true);
        }
        else {
          alert("Unsuccessful Login");
        }
        //Perform action based on response
      })
        .catch(function (error) {
          alert(error);
          //Perform action based on error
        });
    }
    /////////////////////// CHECK USERNAME //////////////////////////////////
    else if (state.button == 5) {
      if (Username.length != 0) {
        if (RegExp(/[a-zA-Z\d]*_?.?[a-zA-Z\d]+/g).test(Username)) {
          http.post('/check_username', {
            Username: Username,
          }).then(function (response) {
            if (response.data.message == "Success") {
              setUsernameAvailableFlag(true);
              alert("Name is available");
            }
            else {
              setUsernameAvailableFlag(false)
              alert("Name is taken");
            }
            //Perform action based on response
          })
            .catch(function (error) {
              alert(error);
              //Perform action based on error
            });
        } else {
          alert("Only a mix of alphanumeric, underscore or period allowed")
        }
      }
      else {
        alert("Please do not leave an empty field");
      }
    }
    else if (state.button == 6) {
      if (Email.length != 0) {
        http.post('/check_email', {
          Email: Email,
        }).then(function (response) {
          if (response.data.message == "Success") {
            setEmailAvailableFlag(true)
            alert("Email is available")
          }
          else {
            setEmailAvailableFlag(false)
            alert("Email is taken");
          }
          //Perform action based on response
        })
          .catch(function (error) {
            alert(error);
            //Perform action based on error
          });
      }
      else {
        alert("Please do not leave an empty field")
      }
    }
    else if (state.button == 7) {
      if (PhoneNumber.length != 0) {
        http.post('/check_phonenumber', {
          PhoneNumber: PhoneNumber,
        }).then(function (response) {
          if (response.data.message == "Success") {
            setPhoneNumberAvailableFlag(true)
            alert("Phone number is available")
          }
          else {
            setPhoneNumberAvailableFlag(false)
            alert("Phone number is taken");
          }
          //Perform action based on response
        })
          .catch(function (error) {
            alert(error);
            //Perform action based on error
          });
      }
      else {
        alert("Please do not leave an empty field")
      }
    }
    // this would be the final outcome but for now will be using email to save trial money
    //&& PhoneOtpSuccess == true)
    // remember to add phone number <=0
    else{
        if(Fullname.length <= 0 || Address.length <= 0 || Email.length <= 0 || Username.length <= 0 || password.length <= 0  )
    {
     alert("Please do not leave an empty field")
      }
    if (EmailOtpSuccess == true) {
      if ((password.length > 0 && password.length < 8) || password.length > 15) {
        alert("Password must be at least 8 characters and not more than 15 characters");
        return false;
      }
      if (password !== confirmpassword) {
        alert("Passwords don't match");
        return false;
      }
      if (Passwordflag && EmailAvailable && /*PhoneNumberAvailable &&*/ UsernameAvailable) {
        var Fullnameclean = ""
        if (RegExp(/^[a-zA-Z'-]+$/g).test(Fullname)) {
          Fullnameclean = Fullname
        } else {
          alert("Please enter a valid name");
          return false
        }
        // const Fullnameclean = Fullname.replace(/[^\w\s]/gi, "");
        const Addressclean = Address.replace(/[^\w\s]/gi, "");
        //const Usernameclean = Username.replace(/[^\w\s]/gi,"");
        if(RegExp(/^[a-zA-Z'-]+$/g).test()){
          http.post('/register', {
            Fullname: Fullnameclean,
            Address: Addressclean,
            Email: Email,
            Phone: PhoneNumber,
            Gender: Gender,
            Username: Username,
            Password: password,
            Preferences: Preferences
          })
            .then(function (response) {
              setResult(response.data.message);

              if (response.data.message == "Success") {
                alert("Success");
                history.push({ pathname: '/login', state: response.data.User });
              }
              else {
                alert("Unsuccessful Login");
              }
              //Perform action based on response
            })
            .catch(function (error) {
              alert(error);
              //Perform action based on error
            });
        } else {
          alert("Please enter a valid name!")
        }
      }
      
    }

}
  }

  /*<!-- Geneterate 2fa code in register for Email.
Genetrate 2fa code in regsier for phone. both will be Implemented at the end. -->*/


  const styles = {
    border: '1px solid black',
    padding: '80px',
  };



  return (
    <div className="Register">
      <div style={styles}>
        <div>Please click "Check Availability" for the required fields in order to submit the form</div>
        <br/>
        <Form onSubmit={handleSubmit}>
          <Form.Group size="lg" controlId="FullName">
            <Form.Label>Fullname</Form.Label>
            <Form.Control
              autoFocus
              type="text"
              value={Fullname}
              onChange={(e) => setFullname(e.target.value)}
            />

          </Form.Group>
          <Form.Group size="lg" controlId="Address">
            <Form.Label>Address</Form.Label>
            <Form.Control
              autoFocus
              type="text"
              value={Address}
              placeholder="Yio Chu kang Ave 4 Blk 123 #123 123456"
              onChange={(e) => setAddress(e.target.value)}
            />

          </Form.Group>
          <Form.Group controlId="Gender">
            <Form.Label>Gender</Form.Label>
            {['radio'].map((type) => (
              <div key={`inline-${type}`} className="mb-3">
                <Form.Check
                  inline
                  label="Male"
                  value="Male"
                  name="group1"
                  type={type}
                  id={`inline-${type}-1`}
                  onChange={(e) => setGender(e.target.value)}
                />
                <Form.Check
                  inline
                  label="Female"
                  value="Female"
                  name="group1"
                  type={type}
                  id={`inline-${type}-2`}
                  onChange={(e) => setGender(e.target.value)}
                />
              </div>
            ))}

          </Form.Group>
          <Form.Group size="lg" controlId="Email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              autoFocus
              type="email"
              value={Email}
              placeholder="name@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <button type="submit" onClick={() => (state.button = 6)} >Check Availability </button>
            <button type="submit" onClick={() => (state.button = 1)}> Send Code </button>

          </Form.Group>

          <Form.Group size="lg" controlId="2FAEmail">
            <Form.Label>Code</Form.Label>
            <Form.Control
              autoFocus
              type="text"
              value={EmailCode}
              onChange={(e) => validCode(e)}
              disabled={!Codesent()}
            />
            <button type="submit" onClick={() => (state.button = 2)} disabled={!Codesent()}> Verify Email </button>
          </Form.Group>
          <Form.Group size="lg" controlId="PhoneNumber">
            <Form.Label>Phone Number</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon1">+65</InputGroup.Text>
              <Form.Control
                type="number"
                min="0"
                step="1"
                value={PhoneNumber && Math.max(0, PhoneNumber)}
                onChange={e => setPhonenumber(e.target.value ? Number(e.target.value) : e.target.value)}
                aria-describedby="basic-addon1"
              />
            </InputGroup>

          </Form.Group>

          <Form.Group>
            <button type="submit" onClick={() => (state.button = 7)} >Check Availability </button>
            <button type="submit" onClick={() => (state.button = 3)}> Send Code </button>

          </Form.Group>

          <Form.Group size="lg" controlId="2FAPhone">
            <Form.Label>Code</Form.Label>
            <Form.Control
              autoFocus
              type="text"
              value={PhoneCode}
              onChange={(e) => validPhoneCode(e)}
              disabled={!PhoneCodesent()}
            />
            <button type="submit" onClick={() => (state.button = 4)} disabled={!PhoneCodesent()}> Verify Phone </button>
          </Form.Group>

          <Form.Group controlId="Preferences">
            <Form.Label>Default 2FA method </Form.Label>
            {['radio'].map((type) => (
              <div key={`inline-${type}`} className="mb-3">
                <Form.Check
                  inline
                  label="Email"
                  value="0"
                  name="2FA"
                  type={type}
                  id={`inline-${type}-1`}
                  disabled={!EmailOtpSuccess}
                  onChange={(e) => setPreferences(e.target.value)}
                />
                <Form.Check
                  inline
                  label="SMS"
                  value="1"
                  name="2FA"
                  type={type}
                  id={`inline-${type}-2`}
                  disabled={!PhoneOtpSuccess}
                  onChange={(e) => setPreferences(e.target.value)}
                />
              </div>
            ))}

          </Form.Group>

          <Form.Group size="lg" controlId="Username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={Username}
              onChange={e => setUsername(e.target.value)}
            />
            <button type="submit" onClick={() => (state.button = 5)}>Check Availability </button>
          </Form.Group>
          <br />
          <Form.Group size="lg" controlId="Password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              // onChange={e => setPassword(e.target.value)}
              onChange={e => analyze(e.target.value)}

            />
            <br />
          </Form.Group>
          <Form.Group size="lg" controlId="ConfirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              value={confirmpassword}
              onChange={e => setconfirmPassword(e.target.value)}

            />
            <br />
          </Form.Group>
          <Button block size="lg" type="submit" onClick={handleSubmit}>
            Register
          </Button>
        </Form>

      </div>
    </div>
  );
}

export default Register;
