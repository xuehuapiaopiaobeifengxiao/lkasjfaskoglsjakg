const data = require("../data/all.json");
const special = require("../data/special.json");
const config = require('../config.json');
const discord = require("discord.js");
const db = require("quick.db");

function SaveTrade(field, data, tradingWith = null, channel = null) {
  if (tradingWith !== null) {
    const user2Data = JSON.parse(db.get(`t${tradingWith}-${channel}`));
    user2Data.accepted = false;
    db.set(`t${tradingWith}-${channel}`, JSON.stringify(user2Data));
  }
  db.set(field, JSON.stringify(data));
};


function SaveConfirmedTrade(result1, result2, msg, client) {
  return client.saveUser(result1).then(() => {
    return client.saveUser(result2).then(() => {
      return msg.edit('Done!');
    }).catch(error => {
      return client.sendSupport(msg.channel, error, 2);
    })
  }).catch(error => {
    return client.sendSupport(msg.channel, error, 2);
  })
}

function confirmTrade(result1, data1, result2, data2, msg, client) {
  const redeems1 = result1.redeems ? result1.redeems : 0;
  const redeemsToAdd1 = data2.redeems;
  const redeems2 = result2.redeems ? result2.redeems : 0;
  const redeemsToAdd2 = data1.redeems;
  result1.redeems = (redeems1 + redeemsToAdd1) - redeemsToAdd2;
  result2.redeems = (redeems2 + redeemsToAdd2) - redeemsToAdd1;

  const credits1 = result1.balance ? result1.balance : 0;
  const creditsToAdd1 = data2.credits;
  const credits2 = result2.balance ? result2.balance : 0;
  const creditsToAdd2 = data1.credits;
  result1.balance = (credits1 + creditsToAdd1) - creditsToAdd2;
  result2.balance = (credits2 + creditsToAdd2) - creditsToAdd1;

  const pokesToAdd1 = data2.pokemon.sort((a, b) => (a.index > b.index) ? -1 : ((b.index > a.index) ? 1 : 0));
  const pokesToAdd2 = data1.pokemon.sort((a, b) => (a.index > b.index) ? -1 : ((b.index > a.index) ? 1 : 0));
  let done1 = false;
  let done2 = false;

  if (pokesToAdd1.length == 0) done1 = true;
  for (let i1 = 0; i1 < pokesToAdd1.length; i1++) {
    const poke = pokesToAdd1[i1];
    const userPokemon = result2.pokemons[poke.index];
    if (poke.id !== userPokemon.id || poke.iv !== userPokemon.iv || poke.hp !== userPokemon.hp || poke.atk !== userPokemon.atk || poke.def !== userPokemon.def || poke.spatk !== userPokemon.spatk || poke.spdef !== userPokemon.spdef || poke.speed !== userPokemon.speed || poke.shiny !== userPokemon.shiny) { i1 = pokesToAdd1.length; return msg.edit(`It seems like something went wrong, please try again!`) };
    if(poke.index == result2.selected) return msg.edit(`Don't select the pokemon you're trading!`);
    result2.pokemons.splice(poke.index, 1);
    result1.pokemons.set(result1.pokemons.length, {
      uuid: poke.uuid,
      id: poke.id,
      level: poke.level,
      iv: poke.iv,
      xp: poke.xp,
      hp: poke.hp,
      atk: poke.atk,
      def: poke.def,
      spatk: poke.spatk,
      spdef: poke.spdef,
      speed: poke.speed,
      shiny: poke.shiny,
      traded: 1,
    });
    if (i1 == pokesToAdd1.length - 1) {
      if (done2) {
        return confirmTrade2(result1, data1, result2, data2, msg, client);
      } else {
        done1 = true;
      }
    }
  }

  if (pokesToAdd2.length == 0) done2 = true;
  for (let i2 = 0; i2 < pokesToAdd2.length; i2++) {
    const poke = pokesToAdd2[i2];
    const userPokemon = result1.pokemons[poke.index];
    if (poke.id !== userPokemon.id || poke.iv !== userPokemon.iv || poke.hp !== userPokemon.hp || poke.atk !== userPokemon.atk || poke.def !== userPokemon.def || poke.spatk !== userPokemon.spatk || poke.spdef !== userPokemon.spdef || poke.speed !== userPokemon.speed || poke.shiny !== userPokemon.shiny) { i2 = pokesToAdd2.length; return msg.edit(`It seems like something went wrong, please try again!`) };
    if(poke.index == result1.selected) return msg.edit(`Don't select the pokemon you're trading!`);
    result1.pokemons.splice(poke.index, 1);
    result2.pokemons.set(result2.pokemons.length, {
      uuid: poke.uuid,
      id: poke.id,
      level: poke.level,
      iv: poke.iv,
      xp: poke.xp,
      hp: poke.hp,
      atk: poke.atk,
      def: poke.def,
      spatk: poke.spatk,
      spdef: poke.spdef,
      speed: poke.speed,
      shiny: poke.shiny,
      traded: 1,
    });
    if (i2 == pokesToAdd2.length - 1) {
      if (done1) {
        return confirmTrade2(result1, data1, result2, data2, msg, client);
      } else {
        done2 = true;
      }
    }
  }
  if (done1 && done2) {
    return confirmTrade2(result1, data1, result2, data2, msg, client);
  }
}
function confirmTrade2(result1, data1, result2, data2, msg, client) {
  return SaveConfirmedTrade(result1, result2, msg, client);
}

