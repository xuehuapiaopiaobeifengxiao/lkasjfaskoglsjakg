const discord = require("discord.js");
const os = require("os");

module.exports.run = async (client, message, args, prefix) => {
      const embed = new discord.MessageEmbed()
        .setAuthor(client.user.username, client.user.avatarURL)
        .setColor("#0ba884")
        .addField("🛰 Memory Usage", `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`, true)
        .addField('🌐 Shards', `${message.guild.shardID + 1}/${client.shard.count}`, true)
        .addField("👤 Users (this shard)", client.users.cache.size, true)
        .addField("🏠 Servers (this shard)", client.guilds.cache.size, true)
        .addField("📚 Library", `Discord.js v.12x`, true)
        .addField("🗒 Node", `${process.version}`, true)
        .addField("📊 CPU", `\`\`\`md\n${os.cpus().map(i => `${i.model}`)[0]}\`\`\``)
        .addField("🔖 Arch", `\`${os.arch()}\``, true)
        .addField("💻 Platform", `\`\`${os.platform()}\`\``, true)
        .addField("🤖 API Latency", `${Math.round(client.ws.ping)}ms`)
        .addField("🔥 Official Server Link", `[Join our support server!](https://discord.gg/NmfW6jF)`)
        .addField("🔥 Bot Invite Link", `[Invite our bot!](https://discord.com/api/oauth2/authorize?client_id=737432024867930175&permissions=2146827775&scope=bot)`)
        .addField("🛠 Developers", `${require('../config.json').developers.join('\n')}`)
      return message.channel.send(embed);
}

exports.help = {
  name: "botinfo",
  category: "General",
  description: "bot info",
  usage: "botinfo"
}