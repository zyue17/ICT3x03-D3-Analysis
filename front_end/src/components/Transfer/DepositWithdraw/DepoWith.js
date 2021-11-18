import './DepoWith.css';
import useToken from '../../App/useToken';
import useDataToken from '../../App/useDataToken';
import 'bootstrap/dist/css/bootstrap.min.css';
import fernet from 'fernet';
import http from "../../AxiosSettings/http-common";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { NavLink, Link, useHistory, Redirect } from "react-router-dom";

import { React, useState, useEffect } from 'react';

function DepoWith(props) {

  const history = useHistory();
  const { token, setToken } = useToken();
  const { dataToken, setDataToken } = useDataToken();
  const [account1, setAccount1] = useState(0);
  const [account2, setAccount2] = useState(0);
  const [value, setValue] = useState(null);
  const [onetimebtn, setonetimebtn] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [type, setType] = useState("");

  useEffect(async () => {
    if (dataToken && token) {
      var data = JSON.parse(dataToken);

      data = String(data.id);

      http.post('/accountdetails', {
        cID: data
      })
        .then(function (response) {
          if (response.data.message == "Success") {
            var data = JSON.parse(response.data.accounts);
            setAccounts(data);
          }
        })
        .catch(function (error) {
          alert(error);
          //Perform action based on error
        });
    }
  }, []);

  function validateForm() {
    return account1 > 0 && account2 > 0 && value > 0 && account1 != account2;
  }

  function handleSubmit(event) {
    setonetimebtn(true);
    event.preventDefault();
    if (!isNaN(account1) && !isNaN(account2) && !isNaN(value)) {
      if (validateForm()) {
        var data = JSON.stringify([account1, account2, value]);
        if(type == "deposit"){
          http.post('/deposit', {
            transfer: data,
            token: token
          })
          .then(function (response) {
            if (response.data.message == "Success") {
              alert("Transfer Success");
              setonetimebtn(false);
            }
            else if (response.data.message == "Failure") {
              alert("Transfer Failed");
              setonetimebtn(false);
            }
            else if (response.data.message == "Duplicate") {
              alert("Duplicate account number");
              setonetimebtn(false);
            }
          })
          .catch(function (error) {
            alert("Transfer Failed");
            setonetimebtn(false);
          });
        }
        else if(type == "withdraw"){
            http.post('/withdraw', {
              transfer: data,
              token: token
            })
            .then(function (response) {
              if (response.data.message == "Success") {
                alert("Transfer Success");
                setonetimebtn(false);
              }
              else if (response.data.message == "Failure") {
                alert("Transfer Failed");
                setonetimebtn(false);
              }
              else if (response.data.message == "Duplicate") {
                alert("Duplicate account number");
                setonetimebtn(false);
              }
            })
            .catch(function (error) {
              alert("Transfer Failed");
              setonetimebtn(false);
            });
        }
      }
      else {
        alert("Numbers must be more than 0 AND they cannot be the same")
        setonetimebtn(false)
        return false;
      }
    }
    else {
      alert("Please enter ONLY numbers")
      setonetimebtn(false)
      return false;
    }
  }

  if (token) {
    return (
      <div className="DepositWithdraw">
        <select onChange={(e) => setType(e.target.value)}>
        <option>Select Type</option>
        <option value="withdraw">Withdraw</option>
        <option value="deposit">Deposit</option>
        </select>
        {type == "withdraw" ?
        (
        <Form onSubmit={handleSubmit}>
          <Form.Group size="lg" controlId="Account1">
            <Form.Label>From: </Form.Label>
            <Form.Select aria-label="Default select example" value={account1} onChange={(e) => setAccount1(e.target.value)}>
              <option>Select Account</option>
              {accounts && accounts.map(acc =>
                <option value={acc["AccountID"]}>{acc["AccountID"]}</option>
              )}
            </Form.Select>
          </Form.Group>
          <Form.Group size="lg" controlId="Account2">
            <Form.Label>To: </Form.Label>
            <Form.Control
              type="number"
              value={account2}
              onChange={(e) => setAccount2(e.target.value)}

            />
          </Form.Group>
          <Form.Group size="lg" controlId="TransferValue">
            <Form.Label>Value: </Form.Label>
            <Form.Control
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}

            />
          </Form.Group>
          <br />
          <Button block size="lg" type="submit" disabled={onetimebtn}>
            transfer
          </Button>
        </Form>
        )
        :
        (
        <Form onSubmit={handleSubmit}>
          <Form.Group size="lg" controlId="Account1">
            <Form.Label>From: </Form.Label>
            <Form.Control
              type="number"
              value={account1}
              onChange={(e) => setAccount1(e.target.value)}

            />
          </Form.Group>
          <Form.Group size="lg" controlId="Account2">
            <Form.Label>To: </Form.Label>
            <Form.Select aria-label="Default select example" value={account2} onChange={(e) => setAccount2(e.target.value)}>
              <option>Select Account</option>
              {accounts && accounts.map(acc =>
                <option value={acc["AccountID"]}>{acc["AccountID"]}</option>
              )}
            </Form.Select>
          </Form.Group>    
          <Form.Group size="lg" controlId="TransferValue">
            <Form.Label>Value: </Form.Label>
            <Form.Control
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}

            />
          </Form.Group>
          <br />
          <Button block size="lg" type="submit" disabled={onetimebtn}>
            transfer
          </Button>
        </Form>
        )
        }
      </div>
    );
  }
  else {
    history.push('/');
    window.location.reload();
  }
}

export default DepoWith;
