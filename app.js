require("dotenv").config();

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const queryString = require("query-string");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var moviesRouter = require("./routes/movies");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/movies", moviesRouter);

app.use(
  "/api/movie-db",
  createProxyMiddleware({
    target: "https://api.themoviedb.org/3",
    changeOrigin: true,
    pathRewrite: async function (path, req) {
      path = path.replace("/api/movie-db", "");

      Object.keys(queryString.parseUrl(path).query).length > 0
        ? (path += "&")
        : (path += "?");

      return (path += "api_key=" + process.env.MOVIE_DB_API_KEY);
    },
  })
);

module.exports = app;
