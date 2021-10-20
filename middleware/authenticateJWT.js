const Boom = require("@hapi/boom");
var jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.SECRET, (err, data) => {
      if (err) {
        return res.json(Boom.forbidden("Invalid token"));
      }

      req.user = data.user;
      next();
    });
  } else {
    return res.json(Boom.unauthorized("Authorization token missing"));
  }
};

module.exports = authenticateJWT;
