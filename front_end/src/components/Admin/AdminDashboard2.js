 import './AdminDashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import fernet from 'fernet';
import {Button, CardGroup, Row, Col} from "react-bootstrap";
import {React, useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import useToken from '../App/useToken';
import useDataToken from '../App/useDataToken';
import useAdminToken from '../App/useAdminToken';
import http from "../AxiosSettings/http-common";

import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

function AdminDashboard2(props) {
  const history = useHistory();
  const { admintoken, setadminToken } = useAdminToken();
  const { dataToken, setDataToken } = useDataToken();
  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState("");
  const [priority, setpriority] = useState("");
  const [CustomerName, SetCustomerName] = useState("");
  const [CustomerPhone, SetCustomerPhone] = useState("");
  const [transactions, Settransactions] = useState([]);
    const [Logintimestamp, SetLogintimestamp] = useState([]);
  const [Account, SetAccount] = useState("");
    const state = {
    button: 0
  };
  useEffect(async() => {
    if (dataToken && admintoken) {
      var data = JSON.parse(dataToken);
      var data2 = JSON.parse(dataToken);
      data = String(data.id);
      data2 = String(data2.priority);
      if(data2 != "2"){
      alert("Not allowed");
      history.push('/');
      }
      http.post('/AdminDashboard', {
        aID: data
        })
        .then(function(response){
            if (response.data.message =="Success") {
              var data = JSON.parse(response.data.name);
              setName(data);

            }
            else{
              alert("failed to retrieve account details");
            }
        })
        .catch(function(error){
          alert(error);
       //Perform action based on error
        });
    }
   }, []);

     function handleSubmit(event) {
    event.preventDefault();
    if (state.button == 1) {
       if(CustomerName.length !=0 && CustomerPhone.length !=0){
      http.post('/Admin_RequestCustomerLoginLogs', {
        CustomerName: CustomerName,
        CustomerPhone : CustomerPhone,
        Adminname : name
                    })
        .then(function(response){
            if (response.data.message =="Success") {
            alert("Success");
            SetLogintimestamp(Logintimestamp =>[...Logintimestamp,response.data.Logintimestamp]);
            alert(Logintimestamp);
            alert("Done");
            }
            else {
            alert("Unsuccessful");
            }
       //Perform action based on response
        })
        .catch(function(error){
          alert(error);
       //Perform action based on error
        });
   }else{
   alert("Please do not leave blank for Customer name and Phone")
   }
    }else if (state.button == 2) {
       if(CustomerName.length !=0 && CustomerPhone.length !=0 && Account.length !=0){
      http.post('/Admin_Customertransactions', {
        CustomerName: CustomerName,
        CustomerPhone : CustomerPhone,
        Account : Account,
        Adminname : name
                    })
        .then(function(response){
        console.log(response.data.message);
            if (response.data.message =="Success") {
            alert("Success");
            Settransactions(transactions =>[...transactions,response.data.transactions]);
            }
            else {
            alert("Account Id not belonging to Customer");
            }
       //Perform action based on response
        })
        .catch(function(error){
          alert(error);
       //Perform action based on error
        });
   }else{
   alert("Please do not leave blank for Customer name, Phone and Account")
    }
    }
    }


  if (admintoken){
        return(
        <Form onSubmit={handleSubmit}>
        <Form.Group size="lg" controlId="CustomerName">
          <Form.Label>Customer Name</Form.Label>
          <Form.Control
            autoFocus
            type="text"
            value={CustomerName}
            onChange={(e) => SetCustomerName(e.target.value)}
          />

        </Form.Group>
      <Form.Group size="lg" controlId="Customer Phone">
     <Form.Label>Customer Phone</Form.Label>
                <InputGroup className="mb-3">
    <InputGroup.Text id="basic-addon1">+65</InputGroup.Text>
     <Form.Control
          type="number"
          min="0"
          step="1"
          value={CustomerPhone && Math.max(0, CustomerPhone)}
          onChange={e => SetCustomerPhone(e.target.value ? Number(e.target.value) : e.target.value)}
          aria-describedby="basic-addon1"
          />
     </InputGroup>
     </Form.Group>
      <Form.Group size="lg" controlId="Account Number">
     <Form.Label>Account Number</Form.Label>
     <Form.Control
          type="number"
          min="0"
          step="1"
          value={Account && Math.max(0, Account)}
          onChange={e => SetAccount(e.target.value ? Number(e.target.value) : e.target.value)}
          aria-describedby="basic-addon1"
          />
        <Button block size="lg" type="submit"onClick={() => (state.button = 1)}>
        Request Customer login logs
        </Button>
        <h1></h1>
        <Button block size="lg" type="submit"onClick={() => (state.button = 2)}>
        Request Customer transactions logs
        </Button>
        </Form.Group>
         <table>
         <tbody>
           {
                Logintimestamp.map((numList,i) =>(
                   <tr key={i}>
                    {
                      numList.map((num,j)=>(
                         <td key={j}>{num}</td>
                      )
                      )
                    }
                   </tr>
                ))
           }
         </tbody>
       </table>
         <table>
         <tbody>
           {
                transactions.map((numList,i) =>(
                   <tr key={i}>
                    {
                      numList.map((num,j)=>(
                         <td key={j}>{num}</td>
                      )
                      )
                    }
                   </tr>
                ))
           }
         </tbody>
       </table>
        </Form>
        );

  }
  else{
      return (
        <label>AH AH LOGIN WITHOUT TOKEN UH</label>
    );
    // push the admin back to the homepage
//    history.push('/');
//    window.location.reload();
  }
}

export default AdminDashboard2;