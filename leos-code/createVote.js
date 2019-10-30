const discord = require('discord.js');
const client = new discord.Client();
client.login(process.env.BOT_KEY);
var mysql = require('mysql');
//var sql = require('./sql.js');

const mutePrefix = "votemute";
const kickPrefix = "votekick";
//const expirationTime = 20000;
var guildMap = new Map();
const color = '#0CBA00';

var connection = null;
var prefix = '!bot';


client.on('guildCreate', guild => {
    console.log('INSERTING GUILD INTO SQL');
   insertGuild(guild.id);
});

//filters for m and k prefix, then calls addvote() to do all the work
function createVote(message,voteType){
    var userAgainst = message.mentions.members.first();
   
    if(userAgainst == undefined){
        say(message,"TAG SOMEBODY");
        return;
    }
    //say(message, "type is " + voteType);

    //if muteprefix or kickprefix is not in 3rd slot
    if(!(voteType == mutePrefix || voteType == kickPrefix)){
        say(message,"Invalid prefix. Use !prefix " + mutePrefix + " @user or !prefix "+kickPrefix + " @user");
        return;
    }
    //====== prefix checking done

    //if given guild is not already voting anybody off, create a vote store for them
    if(!(guildMap.has(message.guild.id))){
        guildMap.set(message.guild.id,new GuildVoteStorage(message)); 
        //say(message,"adding guild to guildmap");
        }
         guildMap.get(message.guild.id).addGuildVote(message,userAgainst,voteType);
      
    
}

//userId = user it is against?
//deletes vote from guildmap?
function deleteVote(guildID,userID,message){
    var aGuildsStorage = guildMap.get(guildID).usersBeingVoted;
    var success = aGuildsStorage.delete(userID);
    if(success != true){
        console.log(say(message,'ERROR AUTO-DELETING VOTE - PANIC'));
    }
    say(message,'poll deleted / expired - polls happening: ' + aGuildsStorage.size);
    //if they have no votes going on
    if(aGuildsStorage.size == 0){
        console.log('no votes in ' + guildID + ", deleting from main guild map...");
        guildMap.delete(guildID);
    }
    console.log(guildMap);
}
function GuildVoteStorage(message){
    this.guildName = message.guild.name; //deletable
    this.usersBeingVoted = new Map(); //stores VoteAgainstUser objects
    //check usersbeingvoted for whether user is being voted out
    this.addGuildVote = function(message,userAgainst,voteType){
        //if there is no vote being cast for that user, create one
        if(!(this.usersBeingVoted.has(userAgainst.id))){
            let sql = "CALL getVoteSettings(" + message.guild.id + ")";
            var waitForSettings = sqlPromise(message,sql,'Error retrieving vote settings');
            waitForSettings.then((result) => {
                say(message,'starting vote against this user');
                var result = result[0][0];
                var timeInSeconds = result.timeLimit/1000;
                say(message, "Started vote with " + timeInSeconds + " seconds (" + result.timeLimit + " milliseconds).");
                var deleteTimeOut = setTimeout(deleteVote,result.timeLimit,message.guild.id,userAgainst.id,message);
                this.usersBeingVoted.set(userAgainst.id, new VoteAgainstUser(voteType,userAgainst,deleteTimeOut,result.votesNeeded));
                this.usersBeingVoted.get(userAgainst.id).incrementUserVote(message,voteType,userAgainst);
  
            }).catch((error) => {console.log('ERROR GETTING VOTE SETTINGS');
            sayDatabaseError(message,error);
             return;
            });
        } //created vote for fresh user
        else{
        this.usersBeingVoted.get(userAgainst.id).incrementUserVote(message,voteType,userAgainst);
        }
        console.log(guildMap);
    }

}

function VoteAgainstUser(voteType,userAgainst,deleteTimeOut,votesNeeded){
    this.userAgainst = userAgainst; //GuildMember
    this.voteType = voteType;
    this.votes = 0;
    this.deleteTimeOut = deleteTimeOut;
    this.votesNeeded = votesNeeded;
    this.usersWhoVoted = new Map();
    this.incrementUserVote = function(message,voteType,userAgainst){
        if(voteType != this.voteType){ //vote types match, increment vote
            say(message,'there is already a vote of a a different kind (mute / kick) against this user.');
            return;
        }

        if(this.usersWhoVoted.has(message.author.id)){
            say(message,message.author.tag + " has already voted.");
            return;
        }

        console.log(this.deleteTimeOut._idleTimeout);

        this.votes = this.votes + 1; //increment votes by 1
        this.usersWhoVoted.set(message.author.id, undefined);
        say(message, this.userAgainst.displayName + ' has ' + this.votes + ' votes.' + " out of " + this.votesNeeded);
        if(this.votes == this.votesNeeded){ // # of votes needed reached apply punishment and clear vote
            if (this.voteType == kickPrefix){ //kick them
                say(message, 'kicking ' + this.userAgainst.displayName + "...");
                this.userAgainst.kick();
            }
            else if (this.voteType == mutePrefix){
               say(message, 'muting ' + this.userAgainst.displayName + "...");
               var muteRole = message.channel.guild.roles.find(val => val.name === muteRoleName);
               this.userAgainst.addRole(muteRole.id);
               this.userAgainst.setVoiceChannel(null);
            }
            clearTimeout(deleteTimeOut);
            deleteVote(message.guild.id,userAgainst.id,message);
        } //end this.votes == this.votesneeded
    }

}

