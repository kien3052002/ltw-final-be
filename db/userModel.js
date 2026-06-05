const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    _id: String,
    first_name: String,
    last_name: String,
    location: String,
    description: String,
    occupation: String,
    login_name: { type: String, unique: true, required: true },
    password: { type: String, required: true },
  },
  { collection: "User" }
);

module.exports = mongoose.model("User", userSchema);
