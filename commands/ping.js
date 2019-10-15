module.exports = {
  name: "ping",
  description: "Ping!",
  execute(msg, args) {
    msg.channel.send("Pong.");
    console.log(`Received ping from ${msg.author.tag}`);
  }
};
