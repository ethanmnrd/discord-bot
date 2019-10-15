var { terms } = require("../config.json");

function set_terms(new_terms) {
  terms = new_terms;
  return `Terms have been set.`;
}

module.exports = {
  name: "set_terms",
  description: "Sets the server terms.",
  execute(msg, args) {
    msg.channel.send(set_terms(args.join(" ")));
  }
};