module.exports.run = async (client, message, args, prefix) => {
  let command = args[0];
  let requests = db.get("tradeRequests");
  if (!requests) {
    db.set("tradeRequests", []);
    requests = [];
  }

  const embed = new discord.MessageEmbed();
  if (!db.has(`t${message.author.id}-${message.channel.id}`)) { // Not in trade
    if (command == "p" || command == "r" || command == "c" || command == "confirm" || command == "cancel") return message.channel.send("You can't do this unless you are in a trade!");
    const pendingRequestIn = requests.find(([id, id2, channel]) => id2 === message.author.id && channel == message.channel.id);
    if (pendingRequestIn) {
      const index = requests.indexOf(pendingRequestIn);
      if (index > -1) {
        requests.splice(index, 1);
      }
      db.set("tradeRequests", requests);
      const embed = new discord.MessageEmbed()
        .setTitle('Trade commands')
        .setDescription(`\`${prefix}p remove number\` or \`${prefix}p add number\`\nAdd or remove a pokemon\n\n
                         \`${prefix}c remove amount\` or \`${prefix}c add amount\`\nAdd or remove credits\n\n
                         \`${prefix}r remove amount\` or \`${prefix}r add amount\`\nAdd or remove redeems\n\n
                         \`${prefix}confirm\`\nConfirm the trade (both traders must do this)\n\n
                         \`${prefix}cancel\`\nCancel the trade\n\n
                         \`${prefix}trade\`\nView the current trade`)
        .setColor(config.embed.color);
      message.channel.send(embed).then(() => {
        db.set(`t${message.author.id}-${message.channel.id}`, JSON.stringify({ tradingWith: pendingRequestIn[0], credits: 0, redeems: 0, pokemon: [], accepted: false, tradePos: 0, start: Date.now() }));
        return db.set(`t${pendingRequestIn[0]}-${message.channel.id}`, JSON.stringify({ tradingWith: message.author.id, credits: 0, redeems: 0, pokemon: [], accepted: false, tradePos: 1, start: Date.now() }));
        /*
        tradingWith:${message.author.id}
        ,money:0 - Money 
        ,pokemon:[] -Pokemon
        ,accepted:"false" - has the user accepted the trade?
        ,tradePos:1 - what side ecah trade is on the embed
        */
      })
    }
    if (!args[1]) return message.channel.send(`Improper usage, you must **mention** someone to trade / **accept** the trade!`);
    const member = message.mentions.members.first() || client.users.cache.get(args[1]);
    if (!member) return message.channel.send('You must mention someone to trade / accept the trade!');
    if (member.id == message.author.id) return message.channel.send('You cant send yourself a trade request!')
    if (member.user.bot) return message.channel.send("You cant trade with a bot!")
    if (!member) return message.channel.send('Please mention the user you want to trade with / accept trade from!');
    const pendingRequestOut = requests.find(([id, id2, channel]) => id === message.author.id && channel == message.channel.id);
    if (db.has(`t${member.id}-${message.channel.id}`)) return message.channel.send(`This user is already in a trade!`);
    if (pendingRequestOut) {
      const index = requests.indexOf(pendingRequestOut);
      if (index > -1) {
        requests.splice(index, 1);
      }
      requests.push([message.author.id, member.id, message.channel.id]);;
      db.set("tradeRequests", requests);
      return message.channel.send(`You sent ${member} a trade request!`);
    } else {
      requests.push([message.author.id, member.id, message.channel.id]);
      db.set("tradeRequests", requests);
      return message.channel.send(`You sent ${member} a trade request!`);
    }
  } else {
    if (message.mentions.members.first()) return message.channel.send(`You already have an active trade!`);
    let trade0 = new Object();
    let trade1 = new Object();
    let temp1 = JSON.parse(db.get(`t${message.author.id}-${message.channel.id}`));
    temp1.myDisplayName = message.author.username;
    temp1.active = false;
    let currntUser = temp1;
    let temp2 = JSON.parse(db.get(`t${temp1["tradingWith"]}-${message.channel.id}`));
    if (!temp2) {
      db.delete(`t${message.author.id}-${message.channel.id}`);
      return message.channel.send(`It seems like something went wrong, trade cancelled.`);
    }
    temp2.myDisplayName = message.guild.member(temp1["tradingWith"]).user.username

    if (temp1.tradePos == 0) {
      trade0 = temp1
      trade1 = temp2
    } else {
      trade0 = temp2
      trade1 = temp1
    }
    return client.getUser(message.author.id).then(userResult => {
      if (command == "cancel") {
        db.delete(`t${message.author.id}-${message.channel.id}`);
        db.delete(`t${currntUser.tradingWith}-${message.channel.id}`);
        return message.channel.send(`Trade cancelled!`);
      } else if (command == "p") {
        if (args[2] < 0) return message.channel.send(`You can use a negative number!`);

        const pokemons = userResult.pokemons;
        const pokemonIndex = args[2] - 1;
        if (args[1] == "add") {
          if (pokemons.length < (pokemonIndex + 1)) return message.channel.send(`You don't own that Pokémon!`);
          if (pokemonIndex == 0) return message.channel.send(`You can't trade your starter Pokémon!`);
          if (pokemonIndex == userResult.selected) return message.channel.send(`You can't trade your selected pokemon!`);
          const pokemonToAdd = pokemons[pokemonIndex];
          if (!pokemonToAdd) return message.channel.send(`You don't own that Pokémon!`);
          pokemonToAdd.index = pokemonIndex;
          if (JSON.stringify(currntUser.pokemon).includes(JSON.stringify(pokemonToAdd))) return message.channel.send(`That Pokémon is already in the trade!`);
          currntUser.pokemon.push(pokemonToAdd);
          currntUser.accepted = false;
          SaveTrade(`t${message.author.id}-${message.channel.id}`, currntUser, currntUser.tradingWith, message.channel.id);
          return message.channel.send('You added a pokemon!');
        } else if (args[1] == "remove") {
          if (pokemons.length < (pokemonIndex + 1)) return message.channel.send(`You don't own that Pokémon!`);
          const pokemonToRemove = pokemons[pokemonIndex];
          if (!pokemonToRemove) return message.channel.send(`You don't own that Pokémon!`)
          pokemonToRemove.index = pokemonIndex;
          const oldLength = currntUser.pokemon.length;
          currntUser.pokemon = currntUser.pokemon.filter(poke => poke.index !== pokemonIndex);
          const newLength = currntUser.pokemon.length;
          if (oldLength == newLength) return message.channel.send(`That Pokémon isn't in the trade!`);
          currntUser.accepted = false;
          SaveTrade(`t${message.author.id}-${message.channel.id}`, currntUser, currntUser.tradingWith, message.channel.id);
          return message.channel.send('You removed a pokemon!');
        } else {
          message.channel.send(`Usage: \`${prefix}p add number\` or  \`${prefix}p remove number\``)
        }
      } else if (command == "r") {
        let currntBal = userResult.redeems ? userResult.redeems : 0;
        currntBal = parseInt(currntBal);
        let amount = args[2];
        amount = parseInt(amount);
        if (isNaN(amount)) return message.channel.send(`Thats an invalid number!`);
        if (amount < 0) return message.channel.send(`You can't use a negative number!`);
        if (args[1] == "add") {
          if (amount + parseInt(currntUser.redeems) > currntBal) return message.channel.send(`You don't have enough redeems!`);
          currntUser.redeems = (parseInt(currntUser.redeems) + amount);
          currntUser.accepted = false;
          SaveTrade(`t${message.author.id}-${message.channel.id}`, currntUser, currntUser.tradingWith, message.channel.id);
          return message.channel.send(`You added ${amount} redeems!`);
        } else if (args[1] == "remove") {
          if (amount > parseInt(currntUser.redeems)) return message.channel.send(`You don't have that many redeems in the trade!`);
          currntUser.redeems = (parseInt(currntUser.redeems) - amount);
          currntUser.accepted = false;
          SaveTrade(`t${message.author.id}-${message.channel.id}`, currntUser, currntUser.tradingWith, message.channel.id);
          return message.channel.send(`You removed ${amount} redeems!`);
        } else {
          return message.channel.send(`Usage: \`${prefix}r add amount\` or  \`${prefix}r remove amount\`\nDescription: Add or remove redeems`)
        }
      } else if (command == "c") {
        let currntBal = userResult.balance ? userResult.balance : 0;
        currntBal = parseInt(currntBal);
        let amount = args[2];
        amount = parseInt(amount);
        if (isNaN(amount)) return message.channel.send(`Thats an invalid number!`);
        if (amount < 0) return message.channel.send(`You can't use a negative number!`);
        if (args[1] == "add") {
          if (amount + parseInt(currntUser.credits) > currntBal) return message.channel.send(`You don't have enough credits!`);
          currntUser.credits = (parseInt(currntUser.credits) + amount);
          currntUser.accepted = false;
          SaveTrade(`t${message.author.id}-${message.channel.id}`, currntUser, currntUser.tradingWith, message.channel.id);
          return message.channel.send(`You added ${amount} credits!`);
        } else if (args[1] == "remove") {
          if (amount > parseInt(currntUser.credits)) return message.channel.send(`You don't have that many credits in the trade!`);
          currntUser.credits = (parseInt(currntUser.credits) - amount);
          currntUser.accepted = false;
          SaveTrade(`t${message.author.id}-${message.channel.id}`, currntUser, currntUser.tradingWith, message.channel.id);
          return message.channel.send(`You removed ${amount} credits!`);
        } else {
          return message.channel.send(`Usage: \`${prefix}c add amount\` or  \`${prefix}c remove amount\`\nDescription: Add or remove credits`)
        }
      } else if (command == "confirm") {
        currntUser.accepted = true;
        SaveTrade(`t${message.author.id}-${message.channel.id}`, currntUser);
        if (temp2.accepted) {
          let done1 = false;
          let done2 = false;
          return message.channel.send('Trade complete making transaction...').then((msg) => {
          db.delete(`t${message.author.id}-${message.channel.id}`);
          db.delete(`t${currntUser.tradingWith}-${message.channel.id}`);
            return client.getUser(currntUser.tradingWith).then(otherAuthor => {
              const redeems = userResult.redeems ? userResult.redeems : 0;
              if (temp1.redeems > redeems) {
                return msg.edit(`${temp1.myDisplayName}, doesn't have enough redeems to complete the trade anymore! ***Dont gift while in a trade!***`);
              };
              const balance = userResult.balance ? userResult.balance : 0;
              if (temp1.credits > balance) {
                return msg.edit(`${temp1.myDisplayName}, doesn't have enough credits to complete the trade anymore! ***Dont pay while in a trade!***`);
              };
              if (temp1.pokemon.length == 0) done1 = true;
              for (let i = 0; i < temp1.pokemon.length; i++) {
                const poke = temp1.pokemon[i];
                const pokes = userResult.pokemons;
                const inPokes = pokes[poke.index];
                if (!inPokes) return msg.edit(`${temp1.myDisplayName}, doesn't have his pokemon complete the trade anymore! ***Dont trade while in another trade!***`);
                if (poke.id !== inPokes.id || poke.iv !== inPokes.iv || poke.hp !== inPokes.hp || poke.atk !== inPokes.atk || poke.def !== inPokes.def || poke.spatk !== inPokes.spatk || poke.spdef !== inPokes.spdef || poke.speed !== inPokes.speed || poke.shiny !== inPokes.shiny) {
                  return msg.edit(`${temp1.myDisplayName}, doesn't has his pokemon complete the trade anymore! ***Dont trade while in another trade!***`);
                }
                if (i == temp1.pokemon.length - 1) {
                  if (done2) {
                    return confirmTrade(userResult, temp1, otherAuthor, temp2, msg, client);
                  } else {
                    done1 = true;
                  }
                }
              }
              const redeems2 = otherAuthor.redeems ? otherAuthor.redeems : 0;
              if (temp2.redeems > redeems2) {
                return msg.edit(`${temp2.myDisplayName}, doesn't has enough redeems to complete the trade anymore! ***Dont gift while in a trade!***`);
              };
              const balance2 = otherAuthor.balance ? otherAuthor.balance : 0;
              if (temp2.credits > balance2) {
                return msg.edit(`${temp2.myDisplayName}, doesn't has enough credits to complete the trade anymore! ***Dont pay while in a trade!***`);
              };
              if (temp2.pokemon.length == 0) done2 = true;
              for (let i = 0; i < temp2.pokemon.length; i++) {
                const poke = temp2.pokemon[i];
                const pokes = otherAuthor.pokemons;
                const inPokes = pokes[poke.index];
                if (!inPokes) return msg.edit(`${temp2.myDisplayName}, doesn't has his pokemon complete the trade anymore! ***Dont trade while in another trade!***`);
                if (poke.id !== inPokes.id || poke.iv !== inPokes.iv || poke.hp !== inPokes.hp || poke.atk !== inPokes.atk || poke.def !== inPokes.def || poke.spatk !== inPokes.spatk || poke.spdef !== inPokes.spdef || poke.speed !== inPokes.speed || poke.shiny !== inPokes.shiny) {
                  return msg.edit(`${temp2.myDisplayName}, doesn't has his pokemon complete the trade anymore! ***Dont trade while in another trade!***`);
                }
                if (i == temp2.pokemon.length - 1) {
                  if (done1) {
                    return confirmTrade(userResult, temp1, otherAuthor, temp2, msg, client);
                  } else {
                    done2 = true;
                  }
                }
              }
              if (done1 && done2) {
                return confirmTrade(userResult, temp1, otherAuthor, temp2, msg, client);
              }
            }).catch(error => {
              return client.sendSupport(message.channel, error, 1);
            })

          })
        } else {
          return message.channel.send(`You accepted the trade!`);
        }
      } else {
        let desc0 = '';
        let desc1 = '';
        const trade0pokes = [];
        const trade1pokes = [];
        trade0.pokemon.forEach(pok => {
          let id = pok["id"];
          let alolan = false;
          if(id.includes('_a')){
            id = id.replace('_a','');
            alolan = true;
          }
          let poke = data[parseInt(id)];
          if(alolan) poke = poke.alolan;
          const name = poke.names.english;
          trade0pokes.push(`${name} (id: ${pok['index'] + 1}, iv: ${pok['iv']}%)`);
        });
        trade1.pokemon.forEach(pok => {
          let id = pok["id"];
          let alolan = false;
          if(id.includes('_a')){
            id = id.replace('_a','');
            alolan = true;
          }
          let poke = null;
          if(id.includes('_s')){
            poke = special[parseInt(id)];
          } else {
            poke = data[parseInt(id)];
          }
          if(alolan) poke = poke.alolan;
          const name = poke.names.english;
          trade1pokes.push(`${name} (id: ${pok['index'] + 1}, iv: ${pok['iv']}%)`);
        });
        const credits0 = trade0.credits ? `${trade0.credits} credits\n` : '';
        const credits1 = trade1.credits ? `${trade1.credits} credits\n` : '';
        const redeems0 = trade0.redeems ? `${trade0.redeems} redeems\n` : '';
        const redeems1 = trade1.redeems ? `${trade1.redeems} redeems\n` : '';
        desc0 += credits0 + redeems0 + trade0pokes.join(' , ');
        desc1 += credits1 + redeems1 + trade1pokes.join(' , ');
        if (desc0 == '') desc0 = ' ';
        if (desc1 == '') desc1 = ' ';
        let emoji0 = `❌`;
        let emoji1 = '❌';
        if (trade0.accepted) emoji0 = '✅';
        if (trade1.accepted) emoji1 = '✅';
        const embed = new discord.MessageEmbed()
          .addField(`**${trade0.myDisplayName}** is offering | ${emoji0}`, `\`\`\`${desc0} \`\`\``)
          .addField(`**${trade1.myDisplayName}** is offering | ${emoji1}`, `\`\`\`${desc1}\`\`\``)
          .setFooter(`Do ${prefix}help trade for the trade commands!`)
          .setColor(config.embed.color);
        return message.channel.send(embed);

      }
    }).catch(err => {
      return client.sendSupport(message.channel, err, 1);
    });
  }
}


exports.help = {
  name: "trade",
  category: "General",
  description: "Trade pokemon and money with another user!",
  usage: "`p remove number` or `p add number`\nAdds or removes a pokemon\n\n`c remove amount` or `c add amount`\nAdds or removes credits\n\n`r remove amount` or `r add amount`\nAdds or removes redeems\n\n`confirm`\nConfirm a trade\n\n`cancel`\nAccept a trade\n\n`trade`\nSee the trade information"
};
