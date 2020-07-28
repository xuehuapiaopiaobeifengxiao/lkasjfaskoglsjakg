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
    if(senderINFO == null) senderINFO = await client.getUser(message.author.id);
    const senderRedeems = senderINFO.redeems ? senderINFO.redeems : 0;

    if (!memberToAdd || isNaN(args[2])) return message.channel.send(`You need to do ${prefix}gift <user> <amount>`);

    if (memberToAdd.id == message.author.id) return message.channel.send(`You can't gift yourself!`);
    if (senderRedeems <= 0) return message.channel.send(`You can't gift redeems, because you have 0 redeems!`);

    if (!amountToAdd || amountToAdd < 1 || isNaN(amountToAdd)) return message.channel.send("Invalid amount! Must be a number!");
    if (senderRedeems < amountToAdd) return message.channel.send(`You don't have enough redeems to do that! You have only ${senderRedeems} so you need ${amountToAdd - senderRedeems} more!`);

    senderINFO.redeems = parseInt(senderRedeems) - parseInt(amountToAdd);
    message.channel.send('It takes time to confirm the payment, please wait ~5 seconds!');
    return client.saveUser(senderINFO).then(async () => {
      await delay(2000);

      //taken money out of senders account

      //send the money to the recipient

      return client.getUser(memberToAdd.id).then(async receiverINFO => {
        let dettlayres = await delay(1500);
        const receiverRedeems = receiverINFO.redeems ? receiverINFO.redeems : 0;
        receiverINFO.redeems = parseInt(receiverRedeems) + parseInt(amountToAdd);
        return client.saveUser(receiverINFO).then(() => {
          const currentAmount = senderINFO.redeems;
          return message.channel.send(`Succsess! Sent ${amountToAdd} To ${memberToAdd}. You now have ${currentAmount} redeems`);
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
  name: "gift",
  category: "Economy",
  description: "gift a user amount of redeems",
  usage: "gift [user] [redeems]"
};
