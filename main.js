const path = require("path");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const User = require("./db/userModel");
const Photo = require("./db/photoModel");
const SchemaInfo = require("./db/schemaInfo");

const app = express();
const PORT = process.env.PORT;
const DB_URL = process.env.MONGO_URL;

const FE_URL = "".replace(/\/$/, "");

const isApiRoute = (reqPath) =>
  ["/admin", "/user", "/photos", "/comments", "/test", "/images"].some(
    (prefix) => reqPath.startsWith(prefix)
  );

mongoose.connect(DB_URL).then(() => console.log("Mongo connected."));
app.set("trust proxy", 1);
app.use(express.json());

app.use(
  cors({
    origin: FE_URL,
    credentials: true,
  })
);

app.use(
  session({
    secret: "photo-share-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // CodeSandbox uses HTTPS
      sameSite: "none", // Required for frontend/backend on different domains
      httpOnly: true,
    },
  })
);

app.use("/images", express.static(path.join(__dirname, "images")));

const upload = multer({ dest: path.join(__dirname, "images") });

const requireLogin = (req, res, next) => {
  if (!req.session.user) return res.status(401).send("Unauthorized");
  return next();
};

app.get("/admin/current", (req, res) => {
  if (!req.session.user) return res.status(401).send("No user logged in.");
  return res.json(req.session.user);
});

app.post("/admin/login", async (req, res) => {
  const { login_name, password } = req.body;
  const user = await User.findOne({ login_name }).lean();
  if (!user || user.password !== password) {
    return res.status(400).send("Invalid login_name or password.");
  }
  req.session.user = {
    _id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
    login_name: user.login_name,
  };
  return res.json(req.session.user);
});

app.post("/admin/logout", (req, res) => {
  if (!req.session.user) return res.status(400).send("No user logged in.");
  req.session.destroy(() => res.json({ message: "Logged out" }));
});

app.post("/user", async (req, res) => {
  const {
    login_name,
    password,
    first_name,
    last_name,
    location = "",
    description = "",
    occupation = "",
  } = req.body;

  if (
    !login_name?.trim() ||
    !password?.trim() ||
    !first_name?.trim() ||
    !last_name?.trim()
  ) {
    return res
      .status(400)
      .send("login_name, password, first_name, and last_name are required.");
  }

  const existing = await User.findOne({ login_name }).lean();
  if (existing) return res.status(400).send("login_name already exists.");

  const _id = String(Date.now());
  const created = await User.create({
    _id,
    login_name,
    password,
    first_name,
    last_name,
    location,
    description,
    occupation,
  });

  return res.json({
    _id: created._id,
    login_name: created.login_name,
    first_name: created.first_name,
    last_name: created.last_name,
  });
});

app.use((req, res, next) => {
  if (!isApiRoute(req.path)) return next();
  if (
    req.path === "/admin/login" ||
    req.path === "/admin/logout" ||
    req.path === "/user"
  ) {
    return next();
  }
  return requireLogin(req, res, next);
});

app.get("/test/info", async (req, res) => {
  const info = await SchemaInfo.findOne({}).lean();
  res.json(info);
});

app.get("/user/list", async (req, res) => {
  const users = await User.find({}, "_id first_name last_name").lean();
  res.json(users);
});

app.get("/user/:id", async (req, res) => {
  const user = await User.findById(
    req.params.id,
    "_id first_name last_name location description occupation"
  ).lean();
  if (!user) return res.status(400).send("Invalid user id.");
  return res.json(user);
});

app.get("/photosOfUser/:id", async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) return res.status(400).send("Invalid user id.");

  const photos = await Photo.find({ user_id: req.params.id }).lean();
  const commenterIds = [
    ...new Set(
      photos.flatMap((p) => p.comments.map((c) => c.user_id)).filter(Boolean)
    ),
  ];
  const commenters = await User.find(
    { _id: { $in: commenterIds } },
    "_id first_name last_name"
  ).lean();
  const userMap = commenters.reduce((acc, u) => ({ ...acc, [u._id]: u }), {});

  const payload = photos.map((photo) => ({
    _id: photo._id,
    user_id: photo.user_id,
    file_name: photo.file_name,
    date_time: photo.date_time,
    base64: photo.base64,
    comments: (photo.comments || []).map((comment) => ({
      _id: comment._id,
      comment: comment.comment,
      date_time: comment.date_time,
      user: userMap[comment.user_id] || {
        _id: comment.user_id,
        first_name: "Unknown",
        last_name: "",
      },
    })),
  }));
  return res.json(payload);
});

app.post("/commentsOfPhoto/:photo_id", async (req, res) => {
  const text = req.body.comment?.trim();
  if (!text) return res.status(400).send("Comment must not be empty.");
  const photo = await Photo.findById(req.params.photo_id);
  if (!photo) return res.status(400).send("Invalid photo id.");

  photo.comments.push({
    _id: String(Date.now()),
    user_id: req.session.user._id,
    comment: text,
    date_time: new Date(),
  });
  await photo.save();
  return res.json({ message: "Comment added." });
});

app.post("/photos/new", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No photo uploaded.");
  }

  // Convert uploaded file to Base64
  const imageBase64 = fs.readFileSync(req.file.path, {
    encoding: "base64",
  });

  // Optional: preserve the MIME type
  const imageData = `data:${req.file.mimetype};base64,${imageBase64}`;

  // Clean up the temporary upload
  fs.unlinkSync(req.file.path);

  const photo = await Photo.create({
    _id: String(Date.now()),
    user_id: req.session.user._id,
    base64: imageData, // New schema field
    date_time: new Date(),
    comments: [],
  });

  res.json(photo);
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
