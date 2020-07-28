const discord = require("discord.js");
const config = require('../config.json');
const db = require('quick.db');
const data = require('../data/all.json');

module.exports.run = async (client, message, args, prefix, userResult) => {
    const type = args[1];
    if(userResult == null) userResult = await client.getUser(message.author.id);
    const redeems = userResult.redeems ? userResult.redeems : 0;
    const embed = new discord.MessageEmbed();
    embed.setTitle(`Your Redeems: ${redeems} 💸`);
    embed.setDescription(`Redeems are a special type of currency that can be used to get either a pokémon of your choice, or 15000 credits.`)
    embed.addField(`${prefix}redeemspawn <pokémon>`, `Use a redeem to **spawn** a pokémon of your choice.`);
    embed.addField(`${prefix}redeemcredits`, `Use a redeem to get 15,000 credits.`);
    embed.setFooter(`How do I get redeems? Type \`${prefix}help redeem\` to find out!`);
    embed.setColor(config.embed.color);
    return message.channel.send(embed);
};

exports.help = {
  name: "redeem",
  category: "Economy",
  description: "Redeems are a special type of currency that can be used to get either a pokémon of your choice, or 15000 credits. You get redeems for each $ donated, type `donate <amount>` to donate!",
  usage: "redeem"
};