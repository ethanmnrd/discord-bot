var db = require("../db");
const Discord = require("discord.js");
const sqlFunctions = require("../requires/sql.js");

// For Rich Embeds

module.exports = {
  name: "settings",
  description: "Views bot settings",
  args: false,
  serverOnly: false,
  execute(msg, args) {
   sqlFunctions.viewSettings(msg);
  }
};
