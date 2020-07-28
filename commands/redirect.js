const discord = require("discord.js");
const db = require("quick.db");
const config = require("../config.json");
module.exports.run = async (client, message, args, prefix) => {
  if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`You haven't got permission to change this!`);
  return client.getGuild(message.guild.id).then(result => {
      const channel = message.mentions.channels.first();
      if (!channel) {
        result.redirect = undefined;
        return client.saveGuild(result).then(() => {
          return message.channel.send("Removed the redirect");
        }).catch(err => {
          return client.sendSupport(message.channel, err, 2);
        });
      } else {
        result.redirect = `${channel.id}`;
        return client.saveGuild(result).then(() => {
          return message.channel.send(`Spawns will be redirected to <#${channel.id}>`);
        }).catch(err => {
          return client.sendSupport(message.channel, err, 2);
        });
      }
  }).catch(err => {
    return client.sendSupport(message.channel, err, 1);
  });
};

exports.help = {
  name: "redirect",
  category: "Settings",
  description: "Let pokemons spawn in 1 channel",
  usage: "redirect <#channel>"
};
