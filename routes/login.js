const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const User = require("../models/User");

router.post("/", (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.json("please enter username and password");
    return;
  }
  User.findOne({ email })
    .then(user => {
      if (!user) {
        res.json("The username doesn't exist");
        return;
      }
      if (bcrypt.compareSync(password, user.password)) {
        //Save the login in the session!
        res.json("logged in");
      } else {
        res.json("Incorrect password");
      }
    })
    .catch(error => {
      next(error);
    });
});

module.exports = router;
