// File to create connection to database
require("dotenv").config();

var mysql = require("mysql");

const connection = mysql.createConnection({
  host: "database-1.czh25xqqv727.us-west-1.rds.amazonaws.com",
  user: "celestai69",
  password: process.env.DB_PASSWORD_AWS,
  database: "bugbot"
});

connection.connect(function(err) {
  if (err) {
    console.error(`error connecting to db: ${err.stack}`);
    return;
  }

  console.log(`connected to db as id ${connection.threadId}`);
});

module.exports = connection;
