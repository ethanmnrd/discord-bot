require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();

var prefix = "!";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", msg => {
  if (msg.content === "current_prefix") {
    msg.channel.send(`Current prefix is "${prefix}"`);
  }

  if (msg.content.substr(0, 1) == prefix) {
    var args = msg.content.substr(1).split(" ");
    var cmd = args[0];
    switch (cmd) {
      case "ping":
        console.log(`Received ping from ${msg.author.tag}`);
        msg.reply();
        break;
      case "set_prefix":
        msg.channel.send(set_prefix(args[1]));
        break;
      default:
        break;
    }
  }
});

client.login(process.env.BOT_KEY);

function set_prefix(new_prefix) {
  if (new_prefix.length != 1) {
    return `Prefix must be of length 1.`;
  } else {
    ascii = new_prefix.toLowerCase().charCodeAt(0);
    if ((ascii >= 97 && ascii <= 122) || (ascii >= 48 && ascii <= 57)) {
      return `Prefix cannot be letters or numbers.`;
    } else {
      prefix = new_prefix;
      return `Current prefix is "${prefix}"`;
    }
  }
}

// https://discordapp.com/oauth2/authorize?client_id=623923155525959720&scope=bot
