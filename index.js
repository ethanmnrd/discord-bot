const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", msg => {
  if (msg.content === "ping") {
    msg.reply("pong");
  }
});

client.login("NjIzOTIzMTU1NTI1OTU5NzIw.XYJfxw.PScGadEfthdcJqI8KgnlETwSsq0");

// https://discordapp.com/oauth2/authorize?client_id=623923155525959720&scope=bot
