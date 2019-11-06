require("dotenv").config();
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();

// db connection var
var db = require("./db");

var config = require("./config.json");

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

client.on("message", msg => {
  if (msg.content === "current_prefix") {
    console.log(`Current prefix is "${config.prefix}"`);
    msg.channel.send(`Current prefix is "${config.prefix}"`);
  }

  if (!msg.content.startsWith(config.prefix) || msg.author.bot) return;

  var args = msg.content.slice(config.prefix.length).split(/ +/);
  var cmdName = args.shift().toLowerCase();

  if (!client.commands.has(cmdName)) return;

  var cmd = client.commands.get(cmdName);

  if (cmd.serverOnly && msg.channel.type !== "text") {
    return msg.reply("I can't execute that command inside DMs!");
  }

  if (cmd.args && !args.length) {
    let reply = `You didn't provide any arguments, ${msg.author}!`;

    if (cmd.usage) {
      reply += `\nThe proper usage would be: \`${config.prefix}${cmd.name} ${cmd.usage}\``;
    }
    return msg.channel.send(reply);
  }

  try {
    cmd.execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply("There was an error trying to execute that command!");
  }
});

client.on("guildCreate", guild => {
  console.log("INSERTING GUILD INTO DATABASE");
  insertGuild(guild.id);
});

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

client.login(process.env.BOT_KEY);

// https://discordapp.com/oauth2/authorize?client_id=&scope=bot
