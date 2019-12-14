

function deleteRole(msg) {
    if(!(global.isOwner(msg))){
        return;
    }
    
  var doFirst = new Promise((resolve, reject) => {
       var role = msg.guild.roles.find(val => val.name === global.gagRoleName); //find gag role name
      if (role != null) {
    //if role exists
    role.delete();
    msg.channel.send("Role has been safely deleted. Goodbye.").then(() => {
       resolve();
    });
  }
  else {
      msg.channel.send("Error deleting role / role does not exist.").then(()=>{
         resolve(); 
      });

  }
  });
  doFirst.then(() => {
    msg.channel.send("<https://discordapp.com/oauth2/authorize?client_id=609057355493146664&scope=bot&permissions=8>")
    .then(() => {
      msg.guild.leave();
    });

  });

  
}

module.exports = {
  name: "delete",
  description: "Safely leaves the server by deleting the role first",
  args: false,
  serverOnly: true,
  execute(msg, args) {
    deleteRole(msg);
  }
};
