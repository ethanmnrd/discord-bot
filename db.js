// File to create connection to database
require("dotenv").config();

var mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "bugbot"

  // var connection = mysql.createConnection({
  //     host     : 'database-1.czh25xqqv727.us-west-1.rds.amazonaws.com',
  //     user     : 'celestai69',
  //     password : 'pPw4Efj9dEnwndKS',
  //     database: 'bugbot',
  //     port     : 3306
});

connection.connect(function(err) {
  if (err) {
    console.error(`error connecting to db: ${err.stack}`);
    return;
  }

  console.log(`connected to db as id ${connection.threadId}`);
});

module.exports = connection;
