const express = require("express");
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Define express Router
const router = express.Router();

// @route   GET /api/users/test
// @desc    Tests get route
// @access  Public
router.get("/test", (req, res) => {
  res.json({ msg: "Users works!!" });
});

// @route   GET /api/users/register
// @desc    Register user
// @access  Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  //Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists!";
      return res.status(400).json({ errors });
    } else {
      // Get avatar with Gravatar
      const avatar = gravatar.url(req.body.email, {
        s: "200",
        r: "pg",
        d: "mm"
      });
      // Create new User with request data
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        avatar: avatar,
        date: req.body.date
      });

      // Hash password with bcryptjs
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          // Save New User
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route   GET /api/users/login
// @desc    Login user // Return JWT Token
// @access  Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  //Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  // Find User by email
  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = "User not found!";
      return res.status(404).json({ errors });
    }
    //Check user password with bcrypt
    bcrypt.compare(password, user.password).then(isMatch => {
      if (!isMatch) {
        errors.password = "Password incorrect!";
        return res.status(400).json({ errors });
      } else {
        // Create the payload token
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        };

        // Sign token with jwt
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            if (err) {
              console.error(err);
            } else {
              return res.json({ success: true, token: `Bearer ${token}` });
            }
          }
        );
      }
    });
  });
});

// @route   GET /api/users/current
// @desc    Get current user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // If it's authorize, send user data in response
    res.json({ id: req.user.id, name: req.user.name, email: req.user.email });
  }
);

module.exports = router;
