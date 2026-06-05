const path = require("path");
const mongoose = require("mongoose");
const User = require("./userModel");
const Photo = require("./photoModel");
const SchemaInfo = require("./schemaInfo");
const { users, photos } = require("./sampleData");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const DB_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/photo-share";

async function load() {
  await mongoose.connect(DB_URL);
  await Promise.all([User.deleteMany({}), Photo.deleteMany({}), SchemaInfo.deleteMany({})]);
  await User.insertMany(users);
  await Photo.insertMany(photos);
  await SchemaInfo.create({
    _id: "1",
    __v: 1,
    load_date_time: new Date().toISOString(),
  });
  await mongoose.disconnect();
  console.log("Database loaded.");
}

load().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
