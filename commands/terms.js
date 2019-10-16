const { terms } = require("../config.json");

module.exports = {
  name: "terms",
  description: "Sends the current terms as a bot message.",
  serverOnly: true,
  execute(msg, args) {
    msg.channel.send(terms);
  }
};
