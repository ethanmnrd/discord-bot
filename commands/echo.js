module.exports = {
  name: "echo",
  description: "Echoes the given message",
  execute(msg, args) {
    msg.channel.send(args.join(" "));
  }
};
