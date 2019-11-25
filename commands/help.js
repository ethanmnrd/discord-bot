module.exports = {
  name: "help",
  description: "List all of my commands or info about a specific command.",
  aliases: ["commands"],
  usage: "<command name>",
  // cooldown: 5,
  execute(msg, args) {
    const data = [];
    const { commands } = msg.client;

    if (!args.length) {
      data.push("Here's a list of all my commands:");
      data.push(commands.map(cmd => cmd.name).join(", "));
      data.push(
        `\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`
      );

      return msg.author
        .send(data, { split: true })
        .then(() => {
          if (msg.channel.type === "dm") return;
          msg.reply("I've sent you a DM with all my commands!");
        })
        .catch(error => {
          console.error(
            `Could not send help DM to ${msg.author.tag}.\n`,
            error
          );
          msg.reply("it seems like I can't DM you! Do you have DMs disabled?");
        });
    }

    const name = args[0].toLowerCase();
    const cmd =
      commands.get(name) ||
      commands.find(c => c.aliases && c.aliases.includes(name));

    if (!cmd) {
      return msg.reply("that's not a valid command!");
    }

    data.push(`**Name:** ${cmd.name}`);

    if (cmd.aliases) data.push(`**Aliases:** ${cmd.aliases.join(", ")}`);
    if (cmd.description) data.push(`**Description:** ${cmd.description}`);
    if (cmd.usage) data.push(`**Usage:** ${prefix}${cmd.name} ${cmd.usage}`);

    data.push(`**Cooldown:** ${cmd.cooldown || 3} second(s)`);

    msg.channel.send(data, { split: true });
  }
};
