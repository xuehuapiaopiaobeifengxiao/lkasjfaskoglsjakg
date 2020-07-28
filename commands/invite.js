const discord = require('discord.js')
const config = require('../config.json')
module.exports.run = async (client, message, args, prefix) => {
  const embed = new discord.MessageEmbed()
    .setTitle("Invite")
    .addField("🔗 Bot Invite Link", `[Invite our bot!](https://discord.com/api/oauth2/authorize?client_id=737432024867930175&permissions=8&scope=bot)`)
    .addField("🔗 Official Server Link", `[Join our support server!](https://discord.gg/UenbRPt)`)
    .setColor(config.embed.color)
  return message.channel.send(`https://discord.gg/UenbRPt`, embed);
};


exports.help = {
  name: "invite",
  category: "General",
  description: "Check our invites",
  usage: "invite"
};