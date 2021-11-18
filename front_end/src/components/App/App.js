import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from "../Navbar/Navigationbar";
import Login from "../Login/Login";
import Forgotpassword from "../Login/Forgotpassword";
import Forgotusername from "../Login/Forgotusername";
import Footer from "../Footer/Footer";
import Dashboard from "../Dashboard/Dashboard"; 
import Transfer from "../Transfer/Transfer";
import DepoWith from "../Transfer/DepositWithdraw/DepoWith";
import Profile from "../Profile/Profile";
import TwoFA from "../2FA/2FAAuthentication";
import Register from "../Register/Register"
import AdminDashboard from "../Admin/AdminDashboard"
import AdminDashboard2 from "../Admin/AdminDashboard2"
import AdminDashboard3 from "../Admin/AdminDashboard3"
import {React, useState} from 'react';
import useToken from './useToken';
import useDataToken from './useDataToken';
import useAdminToken from './useAdminToken';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

function App() {
const { token, setToken } = useToken();
const { dataToken, setDataToken } = useDataToken();
const [loginstatus, setloginstatus] = useState();
const { admintoken, setadminToken } = useAdminToken();
let sessiontext;
if (sessionStorage.getItem('token')!=null){
sessiontext = <p>WELCOME {token}</p>;
}
let sessiondatatext;
if (sessionStorage.getItem('dataToken')!=null){
sessiondatatext = <p>WELCOME {dataToken}</p>;
}
if (sessionStorage.getItem('admintoken')!=null){
sessiondatatext = <p>WELCOME {admintoken}</p>;
}

  return (
    <div className="App">
      <Navbar tokenstatus={token} setToken={setToken} admintokenstatus={admintoken} setadminToken={setadminToken}/>
      <Router>
        <div>
          <Switch>
            <Route path="/dash">
              <Dashboard/>
            </Route>
            <Route path="/transfer">
              <Transfer/>
            </Route>
            <Route path="/depositwithdraw">
              <DepoWith/>
            </Route>
            <Route path="/login">
              <Login score="111111" hello="asd"/>
            </Route>
             <Route path="/TwoFA">
              <TwoFA setToken={setToken} setDataToken={setDataToken} setadminToken={setadminToken}/>
            </Route>
             <Route path = "/Forgotpassword">
            <Forgotpassword/>
            </Route>
            <Route path = "/Forgotusername">
            <Forgotusername/>
            </Route>
            <Route path = "/Register">
            <Register/>
            </Route>
            <Route path = "/AdminDashboard">
            <AdminDashboard/>
            </Route>
            <Route path = "/AdminDashboard2">
            <AdminDashboard2/>
            </Route>
            <Route path = "/AdminDashboard3">
            <AdminDashboard3/>
            </Route>
            <Route path="/profile">
              <Profile/>
            </Route>
            <Route path="/">
              <h1>Home Page</h1>
              {(sessiondatatext && sessiontext) &&<h1>You have logged in!</h1>}
            </Route>
          </Switch>
        </div>
      </Router>
      <Footer/>
    </div>
  );
}

export default App;
