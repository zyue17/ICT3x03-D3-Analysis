import './Transfer.css';
import useToken from '../App/useToken';
import useDataToken from '../App/useDataToken';
import 'bootstrap/dist/css/bootstrap.min.css';

import fernet from 'fernet';
import http from "../AxiosSettings/http-common";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { NavLink, Link, useHistory, Redirect } from "react-router-dom";

import { React, useState, useEffect } from 'react';

function Transfer(props) {

  const history = useHistory();
  const { token, setToken } = useToken();
  const { dataToken, setDataToken } = useDataToken();
  const [account1, setAccount1] = useState(0);
  const [account2, setAccount2] = useState(0);
  const [value, setValue] = useState(null);
  const [onetimebtn, setonetimebtn] = useState(false);
  const [accounts, setAccounts] = useState([]);



  useEffect(async () => {
    if (dataToken && token) {
      var data = JSON.parse(dataToken);
      data = String(data.id);

      http.post('/accountdetails', {
        cID: data,
        token: token
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
        http.post('/transfer', {
          transfer: data,
          token: token
        })
          .then(function (response) {
              alert(response.data.message);
              setonetimebtn(false);
          })
          .catch(function (error) {
            alert("Transfer Failed");
            setonetimebtn(false);
          });
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
      <div className="Transfer">
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
      </div>
    );
  }
  else {
    history.push('/');
    window.location.reload();
  }
}

export default Transfer;
