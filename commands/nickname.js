const data = require("../data/all.json");
const special = require("../data/special.json");
const mongoose = require("mongoose");
module.exports.run = async (client, message, args, prefix, userResult) => {
   if(userResult == null) userResult = await client.getUser(message.author.id);
  if (userResult.selected == null) return message.channel.send(`Select a pokemon first: ${prefix}select <index>`);
  const selected = userResult.pokemons[userResult.selected];
  const toBeNickname = args.slice(1).join(" ");
  if (toBeNickname.includes('`')) return message.channel.send("You can't use '`' in a nickname")
  if (toBeNickname.includes('\n')) return message.channel.send("You cant have new lines in your nickanme!")
  let msg = '';
  if (toBeNickname.length > 30) return message.channel.send(`Nicknames need to be 30 characters or less!`);
  if (toBeNickname == "") {
    msg = ("I cleared that nickname");
    userResult.pokemons.set(userResult.selected, {
      uuid: selected.uuid,
      id: selected.id,
      level: selected.level,
      iv: selected.iv,
      xp: selected.xp,
      hp: selected.hp,
      atk: selected.atk,
      def: selected.def,
      spatk: selected.spatk,
      spdef: selected.spdef,
      speed: selected.speed,
      shiny: selected.shiny,
    });
  } else {
    userResult.pokemons.set(userResult.selected, {
      uuid: selected.uuid,
      id: selected.id,
      level: selected.level,
      iv: selected.iv,
      xp: selected.xp,
      hp: selected.hp,
      atk: selected.atk,
      def: selected.def,
      spatk: selected.spatk,
      spdef: selected.spdef,
      speed: selected.speed,
      shiny: selected.shiny,
      nickname: toBeNickname,
    });
    let poke = null;
    if(selected.id.includes('_s')){
      poke = special[parseInt(selected.id)];
    } else {
      poke = data[parseInt(selected.id)];
    }
    msg = `I set the nickname of your Level ${selected.level} ${poke.names.english} to \`${toBeNickname}\``;
  }
  return client.saveUser(userResult).then(() => {
    return message.channel.send(msg);
  }).catch(err => {
    return client.sendSupport(message.channel, err, 2)
  })
};

exports.help = {
  name: "nickname",
  category: "Information",
  description: "give a pokemon a nickname",
  usage: "nickname [nickname]"
};
