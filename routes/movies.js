var express = require("express");
var router = express.Router();
const authenticateJWT = require("../middleware/authenticateJWT");
const User = require("../models/User");
var validator = require("validator");

router.post(
  "/add-to-favorite",
  authenticateJWT,
  async function (req, res, next) {
    let movieId = req.body.movieId;

    if (!movieId || validator.isEmpty(movieId))
      return res.json(Boom.badRequest("movieId is missing"));

    // TODO check if movieId is valid

    // find the user
    const user = await User.findOne({ email: req.user });
    user.password = undefined;

    // do not add movie if it already exists in favorites
    let movieExists = user.movies.includes(movieId);
    if (movieExists) return res.json(user);

    user.movies.push(movieId);

    await user.save();

    return res.json(user);
  }
);

router.post(
  "/remove-from-favorite",
  authenticateJWT,
  async function (req, res, next) {
    let movieId = req.body.movieId;

    if (!movieId || validator.isEmpty(movieId))
      return res.json(Boom.badRequest("movieId is missing"));

    // find the user
    const user = await User.findOne({ email: req.user });

    let updatedMovies = user.movies.filter((movie) => movie !== movieId);
    user.movies = updatedMovies;

    await user.save();
    user.password = undefined;

    return res.json(user);
  }
);

module.exports = router;
