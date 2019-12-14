const Discord = require("discord.js");
var db = require("../db"); //connection
const sqlFunctions = require("../requires/sql.js"); //functions
var { terms } = require("../config.json");

const maxVotes = 100;
const minVotes = 1;

const maxTime = 300000;
const minTime = 1000

// For Rich Embeds

function doSet(message, option, new_option) {
 
     if(!(global.isOwner(message))){
        return;
    }
 
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
  
  if(amount < minVotes || amount > maxVotes){
      message.channel.send('Votes cannot be lower than ' + minVotes + ' or higher than ' + maxVotes + '.');
      return;
  }
  
  let sql = "CALL setVotesNeeded(" + message.guild.id + "," + amount + ");";
  var waitForQuery = sqlFunctions.sqlPromise(message, sql, "Error setting votes");
  waitForQuery
    .then(result => {
      sqlFunctions.viewSettings(message);
    })
    .catch(error => {
      sqlFunctions.sayDatabaseError(message, error);
    });
}

function setTime(message, amount) {
  var amount = parseInt(amount, 10);
  if (!Number.isInteger(amount)) {
    return "Time must be set to a number (milliseconds)";
  }

   if(amount < minTime || amount > maxTime){
      message.channel.send('Time cannot be lower than ' + minTime + ' milliseconds or higher than ' + maxTime + ' milliseconds.');
      return;
  }

  let sql = "CALL setTimeNeeded(" + message.guild.id + "," + amount + ");";
  var waitForQuery = sqlFunctions.sqlPromise(message, sql, "Error setting votes");
  waitForQuery
    .then(result => {
      sqlFunctions.viewSettings(message);
    })
    .catch(error => {
      sqlFunctions.sayDatabaseError(message, error);
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
      var waitForQuery = sqlFunctions.sqlPromise(message, sql, "Error setting prefix");
      waitForQuery
        .then(result => {
          sqlFunctions.viewSettings(message);
        })
        .catch(error => {
          sqlFunctions.sayDatabaseError(message, error);
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

module.exports = {
  name: "set",
  description: "Set options for bot.",
  args: true,
  serverOnly: true,
  usage: "<option> <new_option>",
  execute(message, args) {
    doSet(message, args[0], args[1]);
  }
};
