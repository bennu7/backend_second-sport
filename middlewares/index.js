const jwt = require("jsonwebtoken");

module.exports = {
  login: (req, res, next) => {
    try {
      const token = req.headers["authorization"];
      if (!token) {
        return res.status(401).json({
          status: false,
          message: "you're not authorized!",
          data: null,
        });
      }

      const secretKey = process.env.JWT_SECRET_KEY;
      const decoded = jwt.verify(token, secretKey);

      req.user = decoded;

      next();
    } catch (err) {
      if (err.message == "jwt malformed") {
        return res.status(401).json({
          status: false,
          message: err.message,
          data: null,
        });
      }

      return res.status(500).json({
        status: false,
        message: err.message,
        data: null,
      });
    }
  },

  admin: (req, res, next) => {
    try {
      if (!req.user || req.user.role != "admin") {
        return res.status(401).json({
          status: false,
          message: "only role admin can access this enpoint!",
          data: null,
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: err.message,
        data: null,
      });
    }
  },
};
