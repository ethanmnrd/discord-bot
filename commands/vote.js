var guildMap = new Map();
var db = require("../db");


const mutePrefix = "mute";
const kickPrefix = "kick";

//filters for m and k prefix, then calls addvote() to do all the work
function createVote(message, voteType) {
  var userAgainst = message.mentions.members.first();

  if (userAgainst == undefined) {
    say(message, "TAG SOMEBODY");
    return;
  }
  //say(message, "type is " + voteType);

  //if muteprefix or kickprefix is not in 3rd slot
  if (!(voteType == mutePrefix || voteType == kickPrefix)) {
    say(
      message,
      "Invalid prefix. Use !prefix " +
        mutePrefix +
        " @user or !prefix " +
        kickPrefix +
        " @user"
    );
    return;
  }
  //====== prefix checking done

  //if given guild is not already voting anybody off, create a vote store for them
  if (!guildMap.has(message.guild.id)) {
    guildMap.set(message.guild.id, new GuildVoteStorage(message));
    //say(message,"adding guild to guildmap");
  }
  guildMap.get(message.guild.id).addGuildVote(message, userAgainst, voteType);
}

//userId = user it is against?
//deletes vote from guildmap?
function deleteVote(guildID, userID, message) {
  var aGuildsStorage = guildMap.get(guildID).usersBeingVoted;
  var success = aGuildsStorage.delete(userID);
  if (success != true) {
    console.log(say(message, "ERROR AUTO-DELETING VOTE - PANIC"));
  }
  say(
    message,
    "poll deleted / expired - polls happening: " + aGuildsStorage.size
  );
  //if they have no votes going on
  if (aGuildsStorage.size == 0) {
    console.log("no votes in " + guildID + ", deleting from main guild map...");
    guildMap.delete(guildID);
  }
  console.log(guildMap);
}

function GuildVoteStorage(message) {
  this.guildName = message.guild.name; //deletable
  this.usersBeingVoted = new Map(); //stores VoteAgainstUser objects
  //check usersbeingvoted for whether user is being voted out
  this.addGuildVote = function(message, userAgainst, voteType) {
    //if there is no vote being cast for that user, create one
    if (!this.usersBeingVoted.has(userAgainst.id)) {
      let sql = "CALL getVoteSettings(" + message.guild.id + ")";
      var waitForSettings = sqlPromise(
        message,
        sql,
        "Error retrieving vote settings"
      );
      waitForSettings
        .then(result => {
          say(message, "starting vote against this user");
          var result = result[0][0];
          var timeInSeconds = result.timeLimit / 1000;
          say(
            message,
            "Started vote with " +
              timeInSeconds +
              " seconds (" +
              result.timeLimit +
              " milliseconds)."
          );
          var deleteTimeOut = setTimeout(
            deleteVote,
            result.timeLimit,
            message.guild.id,
            userAgainst.id,
            message
          );
          this.usersBeingVoted.set(
            userAgainst.id,
            new VoteAgainstUser(
              voteType,
              userAgainst,
              deleteTimeOut,
              result.votesNeeded
            )
          );
          this.usersBeingVoted
            .get(userAgainst.id)
            .incrementUserVote(message, voteType, userAgainst);
        })
        .catch(error => {
          console.log("ERROR GETTING VOTE SETTINGS");
          sayDatabaseError(message, error);
          return;
        });
    } //created vote for fresh user
    else {
      this.usersBeingVoted
        .get(userAgainst.id)
        .incrementUserVote(message, voteType, userAgainst);
    }
    console.log(guildMap);
  };
}

function VoteAgainstUser(voteType, userAgainst, deleteTimeOut, votesNeeded) {
  this.userAgainst = userAgainst; //GuildMember
  this.voteType = voteType;
  this.votes = 0;
  this.deleteTimeOut = deleteTimeOut;
  this.votesNeeded = votesNeeded;
  this.usersWhoVoted = new Map();
  this.incrementUserVote = function(message, voteType, userAgainst) {
    if (voteType != this.voteType) {
      //vote types match, increment vote
      say(
        message,
        "there is already a vote of a a different kind (mute / kick) against this user."
      );
      return;
    }

    if (this.usersWhoVoted.has(message.author.id)) {
      say(message, message.author.tag + " has already voted.");
      return;
    }

    console.log(this.deleteTimeOut._idleTimeout);

    this.votes = this.votes + 1; //increment votes by 1
    this.usersWhoVoted.set(message.author.id, undefined);
    say(
      message,
      this.userAgainst.displayName +
        " has " +
        this.votes +
        " votes." +
        " out of " +
        this.votesNeeded
    );
    if (this.votes == this.votesNeeded) {
      // # of votes needed reached apply punishment and clear vote
      if (this.voteType == kickPrefix) {
        //kick them
        say(message, "kicking " + this.userAgainst.displayName + "...");
        this.userAgainst.kick();
      } else if (this.voteType == mutePrefix) {
        say(message, "muting " + this.userAgainst.displayName + "...");
        var muteRole = message.channel.guild.roles.find(
          val => val.name === global.gagRoleName
        );
        this.userAgainst.addRole(muteRole.id);
        this.userAgainst.setVoiceChannel(null);
      }
      clearTimeout(deleteTimeOut);
      deleteVote(message.guild.id, userAgainst.id, message);
    } //end this.votes == this.votesneeded
  };
}

//bot will say the string in 'words' param
function say(message, words) {
  message.channel.send(words);
}

//returns a promise of sql query, which resolves on result.
//says message to channel on error
//places guildid in ? slot.
function sqlPromise(message, sql, errorMessage) {
  var waitForQuery = new Promise((resolve, reject) => {
    db.query(
      sql,
      (error, results, fields) => {
        if (error) {
          console.log(error); //this probably isn't sent. I don't know why. I can send it later on down the function line.
          message.channel.send(errorMessage); //this isn't sent. I don't know why. I can send it later on down the function line though.
          reject(error);
        } else {
          console.log("resolving results");
          resolve(results);
        }
      },
      5000
    );
  });
  return waitForQuery;
}

function sayDatabaseError(message, error) {
  message.channel.send("There was an error accessing the database.");
  console.log(error);
}

// var con = connectToDatabase();

module.exports = {
  name: "vote",
  description: "mutes after x votes",
  args: true,
  serverOnly: true,
  usage: "<mute/kick> <@user>",
  execute(message, args) {
    createVote(message, args[0]);
  }
};
