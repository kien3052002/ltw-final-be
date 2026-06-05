const mongoose = require("mongoose");

const schemaInfo = new mongoose.Schema(
  {
    _id: String,
    __v: Number,
    load_date_time: String,
  },
  { collection: "SchemaInfo" }
);

module.exports = mongoose.model("SchemaInfo", schemaInfo);
