import './Dashboard.css';
import useToken from '../App/useToken';
import useDataToken from '../App/useDataToken';
import 'bootstrap/dist/css/bootstrap.min.css';
import fernet from 'fernet';
import http from "../AxiosSettings/http-common";
import { Button, Row, Col, Card } from "react-bootstrap";
import { React, useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
//import DashboardCard from "./DashboardCard/DashboardCard";
import PropTypes from 'prop-types';


function Dashboard(props) {
  const history = useHistory();
  const { token, setToken } = useToken();
  const { dataToken, setDataToken } = useDataToken();
  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState("");
  const [transactions, setTransactions] = useState("");
  const [currentAccount, setCurrentAccount] = useState(null);
  // const [transactionID, setTransactionID] = useState("");
  // const [debit, setDebit] = useState("");
  // const [credit, setCredit] = useState("");
  // const [timestamp, setTimestamp] = useState("");
  // const [sender, setSender] = useState("");
  // const [recipient, setRecipient] = useState("");

  useEffect(async () => {
    if (dataToken && token) {
      var data = JSON.parse(dataToken);
      data = String(data.id);
      http.post('/accountdetails', {
        token: token
      })
        .then(function (response) {
          if (response.data.message == "Success") {
            var data = JSON.parse(response.data.name);
            setName(data);
            data = JSON.parse(response.data.accounts);
            setAccounts(data);
          }
          else {
            alert("failed to retrieve account details");
          }
        })
        .catch(function (error) {
          alert(error);
          //Perform action based on error
        });

      http.post('/transaction_history', {
        token: token
      })
        .then(function (response) {
          if (response.data.message == "Success") {
            var transaction_details = JSON.parse(response.data.transaction_details);
            setTransactions(transaction_details);
          }
          else if (response.data.message == "No Transactions") {
            alert("No Transactions");
          }
          else {
            alert("failed to retrieve transaction details");
          }
        })
        .catch(function (error) {
          alert(error);
          //Perform action based on error
        });


    }
  }, []);

  function RouteChange() {
    history.push('/depositwithdraw');
    window.location.reload();
  }

  function AddAccount() {
      http.post('/add_account', {
        token: token
      })
      .then(function (response) {
        if (response.data.message == "Success") {
          alert("successfully added account");
          window.location.reload();
        }
        else {
          alert(response.data.message);
        }
      })
      .catch(function (error) {
        alert(error);
        //Perform action based on error
      });
  }

  const displayTransaction = (input) => {
    setCurrentAccount(String(input));
  };


  const Accounts = (props) => {
    const accs = props.acc;
    if (accs) {
      return (
        <div>
          {accs.map(ac =>
            <Button style={{ width: '18rem', margin: "10px", borderRadius: "180px" }} key={ac["AccountID"]} onClick={()=>{displayTransaction(ac["AccountID"])}}>
              <Card.Body>
                <Card.Title>{String("Account Number: " + ac["AccountID"])}</Card.Title>
                <Card.Text>
                  Your Balance is:
                </Card.Text>
                <Card.Text style={{ color: "cyan", fontSize: "40px" }}>
                  {String(ac["Balance"] + "SGD")}
                </Card.Text>
              </Card.Body>
            </Button>
          )}
        </div>
      );
    }
  };

  const Transact = () => {
      if(currentAccount == null){
        return(
          <div>
          <h2>Please Select Account To View Transaction History</h2>
          </div>
        )
      }
      else{
        if (Object.keys(transactions).length > 0) {
          const current = transactions[currentAccount];
          if(current != undefined){
            return (
              <div>
                <h2>Transaction History</h2>
                {current.map(tran =>
                  <Card.Body key={tran["tID"]} style={{ width: '180rem', margin: "10px", borderRadius: "180px" }}>
                    <Card.Title>{String("From account: " + tran["sender"])}</Card.Title>
                    <Card.Title>{String("To account: " + tran["recipient"])}</Card.Title>
                    <Card.Text>
                      Payment Amount: 
                    </Card.Text>
                    <Card.Text style={{ color: "cyan", fontSize: "40px" }}>
                      {String(tran["credit"] + " SGD")}
                    </Card.Text>
                  </Card.Body>
                )}
              </div>
            )
          }
          else{
            return (
              <div>
                <h2>No transactions Made</h2>
              </div>
            )
          }
        }
        else{
          return (
            <div>
              <h2>Cannot Retrieve Transactions</h2>
            </div>
          )
        }
      }
  };

  if (token) {
    return (
      <div className="Dashboard">
        <Col>
          <Row className="g-8">
            <Col sm={2}><Button onClick={() => AddAccount()}>Add Account</Button></Col>
            <Col sm={8}></Col>
            <Col sm={2}><Button onClick={RouteChange}>Deposit / Withdraw</Button></Col>
          </Row>
          {name && <Row xs={1} md={1} className="g-4"><h1>Welcome Back {name}!</h1></Row>}
          <br />
          {accounts.length > 0 && <Accounts acc={accounts} />}
          <br />
          <Transact/>
        </Col>
      </div>
    );
  }
  else {
    history.push('/');
    window.location.reload();
  }
}

export default Dashboard;

/* This is how to encrypt as PBKDF2HMAC
var secret = new fernet.Secret(token);
      var tokenss = new fernet.Token({
        secret: secret,
        token: dataToken,
        ttl: 0
        })
      var data = JSON.parse(tokenss.decode());

      tokenss = new fernet.Token({
        secret: secret
        })
      data = tokenss.encode(String(data.id));
      http.post('/accountdetails', {
        cID: data,
        token: token
                    })
        .then(function(response){
            if (response.data.message =="Success") {
              secret = new fernet.Secret(token);

              tokenss = new fernet.Token({
                secret: secret,
                token: response.data.name,
                ttl: 0
                })
              var data = JSON.parse(tokenss.decode());
              setName(data);

              tokenss = new fernet.Token({
                secret: secret,
                token: response.data.accounts,
                ttl: 0
                })
              var data = JSON.parse(tokenss.decode());
              setAccounts(data);
            }
            else{
              alert("failed to retrieve account details");
            }
        })
        .catch(function(error){
            console.log(error);
       //Perform action based on error
        });
*/
