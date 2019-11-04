// File to create connection to database
require("dotenv").config();

var mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
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
