const ms = require("parse-ms");
const Discord = require("discord.js");
const config = require("../config.json");

module.exports.run = async (client, message, args, prefix, userResult) => {
  let timeout = 8.28e7;
  let mamount = 500;
  let samount = 200;
  let amount = Math.floor(Math.random() * mamount + samount);
  
   if(userResult == null) userResult = await client.getUser(message.author.id);
  const daily = userResult.lastdaily;
  if (daily !== null && timeout - (Date.now() - daily) > 0) {
    let time = ms(timeout - (Date.now() - daily));

    message.channel.send(`You already collected your Daily Reward, You can come back and collect it in **${time.hours}h ${time.minutes}m ${time.seconds}s**!`);
  } else {
    let embed = new Discord.MessageEmbed()
      .setColor(config.embed.color)
      .setDescription(`**Daily Reward**`)
      .addField(`Collected`, amount);

    userResult.lastdaily = Date.now();
    userResult.balance += amount;
    client.saveUser(userResult).then(() => {
        message.channel.send(embed);
      })
      .catch(err => {
        client.sendSupport(message.channel, err, 2);
      });
  }
};

exports.help = {
  name: "daily",
  category: "Economy",
  description: "Get a certain amount of credits daily",
  usage: "daily"
};