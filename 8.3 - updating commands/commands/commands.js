const discord = require("discord.js");
module.exports = {
  name: "commands",
  description: "lists all the commands",
  execute(message, args) {
     const embed = new discord.RichEmbed()
    .setColor(global.successColor)
	.addField('[Owner only] <prefix>delete', 'Safely removes the bot from the server & deletes roles before leaving.' )
	.addField('[Owner only] <prefix>set votes <amount>', 'Sets the amount of votes needed for a user to be kicked or muted.' )
    .addField('[Owner only] <prefix>set time <milliseconds>', 'Sets the amount of time (milliseconds) a vote exists before it expires. 1000 milliseconds = 1 second.')
    .addField('<prefix>settings', 'View the votes needed for a vote to succeed and time limit of each vote.')
    .addField('<prefix>vote kick @<user>', 'Starts a vote to kick the user')
    .addField('<prefix>vote mute @<user>', 'Starts a vote to mute the user')
	.addField('<prefix>getuser @<user>', 'Starts a vote to kick the user')
	.addField('<prefix>top voter','Rankings on who has voted the most against others')
	.addField('<prefix>top voted', 'Rankings on who has been voted against the most');
    message.channel.send(embed);
  }
};
