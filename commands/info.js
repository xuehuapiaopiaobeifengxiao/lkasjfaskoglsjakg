const data = require("../data/all.json");
const special = require("../data/special.json");
const config = require("../config.json");
const discord = require('discord.js');
module.exports.run = async (client, message, args, prefix, userResult) => {
  let index = null;
  let number = null;
  if(userResult == null) userResult = await client.getUser(message.author.id);
  const pokemons = userResult.pokemons;
  const selected = typeof userResult.selected == "number" ? userResult.selected : null;
  let whichpoke = args.slice(1).join(' ');
  if (whichpoke) {
    whichpoke = whichpoke.toLowerCase();
  }
  if (whichpoke == 'latest' || whichpoke == 'l') { // if info latest
    whichpoke = pokemons.length;
  } else if (isNaN(whichpoke)) return message.reply('Thats not a valid pokemon number');
  if (!pokemons) return message.reply(`You haven't caught a pokemon!`);
  const selected_pokemon = pokemons[selected];
  if (!whichpoke && selected_pokemon !== undefined) { // if selected
    let pokeData = data[parseInt(selected_pokemon.id)];
    if(selected_pokemon.id.includes('_a')) pokeData = pokeData.alolan;
    if(selected_pokemon.id.includes('_s')) pokeData = special[parseInt(selected_pokemon.id)];
    if (!pokeData) return message.channel.send('It seems like something went wrong, please try again, or contact support!');
    const attachment = new discord.MessageAttachment(pokeData.image, "pokemon.png");
    const poke = selected_pokemon;
    if (poke['nickname'] == "") return message.channel.send('Please reset the nickname, it seems like something went wrong!')
    const nickname = poke["nickname"];
    const name = nickname ? `"` + nickname + `"` : pokeData.names.english;
    const level = poke["level"];
    const xp = poke["xp"];
    const iv = poke["iv"];
    const type = pokeData.type.join(' | ');
    const hp = poke["hp"];
    const atk = poke["atk"];
    const def = poke["def"];
    const spatk = poke["spatk"];
    const spdef = poke["spdef"];
    const speed = poke["speed"];
    const hp_power = Math.round(((2 * pokeData.base.hp + hp + (0/ 4) * level) /100) + level + 10);
    const atk_power = Math.round((((2 * pokeData.base.atk + atk + (0/4) * level)/100) + 5) * 1);
    const def_power = Math.round((((2 * pokeData.base.def + def + (0/4) * level)/100) + 5) * 1);
    const spatk_power = Math.round((((2 * pokeData.base.satk+ spatk + (0/4) * level)/100) + 5) * 1);
    const spdef_power = Math.round((((2 * pokeData.base.sdef + spdef + (0/4) * level)/100) + 5) * 1);
    const speed_power = Math.round((((2 * pokeData.base.spd + speed + (0/4) * level)/100) + 5) * 1); 
    const numba = userResult.pokemons.indexOf(poke) + 1
    const embed = new discord.MessageEmbed()
      .setAuthor(`Professor Oak`, `https://cdn.glitch.com/f1149bfb-627b-4ced-8937-e3ca77d8a580%2Fimages%20(8).jpeg?v=1591432874552`)
      .setTitle(`Level ${level} ${name}`)
      .attachFiles([attachment])
      .setImage("attachment://pokemon.png")
      .setColor(config.embed.color)
      .setFooter(`Displaying Pokémon: ${numba}/${pokemons.length}`);
    if (typeof poke['shiny'] == 'number') embed.setDescription(`${xp}/${client.getXpNeededForNextLevel(level)}XP\n**Type**: ${type}\n**HP**: ${hp_power} - ${hp}/31\n**Attack**: ${atk_power} - ${atk}/31\n**Defense**: ${def_power} - ${def}/31\n**Sp. Atk**: ${spatk_power} - ${spatk}/31\n**Sp. Def**: ${spdef_power} - ${spdef}/31\n**Speed**: ${speed_power} - ${speed}/31\n**Total IV**: ${iv}%`)
    else embed.setDescription(`**XP:** ${xp}\n**IV:** ${iv}%\n**Type**: ${type}\n`);
    return message.channel.send(embed);
  }
  if (!whichpoke && selected_pokemon == null && !isNaN(whichpoke)) return message.reply(`You didn't select a pokemon, please select one to view the info from!`);
  if (whichpoke > pokemons.length) return message.reply(`You don't have that pokemon!`);
  whichpoke = Math.round(whichpoke - 1);
  const poke = pokemons[whichpoke];
  if (!poke) return message.channel.send('It seems like something went wrong, please try again, or contact support!');
  number = poke["id"]+'';
  let pokeData = data[parseInt(number)];
  if(number.includes('_a')) pokeData = pokeData.alolan;
  if(number.includes('_s')) pokeData = special[parseInt(number)];
  if(!pokeData) return message.channel.send(`It seems like something went wrong, please try again, or contact support!`);
  const poke_name = pokeData.names.english;
  if (poke_name == undefined) {
    return client.sendSupport(message.channel, `Missing pokemon name of ${number}`, 0);
  }
  const attachment = new discord.MessageAttachment(pokeData.image, "pokemon.png");
  const nickname = poke["nickname"];
  const name = nickname ? `"` + nickname + `"` : pokeData.names.english;
  const level = poke["level"];
  const xp = poke["xp"];
  const iv = poke["iv"];
  const type = pokeData.type.join(' | ');
  const hp = poke["hp"];
  const atk = poke["atk"];
  const def = poke["def"];
  const spatk = poke["spatk"];
  const spdef = poke["spdef"];
  const speed = poke["speed"];
  const hp_power = Math.round(((2 * pokeData.base.hp + hp + (0/ 4) * level) /100) + level + 10);
  const atk_power = Math.round((((2 * pokeData.base.atk + atk + (0/4) * level)/100) + 5) * 1);
  const def_power = Math.round((((2 * pokeData.base.def + def + (0/4) * level)/100) + 5) * 1);
  const spatk_power = Math.round((((2 * pokeData.base.satk+ spatk + (0/4) * level)/100) + 5) * 1);
  const spdef_power = Math.round((((2 * pokeData.base.sdef + spdef + (0/4) * level)/100) + 5) * 1);
  const speed_power = Math.round((((2 * pokeData.base.spd + speed + (0/4) * level)/100) + 5) * 1); 
  const numba = userResult.pokemons.indexOf(poke) + 1
  const embed = new discord.MessageEmbed()
    .setAuthor(`Professor Oak`, `https://cdn.glitch.com/f1149bfb-627b-4ced-8937-e3ca77d8a580%2Fimages%20(8).jpeg?v=1591432874552`)
    .setTitle(`Level ${level} ${name}`)
    .attachFiles([attachment])
    .setImage("attachment://pokemon.png")
    .setColor(config.embed.color)
    .setFooter(`Displaying Pokémon: ${numba}/${pokemons.length}`);
  if (typeof poke['shiny'] == 'number') embed.setDescription(`${xp}/${client.getXpNeededForNextLevel(level)}XP\n**Type**: ${type}\n**HP**: ${hp_power} - ${hp}/31\n**Attack**: ${atk_power} - ${atk}/31\n**Defense**: ${def_power} - ${def}/31\n**Sp. Atk**: ${spatk_power} - ${spatk}/31\n**Sp. Def**: ${spdef_power} - ${spdef}/31\n**Speed**: ${speed_power} - ${speed}/31\n**Total IV**: ${iv}%`)
  else embed.setDescription(`${xp}/${client.getXpNeededForNextLevel(level)}XP\n**Type:** ${type}\n**IV**: ${iv}%`)
  return message.channel.send(embed);
};

exports.help = {
  name: "info",
  category: "Information",
  description: "Get info about a pokemon",
  usage: "info <number>"
};
