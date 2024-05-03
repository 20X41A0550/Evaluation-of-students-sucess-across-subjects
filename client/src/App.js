import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from "./components/login_component";
import SignUp from "./components/signup_component";
import UserDetails from "./components/userDetails";
import Reset from "./components/reset"; 
import UserHome from "./components/userHome";
import AdminHome from "./components/adminHome";
import FacultyHome from "./components/facultyHome";


function App() {
  const isLoggedIn = window.localStorage.getItem("loggedIn");
  
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            exact
            path="/"
            element={isLoggedIn === "true" ? <UserDetails /> : <Login />}
          />
          <Route path="/sign-in" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/userDetails" element={<UserDetails />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/home" element={<UserHome />} />
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/faculty/*" element={<FacultyHome />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
