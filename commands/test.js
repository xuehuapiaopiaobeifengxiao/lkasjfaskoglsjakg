const data = require("../data/all.json");
const mongoose = require("mongoose");
const discord = require('discord.js');

async function delay(delayInms) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, delayInms);
      });
    }
//❌✅
module.exports.run = async (client, message, args, prefix, userResult) => {
  return
  let random = 0;
  let boxes=[];
  let temp=[]
   for (let i = 0; i < 4; i++) {
     random = Math.floor(Math.random() * 100);
     temp=[]
     
   }
  
  
  
  
  
  const embed = new discord.MessageEmbed()
  //.setImage(`https://media.giphy.com/media/JgCZ2hksM1abS/giphy.gif`);
  .setDescription("❌✅")
	// .addFields(
	// 	{ name: '**Credits**', value: '✅' },
	// 	{ name: '**Pokemon**', value: '❌' },
	// 	{ name: '**Redeems**', value: '✅'},
	// ) 
  message.channel.send("❌ ❌ ❌ ❌\n❌ ❌ ❌ ❌\n❌ ❌ ❌ ❌\n❌ ❌ ❌ ❌").then(async(msg) => {
    const embed1 = new discord.MessageEmbed()
    await delay(1400);
    embed1.addFields(
		{ name: '**Credits**', value: '✅❌'},
		{ name: '**Pokemon**', value: '❌❌'},
		{ name: '**Redeems**', value: '✅✅'},
	);
    msg.edit("✅ ❌ ❌ ❌\n❌ ❌ ❌ ❌\n❌ ❌ ❌ ❌\n❌ ❌ ❌ ❌")
  })
  
  
  
};

exports.help = {
  name: "select",
  category: "Gae",
  description: "select a pokemon",
  usage: "select <number>"
};
//https://i.pinimg.com/564x/95/fc/30/95fc304b40461a9922bd1d3aff885496.jpg