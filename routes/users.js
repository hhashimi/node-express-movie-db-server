var express = require("express");
var router = express.Router();
const User = require("../models/User");
var bcrypt = require("bcryptjs");
const Boom = require("@hapi/boom");
var validator = require("validator");
var jwt = require("jsonwebtoken");
const authenticateJWT = require("../middleware/authenticateJWT");

router.post("/register", async function (req, res, next) {
  let name = req.body.fullName;
  let email = req.body.email;
  let password = req.body.password;

  if (!name || validator.isEmpty(name))
    return res.json(Boom.badRequest("name is missing"));

  if (!email || !validator.isEmail(email))
    return res.json(Boom.badRequest("invalid email address"));

  if (!password || validator.isEmpty(password))
    return res.json(Boom.badRequest("password is missing"));

  // check if user is already registered
  const user = await User.findOne({ email });
  if (user) {
    return res.json(Boom.badRequest("user already exists"));
  }

  const newUser = new User({
    name,
    email,
    password: await bcrypt.hash(password, 8),
  });
  await newUser.save();
  newUser.password = undefined;
  return res.json(newUser);
});

router.post("/login", async function (req, res, next) {
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !validator.isEmail(email))
    return res.json(Boom.badRequest("invalid email address"));

  if (!password || validator.isEmpty(password))
    return res.json(Boom.badRequest("password is missing"));

  // check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.json(Boom.badRequest("user does not exist"));
  }

  // check if password is correct
  const passwordCorrect = await bcrypt.compare(password, user.password);

  if (!passwordCorrect) {
    return res.json(Boom.badRequest("invalid password"));
  }

  // sign JWT
  let token = jwt.sign(
    {
      user: email,
    },
    process.env.SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token: token });
});

router.get("/profile", authenticateJWT, async function (req, res, next) {
  const user = await User.findOne({ email: req.user });
  user.password = undefined;

  return res.json(user);
});

module.exports = router;
