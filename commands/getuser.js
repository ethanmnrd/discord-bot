var db = require("../db");
const Discord = require("discord.js");
const sqlFunctions = require("../requires/sql.js");

// For Rich Embeds

module.exports = {
  name: "getuser",
  description: "View the vote history on a user",
  args: false,
  serverOnly: true,
  execute(msg, args) {
   getUser(msg)
  }
};

function getUser(msg) {
  var userAgainst = msg.mentions.members.first();

  if (userAgainst == undefined) {
    msg.channel.send("TAG SOMEBODY");
    return;
  }
	
	 var sql = "CALL getUserCount("+ msg.guild.id + "," + userAgainst.id+")";
	 console.log(sql);
	 
	  var sql2 = "CALL getTallies("+ msg.guild.id + "," + userAgainst.id+")";
	 console.log(sql);
	 
	 //=================
	 
	  var waitForVotes= sqlFunctions.sqlPromise(
        msg,
        sql,
        "Error retrieving user info"
      );

      waitForVotes
        .then(result => {
		console.log(result);
        var fails = result[0][0];
		//console.log(fails.fail);
		var successes = result[1][0];
		//console.log(successes.success);
		var totals = result[2][0];
		//console.log(totals.total);
		var guildTotal = result[3][0];
		var hitsTo = result[4][0];
		console.log(hitsTo);
		var hitsFrom = result[5][0];
		console.log(hitsFrom);
		var guildTallies = result[6][0];
		console.log(guildTallies);
		
		
		const embedMsg = new Discord.RichEmbed()
        .setColor(global.successColor)
        .addField(
          "Results for: " + userAgainst.user.username,
		   "- This user has voted against others " + hitsTo.hitsToOthers + " times.\n"
		  + "- This user has been voted against " + hitsFrom.hitsFromOthers + " times out of the " + guildTallies.guildTallies + " total votes against others in this server.\n"
          + "- " + successes.success + " out of " + totals.total + " votes started against this user have successfully kicked or muted them.\n"
		  + "- Votes started against this user account for " + totals.total + " out of the " + guildTotal.guildTotal + " votes started in this guild.\n"
		
        );
     msg.channel.send(embedMsg);
		
	});
}
