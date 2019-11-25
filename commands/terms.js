function makeWelcomeChannel(message) {
  var server = message.guild;

  if (!server.channels.find(c => c.name == "welcome" && c.type == "category")) {
    server
      .createChannel("welcome", { type: "category" })
      .then(channel => {
        channel.setPosition(0);
      })
      .catch(console.error);
  } else {
    console.log("welcome category channel already exists");
  }

  if (
    !server.channels.find(
      c => c.name == "welcome-and-rules" && c.type == "text"
    )
  ) {
    server
      .createChannel("welcome-and-rules", { type: "text" })
      .then(channel => {
        let category = server.channels.find(
          c => c.name == "welcome" && c.type == "category"
        );

        if (!category)
          throw new Error("welcome category channel does not exist");
        channel.setParent(category.id);
      })
      .catch(console.error);
  } else {
    console.log("welcome-and-rules text channel already exists");
  }
}

function sendTerms(message) {
  var server = message.guild;

  var { sqlPromise, sayDatabaseError } = require("../requires/sql");
  var sql = `CALL getGuildTerms(${server.id})`;
  var query = sqlPromise(message, sql, "error retrieving guild terms");

  query
    .then(results => {
      var terms = results[0][0].terms;

      const welcomeChannel = server.channels.find(
        c => c.name == "welcome-and-rules" && c.type == "text"
      );

      if (!welcomeChannel)
        throw new Error("welcome-and-rules text channel does not exist");
      welcomeChannel
        .fetchMessages()
        .then(messages => {
          const botMsgs = messages.filter(message => message.author.bot);
          welcomeChannel.bulkDelete(botMsgs);
          console.log("Old terms message(s) deleted.");
        })
        .catch(err => {
          console.error("Deletion of exising bot message failed.");
          console.error("No bot message pre-existing.");
          console.error(err);
        });
      console.log("going to send terms");
      welcomeChannel.send(terms).then(sentMsg => {
        sentMsg
          .react("🆗")
          .then(() => sentMsg.react("❌"))
          .catch(() => console.error(`One of the emojis failed to react.`));
      });
    })
    .catch(error => {
      sayDatabaseError(message, error);
    });
}

module.exports = {
  name: "terms",
  description: "Sends the current terms as a bot message.",
  serverOnly: true,
  execute(message, args) {
    var makePromise = new Promise((resolve, reject) => {
      resolve(makeWelcomeChannel(message));
    });
    makePromise
      .then(results => {
        sendTerms(message);
        message.reply(
          `Terms have been sent in the ${message.guild.channels.find(
            c => c.name == "welcome-and-rules" && c.type == "text"
          )} channel`
        );
      })
      .catch(error => {
        console.log(error);
      });
  }
};
