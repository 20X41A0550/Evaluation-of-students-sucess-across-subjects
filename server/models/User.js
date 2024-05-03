const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: String,
  fname: String,
  lname: String,
  email: String,
  mobile: String,
  password: String,
  userType: String,
  designation: String
});

const User = mongoose.model("User", userSchema);

module.exports = User;
