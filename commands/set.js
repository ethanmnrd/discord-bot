const Discord = require("discord.js");
var db = require("../db");

var { terms } = require("../config.json");

// For Rich Embeds
const color = "#0CBA00";

function doSet(message, option, new_option) {
  if (!option) return "Needs something to set!";
  if (!new_option) return "Needs a new setting for option!";
  switch (option) {
    case "votes":
      setVotes(message, new_option);
      break;
    case "time":
      setTime(message, new_option);
      break;
    case "terms":
      setTerms(args.join(" "));
      break;
    case "prefix":
      setPrefix(message, new_option);
      break;
    default:
      break;
  }
}

function setVotes(message, amount) {
  var amount = parseInt(amount, 10);
  if (!Number.isInteger(amount)) {
    return "Vote option must be set to an integer!";
  }
  let sql = "CALL setVotesNeeded(" + message.guild.id + "," + amount + ");";
  var waitForQuery = sqlPromise(message, sql, "Error setting votes");
  waitForQuery
    .then(result => {
      viewSettings(message);
    })
    .catch(error => {
      sayDatabaseError(message, error);
    });
}

function setTime(message, amount) {
  var amount = parseInt(amount, 10);
  if (!Number.isInteger(amount)) {
    return "Time must be set to a number (milliseconds)";
  }

  let sql = "CALL setTimeNeeded(" + message.guild.id + "," + amount + ");";
  var waitForQuery = sqlPromise(message, sql, "Error setting votes");
  waitForQuery
    .then(result => {
      viewSettings(message);
    })
    .catch(error => {
      sayDatabaseError(message, error);
    });
}

function setPrefix(message, new_prefix) {
  if (new_prefix.length != 1) {
    return `Prefix must be of length 1.`;
  } else {
    if (is_num_or_letter(new_prefix)) {
      return `Prefix cannot be letters or numbers.`;
    } else {
      let sql = `CALL setGuildPrefix(${message.guild.id}, "${new_prefix}");`;
      var waitForQuery = sqlPromise(message, sql, "Error setting prefix");
      waitForQuery
        .then(result => {
          viewSettings(message);
        })
        .catch(error => {
          sayDatabaseError(message, error);
        });
    }
  }
}

function setTerms(new_terms) {
  terms = new_terms;
  return `Terms have been set.`;
}

// Checks if char is a num or letter (not allowed)
function is_num_or_letter(char) {
  if (char.length != 1) {
    return `Must be only one character`;
  }
  char = char.toLowerCase().charCodeAt(0);
  return (char >= 97 && char <= 122) || (char >= 48 && char <= 57);
}

//returns a promise of sql query, which resolves on result.
//says message to channel on error
//places guildid in ? slot.
function sqlPromise(message, sql, errorMessage) {
  var waitForQuery = new Promise((resolve, reject) => {
    db.query(
      sql,
      (error, results, fields) => {
        if (error) {
          console.log(error); //this probably isn't sent. I don't know why. I can send it later on down the function line.
          message.channel.send(errorMessage); //this isn't sent. I don't know why. I can send it later on down the function line though.
          reject(error);
        } else {
          console.log("resolving results");
          resolve(results);
        }
      },
      5000
    );
  });
  return waitForQuery;
}

function viewSettings(message) {
  var sql = "SELECT * FROM guildsettings WHERE guildId = " + message.guild.id;
  console.log(sql);
  var query = sqlPromise(message, sql, "error retreiving guild settings");
  query
    .then(results => {
      var results = results[0];
      const embed = new Discord.RichEmbed()
        .setColor(color)
        .addField(
          "Votes needed: " + results.votesNeeded,
          "Number of votes needed within timeframe to successfully kick or mute a user."
        )
        .addField(
          "Time limit: " + results.timeLimit,
          " The amount of time there is to cast votes against a user until the vote expires."
        )
        .addField(
          `Prefix: ${results.prefix}`,
          " The currently set prefix for this guild"
        );
      message.channel.send(embed);
    })
    .catch(error => {
      sayDatabaseError(message, error);
    });
}

function sayDatabaseError(message, error) {
  message.channel.send("There was an error accessing the database.");
  console.log(error);
}

module.exports = {
  name: "set",
  description: "Set options for bot.",
  args: true,
  serverOnly: true,
  usage: "<option> <new_option>",
  execute(message, args) {
    return message.channel.send(doSet(message, args[0], args[1]));
  }
};
