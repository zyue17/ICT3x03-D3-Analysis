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

function AdminDashboard3(props) {
  const history = useHistory();
  const { admintoken, setadminToken } = useAdminToken();
  const { dataToken, setDataToken } = useDataToken();
  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState("");
  //const [priority, setpriority] = useState("");
  const [CustomerName, SetCustomerName] = useState("");
  const [CustomerPhone, SetCustomerPhone] = useState("");
  const [Logintimestamp, SetLogintimestamp] = useState([]);
  //const [Adminname, SetAdminname] = useState("");
  const [AdminID, SetAdminID] = useState("");
  const [SearchedAdminID, SetSearchedAdminIDAdminID] = useState("");
  const [Transactions,SetTransactions] = useState([]);

  useEffect(async() => {
    if (dataToken && admintoken) {
      var data = JSON.parse(dataToken);
      var data2 = JSON.parse(dataToken);
      data = String(data.id);
      data2 = String(data2.priority);
      if(data2 != "3"){
      alert("Not allowed");
      history.push('/');
      }
      http.post('/AdminDashboard', {
        aID: data,
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
       if(AdminID.length !=0 && AdminID != 'e'){
      var data = JSON.parse(dataToken);
       data = String(data.id);
      http.post('/Admin_RequestAdminLogs', {
        AdminID : AdminID,
        aID: data
                    })
        .then(function(response){
            if (response.data.message =="Success") {
            SetTransactions(Transactions =>[...Transactions,response.data.Transactions])
            alert("Done");
            SetSearchedAdminIDAdminID(AdminID)

            }
            else {
            alert("No transactions found");
            }
       //Perform action based on response
        })
        .catch(function(error){
          alert(error);
       //Perform action based on error
        });
   }else{
  alert("Please type in a number");
   }
    }


 if (admintoken){
        return(
        <Form onSubmit={handleSubmit}>
      <Form.Group size="lg" controlId="Admin name">
     <Form.Label>Admin ID</Form.Label>
     <Form.Control
          type="number"
          min="0"
          step="1"
          value={AdminID && Math.max(0, AdminID)}
          onChange={e => SetAdminID(e.target.value ? Number(e.target.value) : e.target.value)}
          aria-describedby="basic-addon1"
          />
        <Button block size="lg" type="submit"onClick={handleSubmit}>
        Request Admin logs
        </Button>
       </Form.Group>
                <table>
         <tbody>
           {
                Transactions.map((numList,i) =>(
                   <tr key={i}>
                   <td><label>{SearchedAdminID}</label></td>
                    {
                      numList.map((num,j)=>(
                         <tr key={j}>{num}</tr>
                      )
                      )

                    }

                   </tr>
                ))
           }
         </tbody>
       </table>
        </Form>

//       <select Adminname={"Orange"}
//         onChange={SetAdminname}
//         >
//    <option value="Orange">Orange</option>
//    <option value="Radish">Radish</option>
//    <option value="Cherry">Cherry</option>
//  </select>
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

export default AdminDashboard3;