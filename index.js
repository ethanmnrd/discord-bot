require("dotenv").config();
const prefix = '!bot';
const  mysql = require('mysql');
const Discord = require("discord.js");
const client = new Discord.Client();
var muteRoleName = "bugbot";
// var connection = connectToDatabase();

client.once('ready', () => {
    console.log("Logged in as ${client.user.tag}!");
    console.log(' ')
});

client.on('channelCreate',channel =>{
    console.log('created channel ' + channel.name);
    var muteRole = channel.guild.roles.find(val => val.name === muteRoleName);
    channel.overwritePermissions(muteRole, { SEND_MESSAGES: false,SPEAK:false});
});

client.on('message', message => {
    if ( message.author.bot || !isCallBotMessage(message)){
        return;
    }

    var wordArray = message.content.split(' ');

    if(wordArray.length ==1){ //just !prefix
    //according to testing, this line should never be invoked because of the needed space + how Discord ignores extra spaces? Kinda weird, so I'll leave this here as safety.
        return;
    }
    var argument = wordArray[1] //ex: ping
    console.log("argument is " + argument);

    if(argument == "store"){
        var query = 'insert into messages values ("' + message.content + '")';
        console.log('running query -- ' + query);
        connection.query(query);
    }

    else if(argument == "vm"){
        votemute();
    }

    else if(argument == "init"){
        createRoles(message);
    }
    
    else if(argument == "list"){
        connection.query('select * from messages', printAllResults);
    }
    else if (argument == "ping"){
        message.channel.send("pong.");
    }

    else if (argument == "del"){
        deleteRole(message);
    }
    else if (argument == 'mute'){
        mute(message);
    }
    else if (argument == 'addc'){
        addPermsToChannels(message);
    }
    else if (argument == 'delc'){
        delPermsFromChannels(message);
    }
});

//for every channel, delete the muteRoleName permissionOverWrite 
function delPermsFromChannels(message){
    var muteRole = message.channel.guild.roles.find(val => val.name === muteRoleName);
    for (var [key, channel] of message.guild.channels) {
        console.log(key + ' goes to ' + channel.name);
        var perm = channel.permissionOverwrites.get(muteRole.id)
        if(perm != null){
        perm.delete();
        }
        else{
            console.log("NULLerino");
        }
      }
}

//for every channel, add a persmissionoverwrite that prevents sending messages and speaking
//for the person who has the muteRoleName role. 
function addPermsToChannels(message){
    var muteRole = message.channel.guild.roles.find(val => val.name === muteRoleName);
    for (var [key, channel] of message.guild.channels) {
        console.log(key + ' goes to ' + channel.name);
        channel.overwritePermissions(muteRole, { SEND_MESSAGES: false,SPEAK:false});
      }
}

function mute(message){
    message.member.setMute(true, 'It needed to be done');
}

//test code - deletes the muteRoleName role
function deleteRole(message){
    var role = message.guild.roles.find(val => val.name === muteRoleName);
    if(role != null){
        role.delete();
        console.log('deleted role');
    }
}
//creates the gagged role
function createRoles(message){
    console.log('creating roles');
    var roles = message.guild.roles;
    var muteRole = roles.find(val => val.name === muteRoleName);
    if(muteRole != null){
        console.log('found')
    }
    else{
        console.log('not found - creating');
        message.guild.createRole({name:muteRoleName,color:'RED', position:0},'Reason for creating role');
    }
    console.log('done createrole function');
}


//is the message meant for the bot?
function isCallBotMessage(message){
    // console.log(message.content.startsWith(prefix));
    // console.log(message.content.substring(prefix.length,prefix.length + 1) == " ");
    
    //if it does not start with the prefix, it was not meant for the bot
    if(!(message.content.startsWith(prefix))){
        return false;
    }
    //if it does not have a space after prefix, it was not meant for bot
    //!prefix (argument) is true. !prefixAnyOtherText (argument) is false.
    if(!(message.content.substring(prefix.length,prefix.length + 1) == " ")){
        return false;
    }
    return true;

}


function printAllResults(err, result) {
         if(err){
          console.log("ERROR IN CLASS-SQL-METHODS PRINT ALL RESULTS");
          console.log(err);
        }
        console.log(result);
 }


// function connectToDatabase(){
//     var connection = mysql.createConnection({
//         host     : 'localhost',
//         user     : 'root',
//         password : '',
//         database : 'database1'
//         });

//         connection.connect(function(err) {
//         if (err) {
//         console.error('error connecting: ' + err.stack);
//         return;
//         }
    
//         console.log('connected as id ' + connection.threadId);
//         });
//         return connection
//     }

client.login(process.env.BOT_KEY);