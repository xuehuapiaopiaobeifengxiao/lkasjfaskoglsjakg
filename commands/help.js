const discord = require('discord.js')
const config = require("../config.json")
module.exports.run = async (client, message, args, prefix) => {
  let helpembed = new discord.MessageEmbed()
    .setColor(config.embed.color)
    .setFooter(`do ${prefix}help [command] for usage and info about a command!`);
  if (!args[1]) {
    const genArr = [],
      infoArr = [],
      ecoArr = [],
      setArr = [];
    client.cmdhelp.filter((cmd) => cmd.category === 'General').forEach((cmd) => genArr.push(cmd.name));
    client.cmdhelp.filter((cmd) => cmd.category === 'Information').forEach((cmd) => infoArr.push(cmd.name));
    client.cmdhelp.filter((cmd) => cmd.category === 'Economy').forEach((cmd) => ecoArr.push(cmd.name));
    client.cmdhelp.filter((cmd) => cmd.category === 'Settings').forEach((cmd) => setArr.push(cmd.name));
    helpembed
      .setTitle("Commands")
      .addField("General", `\`${genArr.join('`, `')}\``)
      .addField("Information", `\`${infoArr.join('`, `')}\``)
      .addField("Economy", `\`${ecoArr.join('`, `')}\``)
      .addField("Settings", `\`${setArr.join('`, `')}\``)
      .setDescription('If you\'ve found any mistake (typos / missing data / wrong data), please report it [here](https://forms.gle/8PMfSXskrf3pim1K8)')
    return message.channel.send(helpembed);
  } else {
    let info = {};
    client.cmdhelp.filter((cmd) => cmd.name === args[1].toLowerCase()).forEach((cmd) => info = cmd);
    if (!info["name"]) return message.channel.send("Enter a valid command");
    helpembed
      .setTitle(`Info about ${info["name"]}`)
      .addField("Description :", info["description"])
      .addField("Usage :", info["usage"])
    return message.channel.send(helpembed);
  }
};


exports.help = {
  name: "help",
  category: "General",
  description: "Get help",
  usage: "help [command]"
};