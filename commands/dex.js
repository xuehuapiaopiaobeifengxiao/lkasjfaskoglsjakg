const config = require('../config.json')
const data = require("../data/all.json");
const special = require("../data/special.json");
const discord = require('discord.js');

module.exports.run = async (client, message, args, prefix) => {
  let poke = null;
  let alolan = false;
  let shiny = false;
  let whichpokemon = args.slice(1).join(' ').toLowerCase();
  if (!whichpokemon) return message.channel.send("You must provide which pokemon you want information from!");
  if(whichpokemon.includes('alolan')){
    whichpokemon = whichpokemon.replace('alolan','').replace(/^\s+|\s+$/g,'');
    alolan = true;
  }
  if(whichpokemon.includes('shiny')){
    whichpokemon = whichpokemon.replace('shiny','').replace(/^\s+|\s+$/g,'');
    shiny = true;
  }
  if(whichpokemon.includes('_a')){
    whichpokemon = whichpokemon.replace('_a','').replace(/^\s+|\s+$/g,'');
    alolan = true;
  }
  if(isNaN(whichpokemon)) poke = data.find(pok => pok.names.english.toLowerCase() == whichpokemon.toLowerCase());
  else poke = data[whichpokemon];
  if(!poke) poke = data.find(pok => pok.altnames.includes(client.capitalize(whichpokemon)));
  if(!poke) poke = special.find(poke => poke.names.english.toLowerCase() == whichpokemon.toLowerCase());
  if(!poke) return message.channel.send(`I can't find that pokemon!`);
  if(alolan) poke = poke.alolan;
  if(!poke) return message.channel.send(`I can't find that pokemon!`);
  const pname = shiny ? poke.names.english+" ⭐" : poke.names.english
  const attachment = new discord.MessageAttachment(shiny ? poke.shiny : poke.image, "pokemon.png");
  const embed = new discord.MessageEmbed()
    .setTitle(`#${poke.id} - ${pname}`)
    .setAuthor(`Professor Oak`, `https://cdn.glitch.com/f1149bfb-627b-4ced-8937-e3ca77d8a580%2Fimages%20(8).jpeg?v=1591432874552`)
    .setColor(config.embed.color)
    .attachFiles([attachment])
    .setImage("attachment://pokemon.png")
    .setFooter(`Displaying Info For ${poke.names.english}!`)
    .addField(`Alternative Names`, `🇨🇳 ${poke.names.chinese}\n🇯🇵 ${poke.names.japanese}\n🇫🇷 ${poke.names.french}\n🏳 ${poke.altnames.join('\n🏳 ')}`, true)
    .addField(`Type`, `${poke.type.join(' | ')}`, true)
    .addField(`Base Stats`, `**HP:** ${poke.base.hp}\n**ATK:** ${poke.base.atk}\n**DEF:** ${poke.base.def}\n**SP.ATK:** ${poke.base.satk}\n**SP.DEF:** ${poke.base.sdef}\n**SPEED:** ${poke.base.spd}`);

  return message.channel.send(embed);
}


exports.help = {
  name: "dex",
  category: "Information",
  description: "Check provided pokemons information",
  usage: "dex <pokemon name>"
};