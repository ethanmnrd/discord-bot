const EventEmitter = require('events');
class MyEmitter extends EventEmitter{};
const deleteEmitter = new MyEmitter();

//filters for m and k prefix, then calls addvote() to do all the work
function createVote(message, guildMap){
    const mutePrefix = "m";
    const kickPrefix = "k";
    var userAgainst = message.mentions.users.first();
    if(userAgainst == undefined){
        say(message,"TAG SOMEBODY");
        return;
    }
    message.channel.send('this message tagged @' + userAgainst.id + "");

    var wordArray = message.content.split(' ');
    var voteType = wordArray[2];
    say(message, "type is " + voteType);

    // if(voteType == undefined){
    //     say(message,"please use !prefix " + mutePrefix + " @user or !prefix "+kickPrefix + " @user");
    //     return false;
    // }

    //if muteprefix or kickprefix is not in 3rd slot
    if(!(voteType == mutePrefix || voteType == kickPrefix)){
        say(message,"Invalid prefix. Use !prefix " + mutePrefix + " @user or !prefix "+kickPrefix + " @user");
        return;
    }
    //====== prefix checking done

    addVote(message,voteType,guildMap,userAgainst);
    console.log(guildMap);
    
}

//handles guild vote storages and new votes within those storages
function addVote(message,voteType,guildMap,userAgainst){

    //if given guild is not already voting anybody off, create a vote store for them
    if(!(guildMap.has(message.guild.id))){
    guildMap.set(message.guild.id,new GuildVoteStorage(message));
    say(message,"adding guild to guildmap")
    }
    //grab map of users being voted off for given guild.
    var guildUserStorage = guildMap.get(message.guild.id).usersBeingVoted;
    
    //if there is no vote being cast for that user, create one
    if(!(guildUserStorage.has(userAgainst.id))){
        say(message,'first vote against this user');
        var deleteTimeOut = setTimeout(deleteVote,20000,guildMap,message.guild.id,userAgainst.id,message);
        guildUserStorage.set(userAgainst.id, new VoteAgainstUser(voteType,userAgainst));
        //add initial vote
        guildUserStorage.get(userAgainst.id)['votes']++;
    } 
    //else there is a vote happening, check if voteType = requested vote before incrementing vote
    else{
    var userBeingVoted = guildUserStorage.get(userAgainst.id);
    if(userBeingVoted['type'] != voteType){
        say(message,"There is currently a vote of a different type for this user.");
        return;
    }
    else{ //vote type request matches current existing one against that user
    //add vote to user being voted against
     userBeingVoted['votes']++;
    }//end else
   
    } //end else 
    say(message,guildUserStorage.get(userAgainst.id)['votes'] + ' against ' + guildUserStorage.get(userAgainst.id)['userAgainst']['username']); //please don't remind me how bad this code is
    //if votes == 3, punish


}

function deleteVote(guildMap,guildID,userID,message){
    var aGuildsStorage = guildMap.get(guildID).usersBeingVoted;
    var success = aGuildsStorage.delete(userID);
    if(success != true){
        console.log(say(message,'ERROR DELETING VOTE - PANIC'));
    }
    say(message,'poll expired - polls happening: ' + aGuildsStorage.size);
    //if they have no votes going on
    if(aGuildsStorage.size == 0){
        console.log('no votes in ' + guildID + " ,deleting from main guild map...");
        guildMap.delete(guildID);
    }
}
function GuildVoteStorage(message){
    this.guildName = message.guild.name; //deletable
    this.usersBeingVoted = new Map();
}

function VoteAgainstUser(voteType,userAgainst){
    this.userAgainst = userAgainst;
    this.type = voteType;
    this.votes = 0;
    this.applyPunishment = function(guildID, userID){
        //TODO :')
    }
}

//bot will say the string in 'words' param
function say(message, words){
    message.channel.send(words);
}

// function isValidVote(message){
//     const mutePrefix = "m";
//     const kickPrefix = "k";
//     message.channel.send('this message tagged <@' + message.mentions.users.first().id + ">");

//     var wordArray = message.content.split(' ');
//     var voteType = wordArray[2];
//     say(message, "type is " + voteType);

//     // if(voteType == undefined){
//     //     say(message,"please use !prefix " + mutePrefix + " @user or !prefix "+kickPrefix + " @user");
//     //     return false;
//     // }

//     //if muteprefix or kickprefix is not in 3rd slot
//     if(!(voteType == mutePrefix || voteType == kickPrefix)){
//         say(message,"Invalid prefix. Use !prefix " + mutePrefix + " @user or !prefix "+kickPrefix + " @user");
//         return false;
//     }
//     return true;
// }

module.exports = createVote;