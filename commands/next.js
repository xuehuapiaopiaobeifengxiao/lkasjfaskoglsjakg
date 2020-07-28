const data = require("../data/all.json");
const special = require("../data/special.json");
const mongoose = require("mongoose");
module.exports.run = async (client, message, args, prefix, userResult) => {
   if(userResult == null) userResult = await client.getUser(message.author.id);
  const pokemons = userResult.pokemons;
  const index = userResult.selected;
  if (pokemons.length < index + 2) return message.channel.send("You don't have that pokemon");
  const selected_pokemon = pokemons[index];
  if (!selected_pokemon) return message.channel.send("You don't have that pokemon");
  userResult.selected += 1;
  return client.saveUser(userResult).then(() => {
    let poke = null;
    let alolan = false;
    const id = pokemons[userResult.selected].id;
    if(id.includes('_a')){
      alolan = true;
    }
    if(id.includes('_s')){
      poke = special[parseInt(id)];
    } else {
       poke = data[parseInt(id)];
    }
    if(alolan) poke = poke.alolan;
    return message.channel.send(`You selected your level ${pokemons[userResult.selected].level} ${poke.names.english}. N°${userResult.selected + 1}`);
  }).catch(err => {
    return client.sendSupport(message.channel, err, 2);
  });
};

exports.help = {
  name: "next",
  category: "General",
  description: "cycle though pokemon",
  usage: "next"
};
