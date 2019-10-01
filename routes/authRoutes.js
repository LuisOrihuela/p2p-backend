const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const User = require("../models/User");

router.post("/", (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;

  if (!email || !password) {
    res.send("Please type email and password");
    return;
  }

  User.findOne({ email })
    .then(user => {
      if (user !== null) {
        res.json("This email is already associated to an account");
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        email,
        password: hashPass,
        username
      });

      newUser.save((err, user) => {
        if (err) {
          res.send("Something went wrong");
        } else {
          res.send("User saved");
        }
      });
    })
    .catch(err => next(err));
});

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
        req.session.currenUser = user;
        res.redirect("/secret");
      } else {
        res.json("Incorrect password");
      }
    })
    .catch(error => {
      next(error);
    });
});

module.exports = router;
