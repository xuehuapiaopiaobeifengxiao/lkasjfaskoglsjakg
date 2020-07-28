const db = require("quick.db");
const data = require("../data/all.json");
const special = require("../data/special.json");

String.prototype.hint = function () {
  let str = '';
  for(let i = 0; i < this.length; i++){
    if(Math.floor(Math.random() * 2) == 1){
      str += "_";
    } else {
      str += this.charAt(i);
    }
    if(i == this.length-1){
      if(!str.includes('_')) return this.hint();
      else if(str.split('_').join('').length == 0) return this.hint();
      else return str;
    }
  }
};

module.exports.run = async (client, message, args, prefix) => {
  const spawned = db.get(`lastpok_${message.guild.id}_${message.channel.id}`);
  if (!spawned) return message.channel.send(`There are no wild pokémon in this channel!`);
  let poke = data[parseInt(spawned.id)];
  if(spawned.id.includes('_a')) poke = poke.alolan;
  if(spawned.id.includes('_s')) poke = special[parseInt(spawned.id)];
  if(!poke) return message.channel.send('Woopsie, it seems like something went wrong!');
  const spawned_name = poke.names.english.toLowerCase();
  const sn = client.capitalize(spawned_name);
  const hinted = sn.hint()
  return message.channel.send(`The wild pokémon is \`${hinted}\`!`);
};

exports.help = {
  name: "hint",
  category: "General",
  description: "get hint to catch a pokemon",
  usage: "hint"
};
