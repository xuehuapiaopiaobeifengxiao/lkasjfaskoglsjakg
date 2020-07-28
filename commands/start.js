const discord = require("discord.js");
const data = require("../data/all.json");
const config = require("../config.json");
const db = require("quick.db");

module.exports.run = async (client, message, args, prefix, userResult) => {
  const embeds = new discord.MessageEmbed()
    .setAuthor(`Professor Oak`, `https://cdn.discordapp.com/attachments/716520706543714316/716569156031610882/15909137864863038580706160292221.jpg`)
    .setDescription(`**Welcome to the world of Pokémons!**\nTo begin play, choose one of these pokémon with the \`.pick\` \`<pokemon>\` command, like this: \`.pick squirtle\``)
    .addField(`Generation I`, `Bulbasaur | Charmander | Squirtle`)
    .addField(`Generation II`, `Chikorita | Cyndaquil | Totodile`)
    .addField(`Generation III`, `Treecko | Torchic | Mudkip`)
    .addField(`Generation IV`, `Turtwig | Chimchar | Piplup`)
    .addField(`Generation V`, `Snivy | Tepig | Oshawott`)
    .addField(`Generation VI`, `Chespin | Fennekin | Froakie`)
    .addField(`Generation VII`, `Rowlet | Litten | Popplio`)
    .addField(`Generation VIII`, `Grookey | Scorbunny | Sobble`)
    .setFooter(`Note: Trading in-game content for IRL money or using form of automation such as macros or selfbots to gain an unfair advantage will result in a ban (blacklist) from the bot. Don't cheat!`)
    .setImage(`https://i.imgur.com/oSHo1IZ.png`)
    .setColor(config.embed.color);
  if (!args[1]) return message.channel.send(embeds);
  if(userResult == null) userResult = await client.getUser(message.author.id);
  if (userResult.pokemons.length != 0) return message.channel.send(`${message.author.username}, I am sorry, but I can only give you one pokemon.`);
  let starter = [
    "bulbasaur",
    "charmander",
    "squirtle",
    "chikorita",
    "cyndaquil",
    "totodile",
    "treecko",
    "torchic",
    "mudkip",
    "turtwig",
    "chimchar",
    "piplup",
    "snivy",
    "tepig",
    "oshawott",
    "chespin",
    "fennekin",
    "froakie",
    "rowlet",
    "litten",
    "popplio",
    "grookey",
    "scorbunny",
    "sobble"
  ];
  const pokemon = client.capitalize(args[1]);
  if (!starter.includes(pokemon.toLowerCase())) return message.channel.send("I am sorry, but thats not a starter pokemon.");
  const hp = Math.floor(Math.random() * 31);
  const atk = Math.floor(Math.random() * 31);
  const def = Math.floor(Math.random() * 31);
  const spatk = Math.floor(Math.random() * 31);
  const spdef = Math.floor(Math.random() * 31);
  const speed = Math.floor(Math.random() * 31);
  let id = data.find(poke => poke.names.english == pokemon);
  if (!id) return client.sendSupport(message.channel, `Missing id of ${pokemon}`, 0)
  id = id.id;
  const level = 1;
  const total = (((hp + atk + def + spatk + spdef + speed) / 186) * 100).toFixed(2);
  userResult.pokemons.set(0, {
    uuid: `${message.channel.id}/${message.id}`,
    id,
    level,
    xp: 0,
    iv: total,
    hp: hp,
    atk,
    def,
    spatk,
    spdef,
    speed,
    shiny: 0
  });
  return client.saveUser(userResult).then(() => {
    const embed = new discord.MessageEmbed()
      .setTitle(`Congratulations ${message.author.username}`)
      .setDescription(`You recieved a **Level ${level} ${pokemon}**`)
      .setColor(config.embed.color)
      .setFooter("If you haven't received it, try another starter!");
    return message.channel.send(embed);
  }).catch(err => {
    return client.sendSupport(message.channel, err, 2);
  });
};

exports.help = {
  name: "start",
  category: "General",
  description: "Pick a starter",
  usage: "start <starter name>"
};
