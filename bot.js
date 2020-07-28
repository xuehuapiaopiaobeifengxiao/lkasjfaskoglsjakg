require('dotenv').config();
const discord = require('discord.js');
const db = require('quick.db');
const ms = require('parse-ms');
const fs = require('fs');
const mongoose = require('mongoose');
const DBL = require('dblapi.js');
const fetch = require('node-fetch');  
const Redis = require("ioredis");
const redClient = new Redis({
  port: process.env.redis_port,
  host: process.env.redis_host,
  password: process.env.redis_password
});
const { createCanvas, loadImage } = require('canvas');

const loghook = new discord.WebhookClient(process.env.log_id, process.env.log_token);
const errhook = new discord.WebhookClient(process.env.err_id, process.env.err_token);
const joinhook = new discord.WebhookClient(process.env.join_id, process.env.join_token);

const data = require('./data/all.json');
const special = require('./data/special.json');
const config = require('./config.json');
const mongodb_user = require('./mongodb/user');
const mongodb_guild = require('./mongodb/guild');
const Auctions = require("./Auctions.js");

const client = new discord.Client({ 
  ws: { 
    intents: ['GUILDS', 'GUILD_MESSAGES'] 
  } 
});
client.getXpNeededForNextLevel = (level) => {
  return Math.round(750 * Math.pow(1.04, level));
}
client.saveUser = (data) => {
  return new Promise((resolve, reject) => {
    if (!data) return reject({ code: 0, details: 'Missing user data to save' });
    data.save().catch(err => reject({ code: 1, details: err }));
    resolve();
  });
};
client.getUser = (id) => {
  return new Promise((resolve, reject) => {
    if (!id) return reject('Missing user id to get data for', 0);
    mongodb_user.findOne({ _id: id }).then(data => {
      if (data == null) {
        data = new mongodb_user({
          _id: id,
          pokemons: [],
          balance: 0,
        })
      }
      return resolve(data);
    }).catch(err => reject({ code: 1, details: err }));
  });
};
client.saveGuild = (data) => {
  return new Promise((resolve, reject) => {
    if (!data) return reject('Missing guild data to save', 0);
    data.save().catch(err => reject({ code: 1, details: err }));
    resolve();
  });
};
client.getGuild = (id) => {
  return new Promise((resolve, reject) => {
    if (!id) return reject('Missing guild id to get data for', 0);
    mongodb_guild.findOne({ _id: id }).then(data => {
      if (data == null) {
        data = new mongodb_guild({
          _id: id,
          spawndisabled: []
        })
      }
      return resolve(data);
    }).catch(err => reject(err, 1));
  });
};
client.capitalize = (string) => {
  let str = '';
  string = string.split(' ');
  for (let i = 0; i < string.length; i++) {
    str += string[i].charAt(0).toUpperCase() + string[i].slice(1).toLowerCase() + ' ';
    if (i == string.length - 1) {
      string = str.split('-');
      str = '';
      for (let i = 0; i < string.length; i++) {
        str += string[i].charAt(0).toUpperCase() + string[i].slice(1) + '-';
        if (i == string.length - 1) {
          return str.slice(0, -2);
        }
      }
    }
  }
}
client.sendSupport = async (channel, err, code) => {
  errhook.send(`\`${require('./data/errors.json')[code]}\`: ${err}`)
  channel.send(`Oops, it seems like something went wrong, please contact support! || ${err} ||`);
};
client.log = async (guild, channel, author, command, content, date) => {
  console.log(guild, channel, author, command, content, date);
  let count = parseInt(await getRedis('count'));
  if (!count) count = 0;
  count += 1;
  count = count.toString();
  setRedis('count', count);
}
client.AdminPermsUsed = (command,message) => {
 
  
  const filter = response => {
	return;
};
  
//    message.author.send(`You have used the command:\n*${message.content}*\nPlease give the reason you did this:`).then(() => {
// 	message.author.awaitMessages( { max: 1, time: 30000, errors: ['time'] })
// 		.then(collected => {
// 			console.log(collected)
// 		})
// 		.catch(collected => {
// 			userReason="No Reason Provided";
//       embedcol="fc0303";
// 		});
// });
  
  let userReason="No Reason Provided";
  let embedcol="fc0303";
  // collector.on('collect', m => {
  //   console.log(m.content)
  // if (m.content==""||m.content==null){
  //     userReason="No Reason Provided";
  //     embedcol="fc0303";
  //   }else{
  //     userReason=m.content;
  //     embedcol="fcba03";
  //   }
  // });
  
  const info={
  "embeds": [{
    "title": `Admin Command ${command} used!`,
    "color": embedcol,
    "fields": [
      {
        "name": "user:",
        "value": `${message.author.id}\n${message.author.username}`,
        "inline": true
      },
      {
        "name": "command:",
        "value": message.content,
        "inline": true
      },
      {
        "name": "reason:",
        "value": userReason,
        "inline": true
      }
      ]
  }]
}
  
  const loghook1 = new discord.WebhookClient(process.env.admin_log1_id, process.env.admin_log1_token);
  const loghook2 = new discord.WebhookClient(process.env.admin_log2_id, process.env.admin_log2_token);
  loghook1.send(info);
  loghook2.send(info);
}
mongoose.connect(process.env.mongo_atlas, { useNewUrlParser: true, useUnifiedTopology: true });
const dbl = new DBL(process.env.dbl_webhookName);
dbl.on('posted', () => {
  console.log('Server count posted!');
})
client.on("shardReady", async (id) => {
  const done = await require('./mongodb/user.js').updateOne({_id:'425165710847770634'},{$inc: {balance: 1}}).nModified == 1
  client.loadCommands(id + 1);
  client.user.setActivity(`.help | pokecord2.me | Shard: ${id + 1}`);
  db.set(`restart`, false);
  db.set("tradeRequests", []);
  if (client.user.id == '737432024867930175') {
    dbl.postStats(client.guilds.cache.size, id, client.shard.count);
    setInterval(() => {
      dbl.postStats(client.guilds.cache.size, id, client.shard.count);
    }, 1800000);
  }
});

