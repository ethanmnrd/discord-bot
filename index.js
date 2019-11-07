require("dotenv").config();
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();

// db connection var
var db = require("./db");

// Key-value package for prefix management
var Keyv = require("keyv");
const prefixes = new Keyv(
  `mysql://root:${process.env.DB_PASSWORD}@localhost:3306/${process.env.DB_NAME}`
);
prefixes.on("error", err => console.error("Keyv connection error:", err));

// Global / Default prefix to search for in message
const globalPrefix = "!";

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

client.on("message", async message => {
  if (message.content === "current_prefix") {
    message.channel.send(
      `Current prefix is "${(await prefixes.get(message.guild.id)) ||
        globalPrefix}"`
    );
  }

  if (message.author.bot) return;

  if (message.content.startsWith(globalPrefix)) {
    prefix = globalPrefix;
  } else {
    const guildPrefix = await prefixes.get(message.guild.id);
    if (message.content.startsWith(guildPrefix)) prefix = guildPrefix;
  }

  if (!prefix) return;
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
      reply += `\nThe proper usage would be: \`${config.prefix}${cmd.name} ${cmd.usage}\``;
    }
    return message.channel.send(reply);
  }

  try {
    cmd.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("There was an error trying to execute that command!");
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
