const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 6002;

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

app.get("/getResultsBySemester", async (req, res) => {
  const { semester } = req.query;
  const collectionName = `${semester}-collection`;

  try {
    const collectionExists = await mongoose.connection.db.listCollections({ name: collectionName }).next();
    console.log("Collection Exists:", collectionExists);

    if (!collectionExists) {
      return res.status(404).json({ error: "Data not found for the selected semester" });
    }

    const studentData = await mongoose.connection.db.collection(collectionName)
      .find({})
      .toArray();

    console.log("Fetched Data:", studentData);

    if (!studentData || studentData.length === 0) {
      return res.status(404).json({ error: "No data found for the selected semester" });
    }

    res.json(studentData);
  } catch (err) {
    console.error("Error fetching student data:", err);
    res.status(500).json({ error: "Failed to fetch student data" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
