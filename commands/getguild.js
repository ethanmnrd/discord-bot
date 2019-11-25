var db = require("../db");
const Discord = require("discord.js");
const sqlFunctions = require("../requires/sql.js");

// For Rich Embeds

module.exports = {
  name: "getguild",
  description: "View the vote history of the guild",
  args: false,
  serverOnly: true,
  execute(msg, args) {
   getGuild(msg)
  }
};

function getGuild(msg) {
	
	 var sql = "CALL getGuildCount("+ msg.guild.id + ")";
	 console.log(sql);
	 
	 //=================
	 
	  var waitForQuery = sqlFunctions.sqlPromise(
        msg,
        sql,
        "Error retrieving user info"
      );
      waitForQuery
        .then(result => {
		//console.log(result);
        var fails = result[0][0];
		//console.log(fails.fail);
		var successes = result[1][0];
		//console.log(successes.success);
		var totals = result[2][0];
		//console.log(totals.total);
		
		const embedMsg = new Discord.RichEmbed()
        .setColor(global.successColor)
        .addField(
          "Guild statistics" ,
          "" + successes.success + " out of " + totals.total + " votes started in this guild has muted or kicked the user."
        );
     msg.channel.send(embedMsg);
		
	});
}
