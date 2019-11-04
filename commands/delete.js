var muteRoleName = "bugbot-gag-role";

function deleteRole(msg) {
  var role = msg.guild.roles.find(val => val.name === muteRoleName); //find gag role name
  if (role != null) {
    //if role exists
    role.delete();
    console.log("deleted role");
  }
  return "Gag role has been deleted.";
}

module.exports = {
  name: "delete",
  description: "Deletes specified role (default gag-role)",
  args: false,
  serverOnly: true,
  execute(msg, args) {
    msg.channel.send(deleteRole(msg));
  }
};
