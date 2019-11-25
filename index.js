require("dotenv").config();
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();

// db connection var
var db = require("./db");
var { sqlPromise, sayDatabaseError } = require("./requires/sql");
var prefix = "!";

// Loads commands from commands directory
client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", message => {
  if (message.author.bot) return;

  var sql = `CALL getGuildPrefix(${message.guild.id})`;
  var query = sqlPromise(message, sql, "error retrieving guild prefix");

  query
    .then(results => {
      prefix = results[0][0].prefix;
      if (message.content === "current_prefix") {
        console.log(`Current prefix is "${prefix}"`);
        message.channel.send(`Current prefix is "${prefix}"`);
      }

      if (!message.content.startsWith(prefix) || message.author.bot) return;

      var args = message.content.slice(prefix.length).split(/ +/);
      var cmdName = args.shift().toLowerCase();

      if (!client.commands.has(cmdName)) return;

      var cmd = client.commands.get(cmdName);

      if (cmd.serverOnly && message.channel.type !== "text") {
        return message.reply("I can't execute that command inside DMs!");
      }

      if (cmd.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (cmd.usage) {
          reply += `\nThe proper usage would be: \`${prefix}${cmd.name} ${cmd.usage}\``;
        }
        return message.channel.send(reply);
      }

      try {
        cmd.execute(message, args);
      } catch (error) {
        console.error(error);
        message.reply("There was an error trying to execute that command!");
      }
    })
    .catch(error => {
      sayDatabaseError(message, error);
    });
});

//========================================= LEOS CODE STARTS HERE ============================

//DECLARING GLOBALS
global.variable = "moo";
global.gagRoleName = "bugbot-gag-role";
global.successColor = "#0CBA00";

global.hello = function() {
  console.log("hello world");
};
global.isOwner = function(message) {
  var ownerId = message.guild.ownerID;
  var authorId = message.author.id;
  console.log(authorId);
  console.log(ownerId);
  if (ownerId == authorId) {
    console.log("returning true");
    return true;
  }
  message.channel.send("You are not the owner of this server!");
  return false;
};

//DECLARING EVENTS

client.on("guildCreate", guild => {
  console.log("INSERTING GUILD INTO DATABASE");
  insertGuild(guild.id);
});

var muteRolePermissions = { SPEAK: false, SEND_MESSAGES: false };
function insertGuild(guildId) {
  console.log(guildId);
  let sql = "CALL createGuild(?)";
  db.query(sql, guildId, (error, results, fields) => {
    if (error) {
      if (error.code == "ER_DUP_ENTRY") {
        console.log("duplicate entry");
        return;
      }
      console.log(error);
    }
  });
}

//on joining a guild, create the gag role. Wrap it in promise to make sure role exists before adding to channels
client.on("guildCreate", guild => {
  var makeSureRoleExists = new Promise((resolve, reject) => {
    var muteRole = guild.roles.find(val => val.name === global.gagRoleName); //look for gag
    if (muteRole != null) {
      //role already exists
      console.log("found");
      resolve(muteRole); //return role to promise
    } else {
      //role does not exist
      console.log("not found - creating");
      //create role and return it to promise
      guild
        .createRole(
          { name: global.gagRoleName, color: "RED", position: 0 },
          "Reason for creating role"
        )
        .then(role => resolve(role));
    }
    console.log("done createrole function");
  }, 10000);
  makeSureRoleExists.then(muteRole => {
    for (var [key, channel] of guild.channels) {
      //add gag role to each channel. If same role added twice, everything is fine.
      console.log(key + " goes to " + channel.name);
      channel.overwritePermissions(muteRole, muteRolePermissions);
    }
  });
});

//when a channel is created, add the gag role to it
//also event is called on each channel when
client.on("channelCreate", channel => {
  console.log("saw fresh channel " + channel.name);
  var muteRole = channel.guild.roles.find(
    val => val.name === global.gagRoleName
  );
  if (muteRole == null) {
    //role DNE, fresh to server. Ignore all fresh channels. For some reason, does this on re-add to server but that's ok.
    console.log("New to server, don't do anything");
    return;
  } else {
    channel.overwritePermissions(muteRole, muteRolePermissions);
  }
});

//================================== LEOS CODE ENDS HERE =================================================

client.login(process.env.BOT_KEY);
