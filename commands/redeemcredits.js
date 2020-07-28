const discord = require("discord.js");
const config = require("../config.json");
const db = require("quick.db");
const data = require("../data/all.json");

module.exports.run = async (client, message, args, prefix, userResult) => {
   if(userResult == null) userResult = await client.getUser(message.author.id);
  const spawn_pokemon = args.slice(1).join(" ");
  const redeems = userResult.redeems ? userResult.redeems : 0;
  if (redeems <= 0) return message.channel.send(`You don't have any available redeems! Type \`${prefix}help redeem\` to find out how to get redeems.`);
  userResult.balance += 15000;
  userResult.redeems -= 1;
  return client.saveUser(userResult).then(() => {
      return message.channel.send(`You claimed 15000 credits for a redeem!`);
    }).catch(err => {
      return client.sendSupport(message.channel, err, 2);
    });
};

exports.help = {
  name: "redeemcredits",
  category: "Economy",
  description: "Redeems 15k credits",
  usage: "redeemcredits"
};
