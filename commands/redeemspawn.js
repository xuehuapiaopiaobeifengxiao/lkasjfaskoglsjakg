const discord = require("discord.js");
const config = require('../config.json');
const db = require('quick.db');
const data = require('../data/all.json');

module.exports.run = async (client, message, args, prefix, userResult) => {
  if(userResult == null) userResult = await client.getUser(message.author.id);
  let spawn_pokemon = args.slice(1).join(' ');
  const redeems = userResult.redeems ? userResult.redeems : 0;
  if (redeems <= 0) return message.channel.send(`You don't have any available redeems! Type \`${prefix}help redeem\` to find out how to get redeems.`);
  let alolan = false;
  spawn_pokemon = spawn_pokemon.toLowerCase();
  if(spawn_pokemon.includes('alolan')){
    spawn_pokemon = spawn_pokemon.replace('alolan','').replace(/^\s+|\s+$/g,'');
    alolan = true;
  }
  let spawn_poke = data.find(data => data.names.english.toLowerCase() == spawn_pokemon);
  if (!spawn_poke) return message.channel.send('I can\'t find that pokemon');
  if(alolan) spawn_poke = spawn_poke.alolan;
  if (!spawn_poke) return message.channel.send('I can\'t find that pokemon');
  userResult.redeems -= 1;
  return client.saveUser(userResult).then(async () => {
    let spawn_channel_id = db.get(`redirect_${message.guild.id}`);
    if (!spawn_channel_id) spawn_channel_id = message.channel.id;
    let spawn_channel = await client.channels.fetch(spawn_channel_id);
    if (!spawn_channel) {
      spawn_channel = message.channel;
      db.delete(`redirect_${message.guild.id}`);
    }
    const spawn_level = 1;
    let spawn_iv = 0;
    let spawn_iv_rand = Math.floor(Math.random() * 200) + 25;
    if (spawn_iv_rand < 1001) spawn_iv = Math.floor(Math.random() * 40);
    if (spawn_iv_rand < 900) spawn_iv = Math.floor(Math.random() * 60);
    if (spawn_iv_rand < 600) spawn_iv = Math.floor(Math.random() * 70);
    if (spawn_iv_rand < 300) spawn_iv = Math.floor(Math.random() * 80);
    if (spawn_iv_rand < 100) spawn_iv = Math.floor(Math.random() * 90);
    if (spawn_iv_rand < 50) spawn_iv = Math.floor(Math.random() * 100);
    const spawn_url = spawn_poke.image;
    const spawn_number = spawn_poke.id;
    const spawn_embed = new discord.MessageEmbed()
      .setTitle(`A wild pokémon has appeared!`)
      .setDescription(`Guess the pokémon and type ${prefix}catch <pokémon> to catch it!`)
      .setColor(config.embed.color)
      .setFooter(config.embed.footer, client.user.avatarURL)
      .attachFiles([{ attachment: spawn_url, name: "spawn.png" }])
      .setImage("attachment://spawn.png")
    return spawn_channel.send(spawn_embed).then(() => {
      db.delete(`lastpok_${message.guild.id}_${spawn_channel_id}`);
      return db.set(`lastpok_${message.guild.id}_${spawn_channel_id}`, { id: spawn_number, time: message.createdTimestamp });
    });
  }).catch(err => {
    return client.sendSupport(message.channel, err, 2);
  });
};

exports.help = {
  name: "redeemspawn",
  category: "Economy",
  description: "Spawns a redeemed pokemon",
  usage: "redeemspawn <Pokémon>"
};