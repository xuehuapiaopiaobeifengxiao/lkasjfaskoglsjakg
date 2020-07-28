const discord = require("discord.js");
const config = require("../config.json");

module.exports.run = async (client, message, args, prefix) => {
  const member = message.mentions.members.first() || message.member;
  return client.getUser(member.id).then(userResult => {
    const embed = new discord.MessageEmbed()
      .setTitle(`${member.user.username}'s balance.`)
      .setDescription(`${member.user.username} currently has ${userResult.balance} credits.`)
      .setThumbnail(`https://cdn.glitch.com/f1149bfb-627b-4ced-8937-e3ca77d8a580%2Fcredits.png?v=1591455965091`)
      .setColor(config.embed.color);
    return message.channel.send(embed);
  }).catch(err => {
    return client.sendSupport(message.channel, err, 1);
  });
};

exports.help = {
  name: "bal",
  category: "Economy",
  description: "Check your balance",
  usage: "bal"
};
