const db = require("quick.db");
const data = require("../data/all.json");
const special = require("../data/special.json");
const Discord = require("discord.js");

module.exports.run = async (client, message, args, prefix) => {
  return;
  const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
  console.log(collector)
collector.on('collect', m => {
	console.log(`Collected ${m.content}`);
});
  
  
};

exports.help = {
  name: "duel",
  category: "Gae",
  description: "get hint to catch a pokemon",
  usage: "hint"
};
