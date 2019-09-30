require("dotenv").config();
var votemute = require('./leos-code/createVote.js')
const prefix = '!bot';
const  mysql = require('mysql');
const discord = require('discord.js');
const client = new discord.Client();
var muteRoleName = "bugbot";
// var connection = connectToDatabase();

var guildsVoting = new Map();

console.log('success');

client.once('ready', () => {
    console.log('Ready!');
    console.log(' ')
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

    if (argument == "ping"){
        message.channel.send("pong.");
    }

    else if (argument = 'v'){
        votemute(message,guildsVoting);
    }
});


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

client.login(process.env.BOT_KEY);