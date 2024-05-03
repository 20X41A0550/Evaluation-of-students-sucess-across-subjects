import React, { useState } from "react";
import "./SignUp.css";

export default function SignUp() {
  const [id, setId] = useState("");
  const [Htno, setHtno] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [designation, setDesignation] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mobile.length!== 10) {
      alert("Mobile number should be 10 digits");
      return;
    }

    if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password)) {
      alert("Password should be at least 8 characters long and contain at least one numeric digit, one uppercase and one lowercase letter, and one special character.");
      return;
    }

    if (userType === "Admin" && secretKey!== "sumanth") {
      alert("Invalid Admin");
      return;
    }
    if (userType ==="Faculty" && secretKey!=="faculty"){
      alert("Invalid Faculty");
      return;
    }
    if ((userType === "Admin" || userType === "Faculty") && id.length > 6) {
      alert("Faculty ID should not exceed 6 characters");
      return;
    }

    const formData = {
      id,
      Htno,
      fname,
      lname,
      email,
      mobile,
      password,
      userType,
      designation: userType === "Admin" || userType === "Faculty"? designation : null,
      secretKey: userType === "Admin"? secretKey : userType ==="Faculty",
    };

    fetch("http://localhost:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(formData),
    })
     .then((res) => res.json())
     .then((data) => {
        console.log(data, "userRegister");
        if (data.status === "ok") {
          alert("Registration Successful");
          window.location.href = "/sign-in";
        } else {
          alert("Something went wrong");
        }
      })
     .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
      });
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-inner">
        <form onSubmit={handleSubmit}>
          <h3>Sign Up</h3>
          <div className="user-type">
            <label>
              <input
                type="radio"
                name="userType"
                value="Student"
                onChange={(e) => {
                  setUserType(e.target.value);
                  setShowSecretKey(false);
                  setId("");
                }}
              />
              Student
            </label>
            <label>
              <input
                type="radio"
                name="userType"
                value="Admin"
                onChange={(e) => {
                  setUserType(e.target.value);
                  setShowSecretKey(true);
                  setId("");
                }}
              />
              Admin
            </label>
            <label>
              <input
                type="radio"
                name="userType"
                value="Faculty"
                onChange={(e) => {
                  setUserType(e.target.value);
                  setShowSecretKey(true);
                  setId("");
                }}
              />
              Faculty
            </label>
          </div>
          {showSecretKey && (
            <div className="mb-3">
              <label>Secret Key</label>
              <input
                type="password"
                className="form-control"
                placeholder="Secret Key"
                onChange={(e) => setSecretKey(e.target.value)}
              />
            </div>
          )}
          {userType === "Student" && (
            <div className="mb-3">
              <label>Htno</label>
              <input
                type="text"
                className="form-control"
                placeholder="Htno"
                value={Htno}
                onChange={(e) => setHtno(e.target.value)}
              />
            </div>
          )}
          {(userType === "Admin" || userType === "Faculty") && (
            <div className="mb-3">
              <label>ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </div>
          )}
          <div className="mb-3">
            <label>First name</label>
            <input
              type="text"
              className="form-control"
              placeholder="First name"
              onChange={(e) => setFname(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Last name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Last name"
              onChange={(e) => setLname(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Mobile Number</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter mobile number"
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {(userType === "Admin" || userType === "Faculty") && (
            <div className="mb-3">
              <label>Designation</label>
              <input
                type="text"
                className="form-control"
                placeholder="Designation"
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-block">
            Sign Up
          </button>
        </form>
        <a href="/sign-in">Sign in</a>
      </div>
    </div>
  );
}