//bot will say the string in 'words' param
function say(message, words){
    message.channel.send(words);
}

var muteRoleName = "bugbot-gag-role"; //name of gag role
//permission overwrite added to each channel. People with gag role have this permission applied to them.
var muteRolePermissions = {SPEAK:false, SEND_MESSAGES:false}; //idk if its pass by value or pass by object but who cares in this context.

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

//deletes gag role from server
function deleteRole(message){
    var role = message.guild.roles.find(val => val.name === muteRoleName); //find gag role name
    if(role != null){ //if role exists
        role.delete();
        console.log('deleted role');
    }
}

function connectToDatabase(){
    connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'bugbot'
        });

        connection.connect(function(err) {
        if (err) {
        console.error('error connecting: ' + err.stack);
        return;
        }
    
        console.log('connected as id ' + connection.threadId);
        });
}



//returns a promise of sql query, which resolves on result.
//says message to channel on error
//places guildid in ? slot.
function sqlPromise(message,sql,errorMessage){
    var waitForQuery = new Promise((resolve,reject)=>{
        connection.query(sql, (error, results, fields) => {
            if (error){
                console.log(error); //this probably isn't sent. I don't know why. I can send it later on down the function line.
                message.channel.send(errorMessage); //this isn't sent. I don't know why. I can send it later on down the function line though.
                reject(error);
            }
            else{
            console.log('resolving results');
            resolve(results);
            }
    },5000);
    });
    return waitForQuery;
}

function sayDatabaseError(message,error){
    message.channel.send('There was an error accessing the database.');
    console.log(error);
}

var con = connectToDatabase();
function viewSettings(message){
        var sql = "SELECT * FROM votesettings WHERE guildId = " + message.guild.id;
        console.log(sql);
        var query = sqlPromise(message,sql,"error retreiving guild settings");
        query.then((results) => {
            var results = results[0];
            const embed = new discord.RichEmbed()
            .setColor(color)
            .addField('Votess needed: ' + results.votesNeeded, 'Number of votes needed within timeframe to successfully kick or mute a user.')
            .addField('Timelimit: ' + results.timeLimit, ' The amount of time there is to cast votes against a user until the vote expires.')
            message.channel.send(embed);
        }).catch((error) => {
            sayDatabaseError(message,error);
        });
}

var minimumVotesNeeded = 1;
function setVotesNeeded(message,amount){
    var amount = parseInt(amount,10);
    if (!(Number.isInteger(amount))){
        say(message, "Please use "+prefix+" setvotes <NUMBER>");
        return;
    }
    let sql = "CALL setVotesNeeded(" + message.guild.id + "," + amount + ");";
    var waitForQuery = sqlPromise(message,sql,'Error setting votes');
    waitForQuery.then((result) => {
        viewSettings(message);
    }).catch((error) => {
        sayDatabaseError(message,error);
    });
}

function setTimeNeeded(message, amount){
    var amount = parseInt(amount,10);
    if (!(Number.isInteger(amount))){
        say(message, "Please use "+prefix+" settime <NUMBER>");
        return;
    }
    
    let sql = "CALL setTimeNeeded(" + message.guild.id + "," + amount + ");";
    var waitForQuery = sqlPromise(message,sql,'Error setting votes');
    waitForQuery.then((result) => {
        viewSettings(message);
    }).catch((error) => {
        sayDatabaseError(message,error);
    });

};
function selectAll(){
    con.query("SELECT * FROM test", (err, result) => {
        if (err) throw err;
        console.log(result);
        console.log('fields is');
        console.log(result);
        console.log(result[0].message);
        console.log(result.length);
      });
}

function insertGuild(guildId){
    console.log(guildId);
   let sql = "CALL createGuild(?)";
    connection.query(sql, guildId, (error, results, fields) => {
    if(error){
        if(error.code == 'ER_DUP_ENTRY'){
            console.log('duplicate entry');
            return;
        }
        console.log(error);
    }
    });
}

function sayHelp(message){
    const embed = new discord.RichEmbed()
    .setColor(color)
    .addField(prefix + ' setvotes <amount>', 'Sets the amount of votes needed for a user to be kicked or muted' )
    .addField(prefix + ' settime <milliseconds>', 'Sets the amount of time (milliseconds) a vote exists before it expires. 1000 milliseconds = 1 second.')
    .addField(prefix + ' viewsettings', 'View the votes needed for a vote to succeed and time limit of each vote.')
    .addField(prefix + ' votekick @<user>', 'Starts a vote to kick the user')
    .addField(prefix + ' votemute @<user>', 'Starts a vote to mute the user');
    message.channel.send(embed);
}

module.exports = {
    createVote: createVote,
    deleteRole: deleteRole,
    selectAll:selectAll,
    insertGuild:insertGuild,
    setVotesNeeded:setVotesNeeded,
    setTimeNeeded:setTimeNeeded,
    viewSettings:viewSettings,
    sayHelp:sayHelp
};

