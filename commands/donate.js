const discord = require("discord.js");
const config = require('../config.json');
const db = require('quick.db');
const fetch = require('node-fetch');

module.exports.run = async (client, message, args, prefix) => {
    const amount = Math.round(parseInt(args[1]));
    if (!amount || amount == NaN || amount < 1) return message.channel.send('Invalid amount! Must be a number!');
    const uid = message.author.id;
    const name = message.author.username;
    const avatar = message.author.avatarURL();
    const price = amount;
    const description = `${amount} redeems`;
    const currency = 'USD';
    const credits = amount;
    const body = JSON.stringify({
        uid,
        name,
        avatar,
        price,
        description,
        secret: process.env.SECRET,
        currency,
        credits,
    });
    return fetch('https://shortrsg.cf/createPayment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body,
    }).then(res => {
        if (res.status !== 200) {
            message.channel.send('Failed, please try again');
        } else {
            return res.json();
        }
    }).then(jsonURL => {
        const embed = new discord.MessageEmbed()
            .setTitle("Donate to support the bot and it's developers!")
            .setDescription(`[Click here to donate.](${jsonURL.url})`)
            .addField("Donation Perks", `Donators are rewarded with one redeem for each dollar (USD) donated.`, true)
            .setColor(config.embed.color);
        return message.author.send(embed).then(()=>{
          return message.channel.send(`${message.author}, check your DMs for the donation link!`)
        }).catch(()=>{
          return message.channel.send(`${message.author}, your DM's are disabled, or you blocked me! Please make sure I can dm you!`);
        });
    });
};

exports.help = {
    name: "redeem",
    category: "Economy",
    description: "Redeems pokemon or credits",
    usage: "redeem credits || redeem <pokémon>"
};
