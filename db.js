// File to create connection to database
require("dotenv").config();

var mysql = require("mysql");

const connection = mysql.createConnection({
  host: "xxxx",
  user: "xxxx",
  password: process.env.DB_PASSWORD_AWS,
  database: "xxxxt"
});

connection.connect(function(err) {
  if (err) {
    console.error(`error connecting to db: ${err.stack}`);
    return;
  }

  console.log(`connected to db as id ${connection.threadId}`);
});

module.exports = connection;
