// routes/results.js

const router = require("express").Router();
let Results = require("../models/result.model");

router.route("/").get((req, res) => {
  const searchQuery = req.query.search || "";
  Results.find({ username: { $regex: searchQuery, $options: "i" } })
    .then((results) => res.json(results))
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
