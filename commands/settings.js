const discord = require("discord.js");
const db = require("quick.db");
const config = require("../config.json");
module.exports.run = async (client, message, args, prefix) => {
  if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`You haven't got permission to change this!`);
  const wichsetting = args[1];
  return client.getGuild(message.guild.id).then(result => {
    let redirect = result.redirect;
    if (!redirect || redirect.length == 0) redirect = "none";
    else redirect = `<#${redirect}>`;

    let spawndisabled = result.spawndisabled;
    if (!spawndisabled) spawndisabled = [];

    const channel = message.mentions.channels.first() ? message.mentions.channels.first() : message.channel;
    if (wichsetting == "disable") {
      if (result.spawndisabled.includes(channel.id)) return message.channel.send('You have already disabled this channel!');
      result.spawndisabled.push(channel.id);
      return client.saveGuild(result).then(() => {
        return message.channel.send(`Disabled spawns in ${channel.name}`);
      }).catch(err => {
        return client.sendSupport(message.channel, err, 2);
      })
    }

    if (wichsetting == "enable") {
      if (!result.spawndisabled.includes(channel.id)) return message.channel.send('You have not disabled spawns in this channel!');
      const index = result.spawndisabled.indexOf(channel.id);
      if (index > -1) {
        result.spawndisabled.splice(index, 1);
      }
      return client.saveGuild(result).then(() => {
        return message.channel.send(`Enabled spawns in ${channel.name}`);
      }).catch(err => {
        return client.sendSupport(message.channel, err, 2);
      })
    }

    if (!wichsetting) {
      let channels = spawndisabled.length == 0 ? 'none' : '<#' + spawndisabled.join('> | <#') + '>';
      channels = channels.split(`|`);
      let newChannels = '';
      for (let i = 0; i < channels.length; i++) {
        if (newChannels.length < 1000) {
          newChannels += channels[i];
        } else {
          newChannels += `+ ${channels.length - i - 1} others`;
          i = channels.length;
        }
      }
      const embed = new discord.MessageEmbed()
        .setTitle("Settings")
        .setColor(config.embed.color)
        .addField("Redirect channel", redirect)
        .addField(`Spawn disabled channels (${spawndisabled.length} total)`, newChannels)
        .addField("Prefix", prefix);
      return message.channel.send(embed);
    }
  }).catch(err => {
    return client.sendSupport(message.channel, err, 2);
  });
};

exports.help = {
  name: "settings",
  category: "Settings",
  description: "Check your settings",
  usage: "settings"
};
