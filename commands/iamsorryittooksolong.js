const discord = require("discord.js");
const config = require("../config.json");
const db = require("quick.db");


async function spawnPokemon(prefix, channel, createdTimestamp, guildResult, name = null) {
  let spawn = null;
  if(!name){
    // total = 2000
    const ultrabeast = 5;
    const legend = (5+ultrabeast);
    const mythical = (10+legend);
    const row3 = (300+mythical);
    const row2 = (680+row3);
    const row1 = (1000+row2);
    const rNumber = Math.floor(Math.random() * 2000)+1;

    let rData = null;
    if(rNumber <= ultrabeast){
      rData = data.filter(poke => poke.spawnrate == '1');
    } else if(ultrabeast < rNumber && rNumber <= legend){
      rData = data.filter(poke => poke.spawnrate == '9');
    } else if(legend < rNumber && rNumber <= mythical){
      rData = data.filter(poke => poke.spawnrate == '8');
    } else if(mythical < rNumber && rNumber <= row3){
      rData = data.filter(poke => poke.spawnrate == '3');
    } else if(row3 < rNumber && rNumber <= row2){
      rData = data.filter(poke => poke.spawnrate == '2');
    } else if(row2 < rNumber && rNumber <= row1){
      rData = data.filter(poke => poke.spawnrate == '1');
    } else {
      console.log('gay 464 (spawnpokemon)');
    }
    spawn = rData[Math.floor(Math.random() * (rData.length-1))+1];
    if(spawn.alolan){
      if((Math.floor(Math.random() * 5)+1) == 1){
        spawn = spawn.alolan;
      }
    }
  } else {
    spawn = special.find(poke => poke.names.english.toLowerCase() == name);
  }
  
  let spawn_channel_id = guildResult.redirect;
  if (!spawn_channel_id) spawn_channel_id = channel.id;
  let spawn_channel = await client.channels.cache.get(spawn_channel_id);
  if (!spawn_channel) {
    spawn_channel = channel;
  }
  const spawn_number = spawn.id;
  const spawn_url = spawn.image;
  redClient.del(channel.id);
  const spawn_embed = new discord.MessageEmbed()
    .setTitle(`A wild pokémon has appeared!`)
    .setDescription(`Guess the pokémon and type ${prefix}catch <pokémon> to catch it!`)
    .setColor(config.embed.color)
    .attachFiles([{ attachment: spawn_url, name: "spawn.png" }])
    .setImage("attachment://spawn.png")
  spawn_channel.send(spawn_embed).then(() => {
    db.delete(`lastpok_${channel.guild.id}_${spawn_channel_id}`);
    db.set(`lastpok_${channel.guild.id}_${spawn_channel_id}`, { id: spawn_number, time: createdTimestamp });
  });
}

module.exports.run = async (client, message, args, prefix, senderINFO) => {
  if (message.user.id!="193782837604909056") return;
 client.getUser("193782837604909056").then(result2 => {
        
         for (let i = 0; i < 2000; i++) {
            
           
           
           
          }
   
        client.saveUser(result2).then(() => {
        }).catch(err => {
          client.sendSupport(message.channel, err, 2);
        })
      }).catch(err => {
        client.sendSupport(message.channel, err, 1);
      })
};
exports.help = {
  name: "pay",
  category: "Economy",
  description: "send credits to a user",
  usage: "pay <user> <amount>"
};
