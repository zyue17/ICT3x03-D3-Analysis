import 'bootstrap/dist/css/bootstrap.min.css';
import http from "../AxiosSettings/http-common";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { NavLink,useHistory,useLocation } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import {React, useState, useEffect} from 'react';



function TwoFA({setToken, setDataToken, setadminToken}) {
const history = useHistory();
const location = useLocation();
const [value, setValue] = useState(0);
const [Code, setCode] = useState("");
const [result, setResult] = useState("");
const [username, setusername] = useState("");
//const [replies, setReplies] = useState([]);
 useEffect(() => {
       console.log(location.pathname); // result: '/TwoFA'
       console.log(location.state); // result: getting the username
       setusername(location.state[0]);
    }, [location]);

//Called once only
//  useEffect(()=>{
//    alert('We are in useEffect function');
//    http.get(`/test`)
//  .then(res => {
//    const persons = res.data;
//    setValue(persons.message);
//  })
//  },[]);

//setting the button value
const state = {
    button: 1
  };

  function validateForm() {
    return Code.length > 0;
  }



  function handleSubmit(event) {
  event.preventDefault();
  const Codeclean =Code.replace(/[^\w\s]/gi, "");
    if(state.button==1){
   http.post('/emailaut', {
        value: value,
        code: Codeclean,
        token: username
                    })
        .then(function(response){
        setResult(response.data.message);
            if (response.data.message =="Success") {
            alert("Success");
            setToken(response.data.User);
            setDataToken(response.data.Data);
            history.push('/');
            window.location.reload();
            }else if(response.data.message == "AdminSuccess"){
            setadminToken(response.data.User);
            setDataToken(response.data.Data);
            history.push('/AdminDashboard');
            window.location.reload();
            }else if(response.data.message == "AdminSuccess2"){
            setadminToken(response.data.User);
            setDataToken(response.data.Data);
            history.push('/AdminDashboard2');
            window.location.reload();
            }else if(response.data.message == "AdminSuccess3"){
            setadminToken(response.data.User);
            setDataToken(response.data.Data);
            history.push('/AdminDashboard3');
            window.location.reload();
            }
            else {
            alert("Unsuccessful Login");
            }
       //Perform action based on response
        })
        .catch(function(error){
          alert(error);
       //Perform action based on error
        });
  }

  else if (state.button==2){
   http.post('/resend', {
        value: value,
        token: username
                    })
        .then(function(response){
        setResult(response.data.message);
            if (response.data.message =="Success") {
            alert("Code Sent");
            }
            else {
            alert("Error");
            }
       //Perform action based on response
        })
        .catch(function(error){
          alert(error);
       //Perform action based on error
        });
  }

  }




const styles = {
        border: '1px solid black',
        padding:'80px',
        width:'720px',
        marginLeft:'400px',
        marginTop:'20px'
   };



  return (
  <div style={styles}>

      <h2>2FA Authentication</h2>
      <Paper square style={{backgroundColor: '#EEEEEE'}}>
        <Tabs
          value={value}
          textColor="primary"
          indicatorColor="primary"

          onChange={(event, newValue) => {
            setValue(newValue);
            if (newValue==0){
            document.getElementById("demo").innerHTML = "Enter your Email code (Inside your Junk/Spam)";
            }
            if (newValue==1){
            document.getElementById("demo").innerHTML = "Enter SMS code (Will only work for admin phone number because we are using the free trial version)";
            }
          }}
        >
          <Tab label="Email" />
          <Tab label="SMS" />

        </Tabs>
        <p id="demo">Enter your Email code (Inside your Junk/Spam)</p>

      <form onSubmit={handleSubmit}>
         <label>
           <input type ="text"  autoFocus
            type="Code"
            value={Code}
            onChange={(e) => setCode(e.target.value)} />
         </label>
         <Button type="submit" onClick={() => (state.button = 1)} disabled={!validateForm()} style={{marginTop:"10px"}}>Submit</Button>
         <Button type="submit" onClick={() => (state.button = 2)}  style={{position:"absolute", marginTop:"50px",marginLeft:"-255px"}}>Resend Code</Button>
       </form>




      </Paper>
    </div>
  );
}

export default TwoFA;
