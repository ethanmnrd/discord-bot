var guildMap = new Map();
var db = require("../db");
const sqlFunctions = require("../requires/sql.js");
const Discord = require("discord.js");
const limit = 5;

module.exports = {
  name: "top",
  description: "Gets the scoreboard for a <type> of ranking",
  args: true,
  serverOnly: true,
  usage: "<prefix>top <type>",
  execute(message, args) {
    getTop(message, args[0]);
  }
};

function getTop(msg, type) {

	if(type == "voter"){
		var sql = `SELECT fromUser,count(guildId) AS votes FROM tallies WHERE guildId = ${msg.guild.id} GROUP BY fromUser ORDER BY votes DESC LIMIT ${limit}`;
		//var sql = `CALL getTop(${msg.guild.id})`;
		printTop(msg, sql, "Users who have voted the most against others.",type);
	}
	
	else if (type == "voted" ){
			var sql = `SELECT againstUser,count(guildId) AS votes FROM tallies WHERE guildId = ${msg.guild.id} GROUP BY againstUser ORDER BY votes DESC LIMIT ${limit}`;
			printTop(msg, sql, "Users who have been voted against the most",type);
	}
	
	else{
	msg.channel.send("invalid type");
	}
}

function printTop(msg, sql, title,type){
	console.log(sql);
	 var waitForQuery = sqlFunctions.sqlPromise(
        msg,
        sql,
        "Error retrieving user info"
      );
      waitForQuery
        .then(result => {
			var string = "";
			var i;
			for (i = 0; i < limit; i++) {
				string = string + (i + 1) + ") ";
				if(result[i] != undefined){
					if (type == "voter"){
					string += `${result[i].votes} votes - <@${result[i].fromUser}>`;
					}
					else{
						string += `${result[i].votes} votes - <@${result[i].againstUser}>`;
					}
				}
				else{
					string += "N/A";
				}
				string = string + "\n";
			}
			const embedMsg = new Discord.RichEmbed()
			 .setColor(global.successColor)
			  .addField(
				title ,
				string
				);
			msg.channel.send(embedMsg);

		});
}
