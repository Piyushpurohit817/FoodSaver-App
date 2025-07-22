const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/User")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Connection error:", err));

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});
