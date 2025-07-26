const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/User")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Connection error:", err));

const UserSchema = new mongoose.Schema({
  userType: { type: String, required: true, enum: ["individual", "business"] },
  name: { type: String, required: true },
  businessName: { type: String },
  businessAddress: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