client.commands = new discord.Collection();
client.cmdhelp = new discord.Collection();

client.loadCommands = (id) => {
  redClient.flushdb(function (err, succeeded) {
    if (succeeded) console.log(`Flushed redclient db for ${id}`);
  });
  fs.readdir('./commands/', (err, files) => {
    if (err) console.error(err);

    let jsFiles = files.filter(f => f.split('.').pop() === 'js');

    console.log(`LOG Loading a total of ${jsFiles.length} commands for shard ${id}.`);

    jsFiles.forEach(async (f, i) => {
      delete require.cache[require.resolve(`./commands/${f}`)];
      let props = require(`./commands/${f}`);
      client.commands.set(f, props);
      client.cmdhelp.set(props.help.name, props.help);
    });
  });
};

client.on('message', async message => {
  if (db.get(`t${message.author.id}-${message.channel.id}`)) {
    const currntUser = db.get(`t${message.author.id}-${message.channel.id}`);
    if (Date.now() - currntUser.start > 300000) {
      db.delete(`t${message.author.id}-${message.channel.id}`);
      db.delete(`t${currntUser.tradingWith}-${message.channel.id}`);
    }
  }
  if (message.content.split(' ')[0] == "eval" && process.env.spawnperm.includes(message.author.id)) {
    try {
      const code = message.content.split(' ').slice(1).join(" ");
      let evaled = eval(code);

      if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);

      message.channel.send(clean(evaled), { code: "xl" });
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
    client.AdminPermsUsed("Eval",message)
  }
  let blacklist = db.get('blacklist');
  if (!blacklist) {
    db.set('blacklist', []);
    blacklist = [];
    client.AdminPermsUsed("Blacklist",message)
  };
  if (blacklist.includes(message.author.id)) return;
  if (message.author.id == '548556462042120224') {
    let args = message.content.slice(1).trim().split(/ +/g);
    if (message.content.startsWith(".addredeem")) {
      const memberToAdd = await client.users.fetch(args[1]);
      const redeemsToAdd = parseInt(args[2]);
   /*   if(redeemsToAdd.includes("-")) {
        return;
      }*/
      if (!redeemsToAdd || !memberToAdd) return;
      client.getUser(memberToAdd.id).then(result2 => {
        const redeems = result2.redeems ? result2.redeems : 0;
        const donated = result2.donated ? result2.donated : 0;
        result2.redeems = (redeems + redeemsToAdd);
        result2.donated = (donated + redeemsToAdd);
        client.saveUser(result2).then(() => {
          memberToAdd.send(`Thank you for donateing! We have added ${redeemsToAdd} redeems to your account!`);
          message.channel.send(`Gave ${memberToAdd} ${redeemsToAdd} redeems`);
        }).catch(err => {
          client.sendSupport(message.channel, err, 2);
        })
      }).catch(err => {
        client.sendSupport(message.channel, err, 1);
      })
    }
  }
  if (message.channel.type !== 'text' && message.channel.type !== 'news' || message.author.bot && message.author.id !== '722802725804572751') return;
  if (!message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES') || !message.channel.permissionsFor(message.guild.me).has('VIEW_CHANNEL')) return;
  let guildResult = JSON.parse(await getRedis(`g${message.guild.id}`));
  if (!guildResult || guildResult == '') {
    guildResult = await client.getGuild(message.guild.id);
    setRedis(`g${message.guild.id}`, JSON.stringify(guildResult));
  }
  let prefix = guildResult.prefix;
  if (!prefix) prefix = config.client.prefix;
  if (message.content.includes('catch') && message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    let command = args[0];
    if (!command) return;
    if (command == 'catch') {
      const cmd = client.commands.get("catch.js");
      return cmd.run(client, message, args, prefix, null);
    }
  }
  const spawndisabled = guildResult.spawndisabled ? guildResult.spawndisabled : [];
  if (message.mentions.has(client.user.id) && message.content.includes(client.user.id)) message.channel.send(`My prefix for this server is \`${prefix}\``);

  let userResult = null;
  let userSelected = JSON.parse(await getRedis(`s${message.author.id}`));
  if (!userSelected || userSelected == '') {
    if (userResult == null) userResult = await client.getUser(message.author.id);
    if (typeof userResult.selected == 'number') {
      userSelected = userResult.pokemons[userResult.selected];
      if (userSelected && !userSelected.uuid) userSelected.uuid = `${message.channel.id}/${message.id}`;
      if (!userSelected) {
        userResult.selected = undefined;
        await client.saveUser(userResult);
      } else {
        userSelected.last = 0;
        setRedis(`s${message.author.id}`, JSON.stringify(userSelected));
      }
    }
  }
  if (userSelected) userResult = await levelPokemon(message.author.id, message.channel, userSelected, userResult);
  let totalMessagesSent = await getRedis(message.channel.id);
  if (totalMessagesSent) {
    totalMessagesSent++;
    setRedis(message.channel.id, totalMessagesSent);
  } else if (!spawndisabled.includes(message.channel.id)) {
    setRedis(message.channel.id, 1);
  };
  if ((Math.floor(Math.random() * config.spawnrates.maxMessages) + 25) < totalMessagesSent && !spawndisabled.includes(message.channel.id)) {
    if (!message.channel.permissionsFor(message.guild.me).has('ATTACH_FILES')) return message.channel.send(config.noPermission.ATTACH_FILES);
    if (!message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS')) return message.channel.send(config.noPermission.EMBED_LINKS);
    await spawnPokemon(prefix, message.channel, message.createdTimestamp, guildResult);
  };
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  let command = args[0];
  if (!command) return;
  command = command.toLowerCase();
  if (!message.content.startsWith(prefix)) return;
  if (!message.channel.permissionsFor(message.guild.me).has('ATTACH_FILES')) return message.channel.send(config.noPermission.ATTACH_FILES);
  if (!message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS')) return message.channel.send(config.noPermission.EMBED_LINKS);
  //command forwarding
  for (let i = 0; i < config.abbreviations.length; i++) {
    if (config.abbreviations[i][0] == command) { command = config.abbreviations[i][1] };
  };
  if (command == 'disable') {
    command = 'settings';
    args.unshift('settings');
  } else if (command == 'enable') {
    command = 'settings';
    args.unshift('settings');
  }
  if (command == 'settings' || command == 'setprefix' || command == 'redirect') {
    redClient.del(`g${message.guild.id}`);
  }
  if (command == 'select' || command == 'next' || command == 'back' || command == 'info' || command == 'nickname' || command == 'pokemon' || command == 'trade') {
    await saveCachedPokemon(message.author.id);
  }
  if (command == 'resetmycacheddata') {
    redClient.del(`g${message.guild.id}`);
    redClient.del(`s${message.guild.id}`);
    const trade = db.get(`t${message.author.id}-${message.channel.id}`);
    if (trade) {
      db.delete(`t${message.author.id}-${message.channel.id}`);
      db.delete(`t${trade.tradingWith}-${message.channel.id}`)
    }
    message.channel.send('Done');
  }

  const cmd = client.commands.get(command + ".js");
  if (cmd) {
    if (db.get(`restart`) !== false) {
      if (db.get(`restart`) == true) return message.reply('Planned restart eta ~ 3 minutes!');
      else return message.reply(db.get(`restart`));
    }
    client.log(message.guild.id, message.channel.id, message.author.id, cmd.help.name, message.content, message.createdAt);
    cmd.run(client, message, args, prefix, userResult);
    var today = new Date(),
      h = checkTime(today.getHours()),
      m = checkTime(today.getMinutes()),
      s = checkTime(today.getSeconds());
    const embed = new discord.MessageEmbed()
      .setColor(config.embed.color)
      .setAuthor(message.author.tag, message.author.avatarURL())
      .setTitle(message.author.id)
      .addField('guild/channel', `${message.guild.name}(${message.guild.id})/${message.channel.name}(${message.channel.id})`)
      .addField(cmd.help.name, message.content)
    return loghook.send(embed);
  }
  if (message.content == prefix + "ping") message.channel.send(`Pong!\nBot: \`${Date.now() - message.createdTimestamp} ms\`\nLatency: \`${Math.round(client.ws.ping)}ms\``);

  if (!process.env.botowners.includes(message.author.id)) return;

  if (command == "blacklist" && process.env.blacklistperm.includes(message.author.id)) {
    const member = message.mentions.users.first() || await client.users.fetch(args[1]);
    if (!member) return message.channel.send("Invalid member!");
    if (blacklist.includes(member.id)) return message.channel.send(`${member} is already blacklisted!`);
    blacklist.push('blacklist', member.id);
    db.set('blacklist', blacklist);
    message.channel.send(`Blacklisted ${member}!`);
  }
  if (command == "whitelist" && process.env.blacklistperm.includes(message.author.id)) {
    const member = message.mentions.users.first() || await client.users.fetch(args[1]);
    if (!member) return message.channel.send("Invalid member!");
    if (!blacklist.includes(member.id)) return message.channel.send(`${member} is not blacklisted!`);
    const index = blacklist.indexOf(member.id);
    if (index > -1) {
      blacklist.splice(index, 1);
    }
    db.set('blacklist', blacklist);
    message.channel.send(`Removed ${member} from the blacklist!`);
  }

  if (command == "addmoney" && process.env.moneyperm.includes(message.author.id)) {
    const moneyToAdd = parseInt(args[2]);
    const memberToAdd = message.mentions.users.first() || await client.users.fetch(args[1]);
    if (!moneyToAdd || !memberToAdd) return;
    client.getUser(memberToAdd.id).then(result2 => {
      const balance = result2.balance;
      result2.balance = Math.round(balance + moneyToAdd);
      client.saveUser(result2).then(() => {
        message.channel.send(`Gave ${memberToAdd} ${moneyToAdd} credits`);
      }).catch(err => {
        client.sendSupport(message.channel, err, 2);
      })
    }).catch(err => {
      client.sendSupport(message.channel, err, 1);
    })
    client.AdminPermsUsed("AddMoney",message)
  }
  if (command == "removemoney" && process.env.moneyperm.includes(message.author.id)) {
    const moneyToRemove = parseInt(args[2]);
    const memberToRemove = message.mentions.users.first() || await client.users.fetch(args[1]);
    if (!moneyToRemove || !memberToRemove) return;
    client.getUser(memberToRemove.id).then(result2 => {
      if (moneyToRemove > result2.balance) return message.channel.send(`The user does not have that many credits, they only have ${result2.balance}`);
      const balance = result2.balance;
      result2.balance = Math.round(balance - moneyToRemove);
      client.saveUser(result2).then(() => {
        message.channel.send(`Removed ${moneyToRemove} credits from ${memberToRemove}`);
      }).catch(err => {
        client.sendSupport(message.channel, err, 2);
      })
    }).catch(err => {
      client.sendSupport(message.channel, err, 1);
    })
    client.AdminPermsUsed("RemoveMoney",message)
  }

  if (command == "addredeem" && process.env.redeemperm.includes(message.author.id)) {
    const redeemsToAdd = parseInt(args[2]);
    const memberToAdd = message.mentions.users.first() || await client.users.fetch(args[1]);
    if (!redeemsToAdd || !memberToAdd) return;
    client.getUser(memberToAdd.id).then(result2 => {
      const redeems = result2.redeems ? result2.redeems : 0;
      result2.redeems = (redeems + redeemsToAdd);
      client.saveUser(result2).then(() => {
        message.channel.send(`Gave ${memberToAdd} ${redeemsToAdd} redeems`);
      }).catch(err => {
        client.sendSupport(message.channel, err, 2);
      })
    }).catch(err => {
      client.sendSupport(message.channel, err, 1);
    })
    client.AdminPermsUsed("AddRedeem",message)
  }

  if (command == "removeredeem" && process.env.redeemperm.includes(message.author.id)) {
    const redeemsToRemove = parseInt(args[2]);
    const memberToRemove = message.mentions.users.first() || await client.users.fetch(args[1]);

    if (!redeemsToRemove || !memberToRemove) return;
    client.getUser(memberToRemove.id).then(result2 => {
      const redeems = result2.redeems ? result2.redeems : 0;
      if (redeems > result2.redeems) return message.channel.send(`The user does not have that many redeems, they only have ${result2.redeems}`);
      result2.redeems = (redeems - redeemsToRemove);
      client.saveUser(result2).then(() => {
        message.channel.send(`Removed ${redeemsToRemove} redeems from ${memberToRemove} `);
      }).catch(err => {
        client.sendSupport(message.channel, err, 2);
      })
    }).catch(err => {
      client.sendSupport(message.channel, err, 1);
    })
client.AdminPermsUsed("RemoveRedeem",message)
  }
  if (command == "userinfo") {
    const memberToCheck = message.mentions.users.first() || await client.users.fetch(args[1]);
    if (!memberToCheck) return;
    client.getUser(memberToCheck.id).then(result2 => {
      var userdata_embed = new discord.MessageEmbed()
        .setTitle(`Info`)
        .setDescription(`ID- ${result2._id}\nPokemon Count- ${result2.pokemons.length}\nRedeem(s)- ${result2.redeems ? result2.redeems : 0}\nBalance- ${result2.balance}\nLast Daily- ${result2.lastdaily}\nDonated - ${result2.donated}\nClaimed - ${result2.claimed}`)
      message.channel.send(userdata_embed);
    }).catch(err => {
      client.sendSupport(message.channel, err, 1);
    })
  }
  if (command == "downloaduser") {
    
    
    const memberToCheck = message.mentions.users.first() || await client.users.fetch(args[1]);
    if (!memberToCheck) return;
    const path=`infoFor.${memberToCheck.id}.txt`;
    //create file with userdata
    client.getUser(memberToCheck.id).then(result2 => {
      fs.appendFile(path, JSON.stringify(result2), function (err) {
        if (err) throw err;
        console.log('Saved!');
      })
      message.channel.send("Testing message.", { files: [path] });
      fs.unlinkSync(path)
      console.log('removed');
    }).catch(err => {
      client.sendSupport(message.channel, err, 1);
    })
  }
  if (command == "reset" && process.env.resetperm.includes(message.author.id)) {
    var member = message.mentions.users.first() || client.users.cache.get(args[1]);
    const x = await client.getUser(member.id);
    console.log(x);
    mongodb_user.deleteMany({ _id: member.id }).then(() => {
      message.reply(`Ups did i reset ${member}?`);
    }).catch(err => {
      client.sendSupport(message.channel, err, 2);
    });
    client.AdminPermsUsed("Reset",message)
  };
});

async function spawnPokemon(prefix, channel, createdTimestamp, guildResult, name = null) {
  let spawn = null;
  if(!name){
    // total = 2000
    const ultrabeast = 5;
    const legend = (5+ultrabeast);
    const mythical = (10+legend);
    const row3 = (300+mythical);
    const row2 = (680+row3);
    const row1 = (1000+row2);
    const rNumber = Math.floor(Math.random() * 2000)+1;

    let rData = null;
    if(rNumber <= ultrabeast){
      rData = data.filter(poke => poke.spawnrate == '1');
    } else if(ultrabeast < rNumber && rNumber <= legend){
      rData = data.filter(poke => poke.spawnrate == '9');
    } else if(legend < rNumber && rNumber <= mythical){
      rData = data.filter(poke => poke.spawnrate == '8');
    } else if(mythical < rNumber && rNumber <= row3){
      rData = data.filter(poke => poke.spawnrate == '3');
    } else if(row3 < rNumber && rNumber <= row2){
      rData = data.filter(poke => poke.spawnrate == '2');
    } else if(row2 < rNumber && rNumber <= row1){
      rData = data.filter(poke => poke.spawnrate == '1');
    } else {
      console.log('gay 464 (spawnpokemon)');
    }
    spawn = rData[Math.floor(Math.random() * (rData.length-1))+1];
    if(spawn.alolan){
      if((Math.floor(Math.random() * 5)+1) == 1){
        spawn = spawn.alolan;
      }
    }
  } else {
    spawn = special.find(poke => poke.names.english.toLowerCase() == name);
  }
  
  let spawn_channel_id = guildResult.redirect;
  if (!spawn_channel_id) spawn_channel_id = channel.id;
  let spawn_channel = await client.channels.cache.get(spawn_channel_id);
  if (!spawn_channel) {
    spawn_channel = channel;
  }
  const spawn_number = spawn.id;
  const spawn_url = spawn.image;
  redClient.del(channel.id);
  const spawn_embed = new discord.MessageEmbed()
    .setTitle(`A wild pokémon has appeared!`)
    .setDescription(`Guess the pokémon and type ${prefix}catch <pokémon> to catch it!`)
    .setColor(config.embed.color)
    .attachFiles([{ attachment: spawn_url, name: "spawn.png" }])
    .setImage("attachment://spawn.png")
  spawn_channel.send(spawn_embed).then(() => {
    db.delete(`lastpok_${channel.guild.id}_${spawn_channel_id}`);
    db.set(`lastpok_${channel.guild.id}_${spawn_channel_id}`, { id: spawn_number, time: createdTimestamp });
  });
}

async function levelPokemon(id, channel, userSelected, userResult) {
  return new Promise(async (resolve, reject) => {
    try {
      const selected_lvl = userSelected.level;
      const selected_last = userSelected.last;
      if (selected_lvl !== 100) {
        const selected_lvl_needed = client.getXpNeededForNextLevel(selected_lvl);
        const selected_xp = userSelected.xp;
        const selected_id = userSelected.id;
        if (selected_xp >= selected_lvl_needed && selected_lvl !== 100) {
          let poke = null;
          if(selected_id.includes("_s")){
            poke = special[parseInt(selected_id)];
          } else if (selected_id.includes("_a")){
            poke = data[parseInt(selected_id)].alolan;
          } else {
            poke = data[parseInt(selected_id)];
          }
          userSelected.xp = 0;
          userSelected.level = selected_lvl + 1;
          if (userResult == null) userResult = await client.getUser(id);
          if(!userResult.pokemons[userResult.selected].uuid || userResult.pokemons[userResult.selected].uuid == userSelected.uuid){
            channel.send(`Congratulations <@!${id}>! Your \`${poke.names.english}\` has just leveled up to ${selected_lvl + 1}!`);
            userResult.pokemons.set(userResult.selected, {
              uuid: userSelected.uuid,
              id: userSelected.id,
              level: userSelected.level,
              iv: userSelected.iv,
              xp: userSelected.xp,
              hp: userSelected.hp,
              atk: userSelected.atk,
              def: userSelected.def,
              spatk: userSelected.spatk,
              spdef: userSelected.spdef,
              speed: userSelected.speed,
              shiny: userSelected.shiny,
            });
            await client.saveUser(userResult);
            await setRedis(`s${id}`, userSelected);
            resolve(userResult);
          } else {
            await redClient.del(`s${id}`);
            resolve(userResult);
          }
        } else if ((Date.now() - selected_last) > 1000 && selected_lvl !== 100) {
          userSelected.xp = selected_xp + 15;
          userSelected.last = Date.now();
          await setRedis(`s${id}`, JSON.stringify(userSelected));
          resolve(userResult);
        } else {
          resolve(userResult);
        }
      } else {
        resolve(userResult);
      }
    } catch (err) {
      reject(err);
    }
  })
}

async function saveCachedPokemon(id, userResult) {
  return new Promise(async (resolve, reject) => {
    try {
      const userSelected = JSON.parse(await redClient.get(`s${id}`));
      await redClient.del(`s${id}`);
      if (userResult == null) userResult = await client.getUser(id);
      const activeSelected = userResult.pokemons[userResult.selected];
      if(typeof userResult.selected == "number" && activeSelected && userSelected){
        if(!userResult.pokemons[userResult.selected].uuid || activeSelected.uuid == userSelected.uuid){
          userResult.pokemons.set(userResult.selected, {
            uuid: userSelected.uuid,
            id: userSelected.id,
            level: userSelected.level,
            xp: userSelected.xp,
            iv: userSelected.iv,
            hp: userSelected.hp,
            atk: userSelected.atk,
            def: userSelected.def,
            spatk: userSelected.spatk,
            spdef: userSelected.spdef,
            speed: userSelected.speed,
            shiny: userSelected.shiny,
            nickname: userSelected.nickname
          });
          await client.saveUser(userResult);
          resolve(userResult);
        } else {
          await redClient.del(`s${id}`);
          resolve(userResult);
        }
      } else {
        resolve();
      }
    } catch (err) {
      reject(err);
    }
  });
}

function checkTime(i) {
  return (i < 10) ? "0" + i : i;
}

function clean(text) {
  if (typeof (text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
    return text;
}

client.login(process.env.token);

function wait(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};
async function fetchReactedUsers(reaction, after) {
  const opts = { limit: 100, after };
  const reactions = await reaction.users.fetch(opts);
  if (!reactions.size) return [];

  const last = reactions.last().id;
  const next = await fetchReactedUsers(reaction, last);
  return reactions.array().concat(next);
}
async function getRedis(key) {
  return new Promise((resolve, reject) => {
    redClient.get(key, function (error, data) {
      if (error) reject(error);
      else resolve(data);
    });
  });
}
async function setRedis(key, value) {
  return new Promise((resolve, reject) => {
    if (typeof value == 'object' || typeof value == 'array') value = JSON.stringify(value);
    redClient.set(key, value, function (error, response) {
      if (error) reject(error);
      else resolve(response);
    })
  })
}