require("dotenv").config();
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const muteRoleName = "bugbot-gag-role";
var muteRolePermissions = {SPEAK:false, SEND_MESSAGES:false};

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


//on joining a guild, create the gag role. Wrap it in promise to make sure role exists before adding to channels
client.on('guildCreate', guild => {
  var makeSureRoleExists = new Promise((resolve, reject) => {
      var muteRole = guild.roles.find(val => val.name === muteRoleName); //look for gag
      if(muteRole != null){ //role already exists
          console.log('found');
          resolve(muteRole); //return role to promise
      }
      else{ //role does not exist
          console.log('not found - creating');
          //create role and return it to promise
          guild.createRole({name:muteRoleName,color:'RED', position:0},'Reason for creating role').then((role) => resolve(role));
      }
      console.log('done createrole function');
  },10000);
  makeSureRoleExists.then((muteRole) => {
      for (var [key, channel] of guild.channels) { //add gag role to each channel. If same role added twice, everything is fine.
          console.log(key + ' goes to ' + channel.name);
          channel.overwritePermissions(muteRole, muteRolePermissions); 
        }
  });

});

//when a channel is created, add the gag role to it
//also event is called on each channel when 
client.on('channelCreate',channel =>{
  console.log('saw fresh channel ' + channel.name);
  var muteRole = channel.guild.roles.find(val => val.name === muteRoleName);
  if(muteRole == null){ //role DNE, fresh to server. Ignore all fresh channels. For some reason, does this on re-add to server but that's ok.
      console.log("New to server, don't do anything");
      return;
  }
  else{
  channel.overwritePermissions(muteRole, muteRolePermissions);
  }
});

client.login(process.env.BOT_KEY);

// https://discordapp.com/oauth2/authorize?client_id=&scope=bot
