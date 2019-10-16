const config = require("../config.json");

// sets global prefix for cmds
function set_prefix(new_prefix) {
  if (new_prefix.length != 1) {
    return `Prefix must be of length 1.`;
  } else {
    if (is_num_or_letter(new_prefix)) {
      return `Prefix cannot be letters or numbers.`;
    } else {
      config.prefix = new_prefix;
      console.log(`Current prefix is "${config.prefix}"`);
      return `Current prefix is "${config.prefix}"`;
    }
  }
}

// Checks if char is a num or letter (not allowed)
function is_num_or_letter(char) {
  if (char.length != 1) {
    return `Must be only one character`;
  }
  char = char.toLowerCase().charCodeAt(0);
  return (char >= 97 && char <= 122) || (char >= 48 && char <= 57);
}

module.exports = {
  name: "set_prefix",
  description: "Sets the prefix to the desired character.",
  args: true,
  usage: "<single char>",
  serverOnly: true,
  execute(msg, args) {
    return msg.channel.send(set_prefix(args[0]));
  }
};
