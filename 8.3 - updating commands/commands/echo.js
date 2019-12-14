module.exports = {
  name: "echo",
  description: "Echoes the given message",
  args: true,
  usage: "<message>",
  execute(msg, args) {
    msg.channel.send(args.join(" "));
  }
};
