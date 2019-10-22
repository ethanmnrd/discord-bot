
function makeWelcomeChannel(msg) {
  var server = msg.guild;

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

function sendTerms(msg) {
  var server = msg.guild;

  const welcomeChannel = server.channels.find(
    c => c.name == "welcome-and-rules" && c.type == "text"
  );

  if (!welcomeChannel)
    throw new Error("welcome-and-rules text channel does not exist");
  welcomeChannel.send(terms).then(sentMsg => {
    sentMsg
      .react("🆗")
      .then(() => sentMsg.react("❌"))
      .catch(() => console.error(`One of the emojis failed to react.`));
  });
}

module.exports = {
  name: "terms",
  description: "Sends the current terms as a bot message.",
  serverOnly: true,
  execute(msg, args) {
    makeWelcomeChannel(msg);
    sendTerms(msg);
    msg.reply(
      `Terms have been sent in the ${msg.guild.channels.find(
        c => c.name == "welcome-and-rules" && c.type == "text"
      )} channel`
    );
  }
};
