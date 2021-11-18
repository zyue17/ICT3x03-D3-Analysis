import './Profile.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Image from "../Profile/a.jpg";
import {Button, CardGroup, Row, Col,style,hr,modal} from "react-bootstrap";
import "bootstrap/dist/js/bootstrap.min.js";
import {React, useState, useEffect} from 'react';
import useToken from '../App/useToken';
import useDataToken from '../App/useDataToken';
import Form from "react-bootstrap/Form";
import { NavLink,Link,useHistory,Redirect } from "react-router-dom";
import http from "../AxiosSettings/http-common";
import InputGroup from "react-bootstrap/InputGroup";






function Profile(props) {
  const history = useHistory();
  const { token, setToken } = useToken();
  const { dataToken, setDataToken } = useDataToken();
  const [onetimebtn, setonetimebtn] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [usname, setUname] = useState(""); 
  const[PhoneNumberAvailable, setPhoneNumberAvailableFlag] = useState(false);
  const [EmailAvailable, setEmailAvailableFlag] = useState(false);
  useEffect(async() => {
    if (dataToken && token) {
      var data = JSON.parse(dataToken);
      data = String(data.id);
      http.post('/Profile', {
        cID: data

        })
        .then(function(response){
            if (response.data.message =="Success") {
              var data = JSON.parse(response.data.name);
              setName(data);
              var data = JSON.parse(response.data.address);
              setAddress(data);
              var data = JSON.parse(response.data.contact);
              setContact(data);
              var data = JSON.parse(response.data.email);
              setEmail(data);  
              var data = JSON.parse(response.data.usname);
              setUname(data);  
            }
            else{
              alert("failed to retrieve account details");
            }
          })
          .catch(function(error){
            alert(error);
          });
        
    }
   }, []);

   
   const [Username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [newpass, setnewPassword] = useState("");
   const [newadd, setnewadd] = useState("");
   const [newcon, setnewcon] = useState("");
   const [newemail, setnewemail] = useState("");

    function changepassword(event) {
     setonetimebtn(true);
     event.preventDefault();
     const Usernameclean =Username.replace(/[^\w\s]/gi, "");
     if (password != "" && Username!=""&& newpass!=""){
      if ((newpass.length>0&&newpass.length<8) || newpass.length>15){
        alert("Password must be at least 8 characters and not more than 15 characters");
        return false;
      }
         var data = JSON.stringify([Username, password, newpass]);
         http.post('/changepass', {
           newpass: data,
           username: Usernameclean,
           password: password,
           token: sessionStorage.getItem("token")
         })
      
           .then(function (response) {
             if (response.data.message == "Success") {
               alert("Success");
               setonetimebtn(false);
             }
             else {
              alert("Wrong password or username, update fail");
               setonetimebtn(false);
             }
           })
           .catch(function (error) {
             alert("Failed");
             setonetimebtn(false);
           });
     }
   }

   function changeaddress(event) {
    setonetimebtn(true);
    event.preventDefault();
    const Usernameclean =Username.replace(/[^\w\s]/gi, "");
    if ((password.length>0&&password.length<8) || password.length>15){
      alert("Password must be at least 8 characters and not more than 15 characters");
      setonetimebtn(false)
      return false;
      }
    if (password != "" && Username!=""&& newadd!=""){
 
      var data4 = JSON.stringify([Username, password, newadd]);
      http.post('/changeadd', {
        newadd: data4,
        username: Usernameclean,
        password: password,
        token: sessionStorage.getItem("token")
      })
     
          .then(function (response) {
            if (response.data.message == "Success") {
              alert("Success");
              setonetimebtn(false);
            }
            else {
              alert("Wrong password or username, update fail");
              setonetimebtn(false);
            }
          })
          .catch(function (error) {
            alert("Failed");
            setonetimebtn(false);
          });
      
    
    }
  }
  function changecontact(event) {
    setonetimebtn(true);
    event.preventDefault();
    const Usernameclean =Username.replace(/[^\w\s]/gi, "");
    if ((password.length>0&&password.length<8) || password.length>15){
      alert("Password must be at least 8 characters and not more than 15 characters");
      setonetimebtn(false)
      return false;
      }
    if (password != "" && Username!=""&& newcon!="") {
 
      var data3 = JSON.stringify([Username, password,newcon]);
      http.post('/changecon', {
        newcon: data3,
        username: Usernameclean,
        password: password,
        token: sessionStorage.getItem("token")
      })
     
      .then(function(response){
            if (response.data.message =="Success") {
            setPhoneNumberAvailableFlag(true)
            alert("Phone number is available, update success")
            }
            else {
            setPhoneNumberAvailableFlag(false)
            alert("Wrong password or user name, update fail");
            }
    
        })
        .catch(function(error){
          alert(error);
        });
    
    }
  }
  function changeemail(event) {
    setonetimebtn(true);
    event.preventDefault();
    const Usernameclean =Username.replace(/[^\w\s]/gi, "");
    if ((password.length>0&&password.length<8) || password.length>15){
      alert("Password must be at least 8 characters and not more than 15 characters");
      setonetimebtn(false)
      return false;
      }
    if (password != "" && Username!=""&& newemail!="") {
 
      var data2 = JSON.stringify([Username, password,newemail]);
      http.post('/changeemail', {
        newemail: data2,
        username: Usernameclean,
        password: password,
        token: sessionStorage.getItem("token")
      })
     
      .then(function(response){
            if (response.data.message =="Success") {
            setEmailAvailableFlag(true)
            alert("Email is available, update sucess")
            }
            else {
            setEmailAvailableFlag(false)
            alert("Wrong password or user name, update fail");
            }
        })
        .catch(function(error){
          alert(error);
        });
      
    
    }
  }


   
  if(token){

    return (
      <div className="Profile">  
        <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" rel="stylesheet"/>
          <div className="container bootstrap snippets bootdey"/>
          <div className="row">
    

      <div className="col-md-12">
        <div className="grid profile">
          <div className="grid-header">
          
            <div className="col-xs-7">
            {name &&<Row xs={1} md={1} className="g-4"><h3>Welcome {name}!</h3></Row>}
              
              <img src={Image} className="ipro" alt="" />
            </div>
          
          </div>
          <div className="grid-body">
            
                <h1>My Profile</h1>
                <br></br>
                <div className="row">
                  <div class="col-md-6">
                    <p><strong>Address:</strong> {address} <button data-bs-toggle="modal" data-bs-target="#changeadd" className="button" value="EAddress" type="submit"><i class="fa fa-pencil"></i></button> </p>
                    <p><strong>Mobile:</strong> {contact} <button className="button"data-bs-toggle="modal" data-bs-target="#changecon" value="EMobile" type="submit"><i class="fa fa-pencil"></i></button></p>
                    <p><strong>Email:</strong> {email} <button data-bs-toggle="modal" data-bs-target="#changeemail" className="button" value="EEmail" type="submit"><i class="fa fa-pencil"></i></button></p>
                  </div>
                  <hr className="rounded"></hr>
                  <h1>Security</h1>
                  <p><strong>Username:</strong> {usname}</p>
                  <p><strong>Password:</strong> ****** <button data-bs-toggle="modal" data-bs-target="#changepass" className="button"  type="submit"><i class="fa fa-pencil"></i></button></p>     
                </div>
              </div>
                      



                     

         <div class="modal fade" id="changeadd" tabindex="-1" aria-labelledby="changeadd" aria-hidden="true">
         <div class="modal-dialog">
            <div class="modal-content">
               <div class="modal-header">
               <h5 class="modal-title text-danger" id="changeadd">Change Address</h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body">
             <Form onSubmit={changeaddress}>
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
            </Form.Group>
          <Form.Group size="lg" controlId="Address">
          <Form.Label>Address</Form.Label>
          <Form.Control
            autoFocus
            type="text"
            value={newadd}
            placeholder =  "Yio Chu kang Ave 4 Blk 123 #123 123456"
            onChange={(e) => setnewadd(e.target.value)}
          />
               <br />
        </Form.Group>
        <Button block size="lg" type="submit" disabled={onetimebtn}>
         Change Address
        </Button>
        </Form>
               </div>
               <div class="modal-footer">
  
               <button type="button"  class="btn btn-warning" data-bs-dismiss="modal">Close</button>
               </div>
            </div>
         </div>
         </div>





         <div class="modal fade" id="changepass" tabindex="-1" aria-labelledby="changepass" aria-hidden="true">
         <div class="modal-dialog">
            <div class="modal-content">
               <div class="modal-header">
               <h5 class="modal-title text-danger" id="changepass">Change Password</h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body">
             <Form onSubmit={changepassword}>
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
          <Form.Label>Current Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}

          />
            </Form.Group>
          <Form.Group size="lg" controlId="password">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            value={newpass}
            onChange={(e) => setnewPassword(e.target.value)}

          />
               <br />
        </Form.Group>
        <Button block size="lg" type="submit" disabled={onetimebtn}>
         Change password
        </Button>
        </Form>
               </div>
               <div class="modal-footer">
               <button type="button" class="btn btn-warning" data-bs-dismiss="modal">Close</button>
               </div>
            </div>
         </div>
         </div>





         <div class="modal fade" id="changecon" tabindex="-1" aria-labelledby="changecon" aria-hidden="true">
         <div class="modal-dialog">
            <div class="modal-content">
               <div class="modal-header">
               <h5 class="modal-title text-danger" id="changepass">Change contact</h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body">
             <Form onSubmit={changecontact}>
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
            </Form.Group>
          <Form.Group size="lg" controlId="contact">
          <Form.Label>Contact</Form.Label>  
          <InputGroup.Text id="basic-addon1">+65</InputGroup.Text> 
          <InputGroup className="mb-3">       
            <Form.Control
               type="number"
               min="0"
               step="1"
              value={newcon&& Math.max(0, newcon)}
              onChange={(e) => setnewcon(e.target.value ? Number(e.target.value) : e.target.value)}
              aria-describedby="basic-addon1"
              />
          </InputGroup>
        </Form.Group>
        <Button block size="lg" type="submit" disabled={onetimebtn}>
         Change Contact
        </Button>
        </Form>
               </div>
               <div class="modal-footer">
               <button type="button" class="btn btn-warning" data-bs-dismiss="modal" onClick="window.location.reload();">Close</button>
               </div>
            </div>
         </div>
         </div>
                




         <div class="modal fade" id="changeemail" tabindex="-1" aria-labelledby="changeemail" aria-hidden="true">
         <div class="modal-dialog">
            <div class="modal-content">
               <div class="modal-header">
               <h5 class="modal-title text-danger" id="changeemail">Change Email</h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body">
             <Form onSubmit={changeemail}>
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
            </Form.Group>
          <Form.Group size="lg" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            autoFocus
            type="Email"
            value={newemail}
            placeholder = "name@example.com"
            onChange={(e) => setnewemail(e.target.value)}
            />
               <br />
        </Form.Group>
        <Button block size="lg" type="submit" disabled={onetimebtn}>
         Change Email
        </Button>
        </Form>
               </div>
               <div class="modal-footer">
               <button type="button" class="btn btn-warning" data-bs-dismiss="modal"onClick="window.location.reload();">Close</button>
               </div>
            </div>
         </div>
         </div>

          </div>
        </div>
      </div>
    </div>

   
  
  );
}
else{
  history.push('/');
  window.location.reload();
}
}

export default Profile;
