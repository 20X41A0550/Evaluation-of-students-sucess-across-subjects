import React, { useState } from "react";
import UserHome from "./userHome"; // Import the UserHome component
import AdminHome from "./adminHome"; // Import the AdminHome component
import FacultyHome from "./facultyHome"; // Import the FacultyHome component

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [Htno, setHtno] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        id,
        password,
        userType,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch");
        }
        return res.json();
      })
      .then((data) => {
        console.log(data); // Log the response data
        if (data.status === "ok") {
          alert("Login successful");
          window.localStorage.setItem("token", data.token);
          window.localStorage.setItem("loggedIn", true);
          window.localStorage.setItem("Htno", data.Htno); // Store the HTNO in localStorage
          setHtno(data.Htno); // Set the HTNO in state
          setIsLoggedIn(true);
        } else {
          throw new Error("Login failed");
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        alert("Failed to login. Please try again.");
      });
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-inner">
        {isLoggedIn ? (
          userType === "Student" ? (
            <UserHome Htno={Htno} /> // Pass HTNO as a prop
          ) : userType === "Admin" ? (
            <AdminHome id={id} />
          ) : (
            <FacultyHome id={id} />
          )
        ) : (
          <form onSubmit={handleSubmit}>
            <h3>Sign In</h3>
            <div className="mb-3">
              <select
                className="form-select"
                onChange={(e) => setUserType(e.target.value)}
              >
                <option value="">Select User Type</option>
                <option value="Student">Student</option>
                <option value="Admin">Admin</option>
                <option value="Faculty">Faculty</option>
              </select>
            </div>

            <div className="mb-3">
              <label>{userType === "Student" ? "Htno" : userType === "Admin" ? "Admin ID" : "Faculty ID"}</label>
              <input
                type="text"
                className="form-control"
                placeholder={userType === "Student" ? "Enter HTNO" : userType === "Admin" ? "Enter Admin ID" : "Enter Faculty ID"}
                onChange={(e) => setId(e.target.value)}
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

            <div className="d-grid">
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
            <p className="forgot-password text-right">
              <a href="/reset">Forgot Password?</a>
            </p>

            <a href="/sign-up">Sign Up</a>
          </form>
        )}
      </div>
    </div>
  );
}