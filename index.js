const fs = require("fs");
const Discord = require("discord.js");
const { prefix, token } = require("./config.json");

const client = new Discord.Client();
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
    console.log(`Current prefix is "${prefix}"`);
    msg.channel.send(`Current prefix is "${prefix}"`);
  }

  if (!msg.content.startsWith(prefix) || msg.author.bot) return;

  var args = msg.content.slice(prefix.length).split(/ +/);
  var cmdName = args.shift().toLowerCase();

  if (!client.commands.has(cmdName)) return;

  var cmd = client.commands.get(cmdName);

  try {
    cmd.execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply("There was an error trying to execute that command!");
  }
});

function set_terms(new_terms) {
  terms = new_terms;
  return `Terms have been set.`;
}

client.login(token);

// https://discordapp.com/oauth2/authorize?client_id=623923155525959720&scope=bot
