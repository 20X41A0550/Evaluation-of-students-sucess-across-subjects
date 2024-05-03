import React, { Component } from "react";
import axios from "axios";
import "./reset.css";

export default class Reset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const { email } = this.state;
    console.log(email);
    axios
      .post("http://localhost:5000/forgot-password", {
        email,
      })
      .then((res) => {
        console.log(res.data, "userRegister");
        alert(res.data.status);
        alert("Email sent. Please check your inbox.");
        window.location.reload();
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        // Handle error here
      });
  }

  render() {
    return (
      <form className="form-container" onSubmit={this.handleSubmit}>
        <h3 className="form-title">Forgot Password</h3>
        <div className="form-group">
          <label className="form-label">Email address</label>
          <input
            type="email"
            className="form-input"
            placeholder="Enter email"
            value={this.state.email}
            onChange={(e) => this.setState({ email: e.target.value })}
          />
        </div>

        <div className="d-grid">
          <button type="submit" className="form-button">
            Submit
          </button>
        </div>
        <p className="text-link">
          <h6>Don't have an account?
            <a href="/sign-up"> Sign Up</a></h6>
        </p>
        <p className="text-link ">
          <h6>Want to <a href="/sign-in">  Sign In?</a></h6>
        </p>
      </form>
    );
  }
}
