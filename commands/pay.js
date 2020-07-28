const discord = require("discord.js");
const config = require("../config.json");
const db = require("quick.db");

module.exports.run = async (client, message, args, prefix, senderINFO) => {
  async function start(client, message, args, prefix) {
    async function delay(delayInms) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, delayInms);
      });
    }

    const memberToAdd = message.mentions.users.first() || await client.users.fetch(args[1]);
    if (!memberToAdd) return message.channel.send(`Improper usage, you must **mention** someone to pay!`);
    if (memberToAdd.bot) return message.channel.send("You can't pay a bot!");
    const amountToAdd = parseInt(args[2]);

    if (!memberToAdd || isNaN(args[2])) return message.channel.send(`You need to do ${prefix}pay <user> <amount>`);

    if (memberToAdd.id == message.author.id) return message.channel.send(`You can't pay yourself!`);
    if(senderINFO == null) senderINFO = await client.getUser(message.author.id);
    if (senderINFO.balance <= 0) return message.channel.send(`You can't pay credits, because you have 0 credits!`);

    if (!amountToAdd || amountToAdd < 1 || isNaN(amountToAdd)) return message.channel.send("Invalid amount! Must be a number!");
    if (senderINFO.balance < amountToAdd) return message.channel.send(`You don't have enough credits to do that! You have only ${senderINFO.balance} so you need ${amountToAdd - senderINFO.balance} more!`);

    senderINFO.balance = parseInt(senderINFO.balance) - parseInt(amountToAdd);
    message.channel.send('It takes time to confirm the payment, please wait ~5 seconds!');
    return client.saveUser(senderINFO).then(async () => {
      await delay(2000);

      //taken money out of senders account

      //send the money to the recipient

      return client.getUser(memberToAdd.id).then(async receiverINFO => {
        let dettlayres = await delay(1500);
        receiverINFO.balance = parseInt(receiverINFO.balance) + parseInt(amountToAdd);
        return client.saveUser(receiverINFO).then(() => {
          const currentAmount = senderINFO.balance;
          return message.channel.send(`Succes! Sent ${amountToAdd} To ${memberToAdd}. You now have ${currentAmount} credits`);
        }).catch(err => {
          return client.sendSupport(message.channel, err, 2);
        });
      }).catch(err => {
        return client.sendSupport(message.channel, err, 1);
      });
    }).catch(err => {
      return client.sendSupport(message.channel, err, 2);
    });
  }
  return start(client, message, args, prefix);
};
exports.help = {
  name: "pay",
  category: "Economy",
  description: "send credits to a user",
  usage: "pay <user> <amount>"
};
