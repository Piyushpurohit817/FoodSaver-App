const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/Donor")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Connection error:", err));
