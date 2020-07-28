const data = require("../data/all.json");
const special = require("../data/special.json");
const mongoose = require("mongoose");
module.exports.run = async (client, message, args, prefix, userResult) => {
   if(userResult == null) userResult = await client.getUser(message.author.id);
  const pokemons = userResult.pokemons;
  const number = args[1];
  if (!number) return message.reply("Please provide the pokémon number!");
  if (isNaN(number)) return message.reply("That's not a number!");
  const index = Math.round(number - 1);
  if (pokemons.length < index - 1) return message.channel.send("You don't have that pokemon");
  const selected_pokemon = pokemons[index];
  if (!selected_pokemon) return message.channel.send("You don't have that pokemon");
  userResult.selected = index;
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
    return message.channel.send(`You selected your level ${selected_pokemon["level"]} ${poke.names.english}. N°${args[1]}`);
  }).catch(err => {
    return client.sendSupport(message.channel, err, 2);
  });
};

exports.help = {
  name: "select",
  category: "General",
  description: "select a pokemon",
  usage: "select <number>"
};
