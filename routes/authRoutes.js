const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const User = require("../models/User");
const Chatroom = require("../models/Chatrooms");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("./validation");

router.post("/signup", async (req, res) => {
  //Validate the data before creating a user
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  //Check if user already exists
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send("Email already exists");

  //Create a new user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword
  });
  try {
    user.save();
    //Create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header("auth-token", token).send(token);
  } catch (err) {
    res.status(400).send(err);
  }
});

//Login
router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("User doesn't exist");

  //Password is correct?
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Incorrect password");

  //Create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token).send(token);
});

router.post("/dashboard", async (req, res) => {
  let { id, level, subject } = req.body;
  let creatorId = id;
  const user = await User.findById({ _id: id });
  const creator = user.name;
  console.log(creator);
  const chatroom = new Chatroom({ creator, level, subject, creatorId });

  try {
    await chatroom.save();
    res.send(chatroom);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/dashboard", async (req, res) => {
  let chatrooms = await Chatroom.find();
  if (chatrooms === 0) {
    res.status(400).send("No chatrooms available");
  }

  try {
    res.send(chatrooms);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/:id", async (req, res) => {
  let userid = req.params.id;
  let user = await User.findById({ _id: userid });
  console.log(user);
  try {
    res.send(user.name);
  } catch (err) {
    res.send(err);
  }
});
module.exports = router;
