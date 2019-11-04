var db = require("../db");
const Discord = require("discord.js");

// For Rich Embeds
const color = "#0CBA00";

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

function sayDatabaseError(message, error) {
  message.channel.send("There was an error accessing the database.");
  console.log(error);
}

module.exports = {
  name: "settings",
  description: "Views bot settings",
  args: false,
  serverOnly: false,
  execute(msg, args) {
    msg.channel.send(viewSettings(msg));
  }
};
