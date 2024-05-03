const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cors = require("cors");
const JWT_SECRET = "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";
const JWT_EXPIRES_IN = "1h"; // Set the expiration time to 1 hour

app.use(cors());
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
mongoose.connect("mongodb://localhost:27017/studentdata", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

const userSchema = new mongoose.Schema({
  id: String,
  Htno: String,
  fname: String,
  lname: String,
  email: String,
  mobile: String,
  password: String,
  userType: String,
  designation: String
});

const User = mongoose.model("User", userSchema);

// Define Admin model



app.post("/register", async (req, res) => {
  const { id, Htno, fname, lname, email, mobile, password, userType, designation, secretKey } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ status: "error", error: "User Already Exists" });
    }

    if (userType === "Admin" && secretKey !== "sumanth") {
      return res.json({ status: "error", error: "Invalid Secret Key" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      id,
      Htno,
      fname,
      lname,
      email,
      mobile,
      password: encryptedPassword,
      userType,
      designation: userType === "Admin" || userType === "Faculty" ? designation : null,
    });

    await newUser.save();
    res.json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.json({ status: "error", error: "An error occurred. Please try again later." });
  }
});

app.post("/login", async (req, res) => {
  const { id, password, userType } = req.body;

  let user;
  if (userType === "Student") {
    user = await User.findOne({ Htno: id });
  } else if (userType === "Admin") {
    user = await User.findOne({ id, userType: "Admin" });
  } else if (userType === "Faculty") {
    user = await User.findOne({ id, userType: "Faculty" });
  } else {
    return res.json({ error: "Invalid User Type" });
  }

  if (!user) {
    return res.json({ error: "User Not Found" });
  }

  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ status: "ok", token, Htno: user.Htno }); // Include Htno in the response
  }

  return res.json({ error: "Invalid Password" });
});

app.post("/userData", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET, (err, res) => {
      if (err) {
        return "token expired";
      }
      return res;
    });
    console.log(user);
    if (user == "token expired") {
      return res.send({ status: "error", data: "token expired" });
    }
  
    User.findOne({ Htno: userHtno })
      .then((data) => {
        res.send({ status: "ok", data: data });
      })
      .catch((error) => {
        res.send({ status: "error", data: error });
      });
  } catch (error) {}
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await User.findOne({ email });
    if (!oldUser) {
      return res.json({ status: "User Not Exists!!" });
    }
    const secret = JWT_SECRET + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "5m",
    });
    const link = `http://localhost:5000/reset-password/${oldUser._id}/${token}`;
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "srkitcse2020@gmail.com",
        pass: "qhoj kbsc wvkn ozso",
      },
    });

    var mailOptions = {
      from: "srkitcse2020@gmail.com",
      to: email,
      subject: "Password Reset",
      text: link,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    console.log(link);
  } catch (error) {}
});

app.get("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  console.log(req.params);
  const oldUser = await User.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = JWT_SECRET + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    res.render("index", { email: verify.email, status: "Not Verified" });
  } catch (error) {
    console.log(error);
    res.send("Not Verified");
  }
});

app.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const oldUser = await User.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = JWT_SECRET + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: encryptedPassword,
        },
      }
    );

    res.render("index", { email: verify.email, status: "verified" });
  } catch (error) {
    console.log(error);
    res.json({ status: "Something Went Wrong" });
  }
});

app.post("/userData", async (req, res) => {
  const { Htno } = req.body;
  try {
    const userPromise = User.findOne({ Htno: Htno });
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Timeout occurred while fetching user data"));
      }, 15000);
    });

    const user = await Promise.race([userPromise, timeoutPromise]);
    res.send({ status: "ok", data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "An error occurred while fetching user data" });
  }
});

app.get("/getAllUser", async (req, res) => {
  let query = {};
  const searchData = req.query.search;
  if (searchData) {
    query = {
      $or: [
        { fname: { $regex: searchData, $options: "i" } },
        { email: { $regex: searchData, $options: "i" } },
      ],
    };
  }

  try {
    const allUser = await User.find(query);
    res.send({ status: "ok", data: allUser });
  } catch (error) {
    console.log(error);
  }
});

app.post("/deleteUser", async (req, res) => {
  const { userid } = req.body;
  try {
    User.deleteOne({ _id: userid }, function (err) {
      console.log(err);
    });
    res.send({ status: "Ok", data: "Deleted" });
  } catch (error) {
    console.log(error);
  }
});

app.post("/createUser", (req, res) => {
  const { fname, lname, email, mobile, password, userType, id } = req.body;
  const newUser = new User({
    fname,
    lname,
    email,
    mobile,
    password,
    userType,
    id,
  });
  newUser.save().then(() => res.json({ message: "User created successfully", data: newUser }));
});

// Update User Endpoint
app.put("/updateUser/:id", (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body;
  User.findByIdAndUpdate(id, updatedUser).then(() =>
    res.json({ data: "User updated successfully" })
  );
});






app.listen(5000, () => {
  console.log("Server Started");
});
