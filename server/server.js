// app.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 6001;

mongoose.connect('mongodb://localhost:27017/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

const dataSchema = new mongoose.Schema({
  Htno: String,
  Subname: String,
  internal: Number,
  Grade: String,
  Credits: Number
});

const Data = mongoose.model('Data', dataSchema);

app.use(express.json());
app.use(cors());

app.get("/getResultsByHtnoAndSemester", async (req, res) => {
  const { semester, Htno } = req.query;
  const collectionName = `${semester}-collection`;

  try {
    const collection = mongoose.connection.db.collection(collectionName);
    const results = await collection.find({ Htno }).toArray();
    res.json(results);
  } catch (err) {
    console.error("Error fetching data by username and semester:", err);
    res.status(500).json({ error: "Failed to fetch data by username and semester" });
  }
});

app.get("/getResultsByHtnoOverall", async (req, res) => {
  const { Htno } = req.query;

  try {
    const collections = ["1-1-collection", "1-2-collection", "2-1-collection", "2-2-collection", "3-1-collection", "3-2-collection", "4-1-collection", "4-2-collection"];
    const result = [];

    for (const collectionName of collections) {
      const collection = mongoose.connection.db.collection(collectionName);
      const subject = await collection.find({ Htno }).toArray();
      result.push(...subject);
    }

    res.json(result);
  } catch (error) {
    console.error("Failed to fetch overall data by username:", error);
    res.status(500).json({ message: "Failed to fetch overall data" });
  }
});

app.get("/getResultsByUsernameAndSemester", async (req, res) => {
  const { semester, username } = req.query;
  const collectionName = `${semester}-collection`;

  try {
    const collectionExists = await mongoose.connection.db.listCollections({ name: collectionName }).next();
    if (!collectionExists) {
      return res.status(404).json({ error: "Data not found for the selected semester" });
    }

    const studentData = await mongoose.connection.db.collection(collectionName).findOne({ Htno: username });
    if (!studentData) {
      return res.status(404).json({ error: "Student not found for the selected semester and Htno" });
    }

    res.json({ ...studentData, semester }); // Adding semester to the response for calculations
  } catch (err) {
    console.error("Error fetching student data:", err);
    res.status(500).json({ error: "Failed to fetch student data" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
