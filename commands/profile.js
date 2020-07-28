const discord = require("discord.js");
const config = require("../config.json");
const Canvas = require("canvas");

const applyText = (canvas, text, defaultFontSize) => {
  const ctx = canvas.getContext("2d");
  do {
    ctx.font = `${(defaultFontSize -= 10)}px Bold`;
  } while (ctx.measureText(text).width > 600);
  return ctx.font;
};

module.exports.run = async (client, message, args, prefix) => {
 const user = message.mentions.users.first() ? message.mentions.users.first() : args[1] ? !!message.guild.members.cache.get(args[1]) ? message.guild.members.cache.get(args[1]).user : message.author : message.author;
  if(!user.avatarURL({format: "png", dynamic: "true", size: 256})) {
        return message.channel.send(`That user does not have an avatar`)
  }
  return message.channel.send(`Generating the profile card please wait.`).then(async themsg => {
      client.getUser(user.id).then(async userResult => {
        let canvas = Canvas.createCanvas(675, 350),
          ctx = canvas.getContext("2d");
        let background = await Canvas.loadImage("https://cdn.glitch.com/3942bd15-25f3-4bd3-aa4f-8d607101fe06%2FProfileCard.png?v=1592145198301");
        const credi = userResult.balance ? userResult.balance : 0;
        //const credit = credit/1000
        //const credits = credit.toFixed(2)
        const redeems = userResult.redeems ? userResult.redeems : 0;
        const donations = userResult.donated ? userResult.donated : 0;
        const pokemons = userResult.pokemons.length;
        // This uses the canvas dimensions to stretch the image onto the entire canvas
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        // Draw username
        ctx.fillStyle = "#ffffff";
        ctx.font = applyText(
          canvas,
          user.username + `#` + user.discriminator,
          35
        );
        ctx.fillText(
          user.username + `#` + user.discriminator,
          canvas.width - 640,
          canvas.height - 105
        );
        // Credits
        ctx.fillStyle = "#ffffff";
        ctx.font = applyText(canvas, credi, 35);
        ctx.textAlign = "middle";
        ctx.fillText(credi, 445, 108, 114);
        // Redeems
        ctx.fillStyle = "#ffffff";
        ctx.font = applyText(canvas, redeems, 35);
        ctx.textAlign = "middle";
        ctx.fillText(redeems, 445, 205, 114);
        // Pokemons
        ctx.fillStyle = "#ffffff";
        ctx.font = applyText(canvas, pokemons, 35);
        ctx.textAlign = "middle";
        ctx.fillText(pokemons, 445, 305, 114);
        // donations
        ctx.fillStyle = "#ffffff";
        ctx.font = applyText(canvas, donations, 35);
        ctx.textAlign = "middle";
        ctx.fillText(donations + "$", 242, 274, 87)


        // Pick up the pen
        ctx.beginPath();
        //Define Stroke Line
        ctx.lineWidth = 10;
        //Define Stroke Style
        ctx.strokeStyle = "#5dbb83";
        // Start the arc to form a circle
        ctx.arc(162, 124, 73, 0, Math.PI * 2, true);
        // Draw Stroke
        ctx.stroke();
        // Put the pen down
        ctx.closePath();
        // Clip off the region you drew on
        ctx.clip();

        let avatar = await Canvas.loadImage(
          user.avatarURL({ format: "png", dynamic: true, size: 256 })
        );
        // Move the image downwards vertically and constrain its height to 200, so it"s a square
        ctx.drawImage(avatar, 88, 51, 146, 146);
        //delay(2000); 
        message.channel.send({
          files: [
            {
              attachment: canvas.toBuffer(),
              name: "profile.png"
            }
          ]
        });
        return themsg.delete();
      }).catch(error => {
      return client.sendSupport(message.channel, error, 1);
    })
  });
  };

exports.help = {
  name: "profile",
  category: "Economy",
  description: "Check your profile card",
  usage: "profile"
};
