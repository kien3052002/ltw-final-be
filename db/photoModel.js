const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    _id: String,
    comment: String,
    date_time: Date,
    user_id: String,
  },
  { _id: false }
);

const photoSchema = new mongoose.Schema(
  {
    _id: String,
    user_id: String,
    date_time: Date,
    file_name: String,
    comments: [commentSchema],
    base64: String,
  },
  { collection: "Photo" }
);

module.exports = mongoose.model("Photo", photoSchema);
