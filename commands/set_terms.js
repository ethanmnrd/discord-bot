function set_terms(new_terms) {
  terms = new_terms;
  return `Terms have been set.`;
}

module.exports = {
  name: "set_terms",
  description: "Sets the server terms.",
  args: true,
  usage: "<new terms>",
  serverOnly: true,
  execute(msg, args) {
    msg.channel.send(set_terms(args.join(" ")));
  }
};
