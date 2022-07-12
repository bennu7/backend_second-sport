require("dotenv").config();
const Sentry = require("@sentry/node");

const { DSN } = process.env;

Sentry.init({
  dsn: DSN,
});

module.exports = Sentry;
