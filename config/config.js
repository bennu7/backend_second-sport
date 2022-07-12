const path = require('path');
require("dotenv").config(path.resolve(__dirname + '../.env'));

const username  = process.env.DB_USERNAME,
      password  = process.env.DB_PASSWORD,
      database  = process.env.DB_NAME,
      host      = process.env.DB_HOST,
      dialect   = process.env.DB_DIALECT;

module.exports = {
  development: {
    username,
    password,
    database,
    host,
    dialect,
  },
  test: {
    username,
    password,
    database,
    host,
    dialect,
  },
  production: {
    username,
    password,
    database,
    host,
    dialect,
  },
};
