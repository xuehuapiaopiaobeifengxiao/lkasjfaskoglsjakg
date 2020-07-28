const discord = require("discord.js");
const db = require("quick.db");
const config = require("../config.json");
module.exports.run = async (client, message, args, prefix) => {
  if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`You haven't got permission to change this!`);
  return client.getGuild(message.guild.id).then(result => {
      const newprefix = args[1];
      if (!newprefix) return message.channel.send(`That's not a valid prefix!`);
      result.prefix = newprefix;
      return client.saveGuild(result).then(() => {
        return message.channel.send(`Set the new prefix to: ${newprefix}`);
      }).catch(err => {
        return client.sendSupport(message.channel, err, 2);
      });
  }).catch(err => {
    return client.sendSupport(message.channel, err, 1);
  });
};

exports.help = {
  name: "setprefix",
  category: "Settings",
  description: "Set a custom prefix",
  usage: "setprefix <newprefix>"
};
