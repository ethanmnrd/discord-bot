var db = require("../db");
const Discord = require("discord.js");
function viewSettings(message) {
  var sql = "SELECT * FROM guildSettings WHERE guildId = " + message.guild.id;
  console.log(sql);
  var query = sqlPromise(message, sql, "error retreiving guild settings");
  query
    .then(results => {
      var results = results[0];
      const embedMsg = new Discord.RichEmbed()
        .setColor(global.successColor)
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
     message.channel.send(embedMsg);
    })
    .catch(error => {
      sayDatabaseError(message, error);
    });
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
        //  console.log(error); //this probably isn't sent. I don't know why. I can send it later on down the function line.
        //  message.channel.send(errorMessage); //this isn't sent. I don't know why. I can send it later on down the function line though.
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

function sayDatabaseError(message, error) {
  message.channel.send("There was an error accessing the database.");
  console.log(error);
}

function test(){
    console.log("test");
}
module.exports = {
    viewSettings:viewSettings,
    sqlPromise:sqlPromise,
    sayDatabaseError:sayDatabaseError,
    test:test
}