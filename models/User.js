const mongoose = require("mongoose");

const schema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  movies: Array,
});

module.exports = mongoose.model("User", schema);
