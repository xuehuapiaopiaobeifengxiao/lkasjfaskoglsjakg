const db = require('quick.db');
const data = require("../data/all.json");
const special = require("../data/special.json");
const discord = require('discord.js');

module.exports.run = async (client, message, args, prefix, userResult) => {
  const spawned = db.fetch(`lastpok_${message.guild.id}_${message.channel.id}`);
  if (!spawned) return message.channel.send(`There is no wild pokémon in this channel!`);
  let poke = data[parseInt(spawned['id'])];
  if(spawned['id'].includes('_a')) poke = poke.alolan;
  if(spawned['id'].includes('_s')) poke = special[parseInt(spawned['id'])];
  const spawned_name = poke.names.english.toLowerCase();
  const catchTime = parseInt(message.createdTimestamp) - parseInt(spawned['time']);
  let guesspok = args.slice(1).join(' ').toLowerCase();
  if (!guesspok) return message.channel.send('You need to say the name!');
  if (guesspok !== spawned_name) return message.channel.send(`This is the wrong pokemon!`);
  await db.delete(`lastpok_${message.guild.id}_${message.channel.id}`);
  if(userResult == null) userResult = await client.getUser(message.author.id);
  const pokemons = userResult.pokemons;
  if (!pokemons || pokemons.length == 0) return message.channel.send(`You didn't pick a starter yet! (${prefix}start <name>)`);
  const hp = Math.round(Math.random() * 31);
  const atk = Math.round(Math.random() * 31);
  const def = Math.round(Math.random() * 31);
  const spatk = Math.round(Math.random() * 31);
  const spdef = Math.round(Math.random() * 31);
  const speed = Math.round(Math.random() * 31);
  const total = (((hp + atk + def + spatk + spdef + speed) / 186) * 100).toFixed(2)
  const level = Math.round(Math.random() * 39) + 1; // extra 1 to avoid level 0
  userResult.pokemons.set(userResult.pokemons.length, {
    uuid: `${message.channel.id}/${message.id}`,
    id: spawned.id,
    level: level,
    iv: total,
    xp: 0,
    hp: hp,
    atk,
    def,
    spatk,
    spdef,
    speed,
    shiny: 0,
  });
  return client.saveUser(userResult).then(() => {
    const totalPokemons = userResult.pokemons.length;
    let suffix = "th";
    if (totalPokemons == 2) {
      suffix = "nd"
    } else if (totalPokemons == 3) {
      suffix = "rd"
    };
    message.channel.send(`Congratulations ${message.author}! You caught a level ${level} ${poke.names.english}!`);
    let msg = "";
    if (catchTime < 1500 && catchTime > 1000) {
      msg = { "content": `Time to catch: ${catchTime}ms (${spawned_name}) ID:${message.author.id}`, "username": message.author.username, "avatarURL": "https://images.squarespace-cdn.com/content/v1/5a671506f43b55ab0e1db331/1525793883940-D6L4T7ZVSJOTGEWM4UHS/ke17ZwdGBToddI8pDm48kFQQgP34qnCpeHaeAOzTt7pZw-zPPgdn4jUwVcJE1ZvWQUxwkmyExglNqGp0IvTJZamWLI2zvYWH8K3-s_4yszcp2ryTI0HqTOaaUohrI8PICHnXC1b9smDvYLPdL-DS7U1pkhCtl83kemXd5r3C5ngKMshLAGzx4R3EDFOm1kBS/yellow_square.jpg?format=750w" };
    } else if (catchTime < 1000) {
      msg = { "content": `Time to catch: ${catchTime}ms (${spawned_name}) ID:${message.author.id}`, "username": message.author.username, "avatarURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Red.svg/512px-Red.svg.png" };
    }
    if (msg != "") {
      const loghook = new discord.WebhookClient(process.env.cheat_id, process.env.cheat_token);
      return loghook.send(msg);
    } else {
      return;
    }
  }).catch(error => {
    return client.sendSupport(message.channel, error, 2)
  })
};


exports.help = {
  name: "catch",
  category: "General",
  description: "catch a pokemon",
  usage: "catch <name>"
};