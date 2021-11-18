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

function AdminDashboard(props) {
  const history = useHistory();
  const { admintoken, setadminToken } = useAdminToken();
  const { dataToken, setDataToken } = useDataToken();
  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState("");
  const [priority, setpriority] = useState("");
  const [CustomerName, SetCustomerName] = useState("");
  const [CustomerPhone, SetCustomerPhone] = useState("");
  const [Logintimestamp, SetLogintimestamp] = useState([]);
  useEffect(async() => {
    if (dataToken && admintoken) {
      var data = JSON.parse(dataToken);
      var data2 = JSON.parse(dataToken);
      data = String(data.id);
      data2 = String(data2.priority);
      if(data2 != "1"){
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
       if(CustomerName.length !=0){
      http.post('/Admin_RequestCustomerLoginLogs', {
        CustomerName: CustomerName,
        CustomerPhone : CustomerPhone,
        Adminname : name
                    })
        .then(function(response){
            if (response.data.message =="Success") {
            alert("Success");
            SetLogintimestamp(Logintimestamp =>[...Logintimestamp,response.data.Logintimestamp]);
            alert("Done");
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
        <Button block size="lg" type="submit"onClick={handleSubmit}>
        Request Customer login logs
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

export default AdminDashboard;