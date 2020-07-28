const discord = require("discord.js");
const config = require("../config.json");
const data = require("../data/all.json");
const special = require("../data/special.json");
module.exports.run = async (client, message, args, prefix, userResult) => {
  if (userResult == null) userResult = await client.getUser(message.author.id);
  let originalPokemons = userResult.pokemons;
  let pokemons = JSON.stringify(userResult.pokemons);
  pokemons = JSON.parse(pokemons);
  let page = args[1];
  if (pokemons == null || pokemons.length == 0)
    return message.channel.send(`You have not selected a starter, please use ${prefix}start to pick one!`);
  if (isNaN(page) || page == null || page == undefined || page < 1) page = 1;
  const options = args
    .join(" ")
    .split("--")
    .slice(1);
  let ivSort = "none";
  let levelSort = "none";
  let crash = "";
  options.forEach(option => {
    if (option.trim().split(" ")[0] == "legendary" || option.trim().split(" ")[0] == "l") {
      pokemons = pokemons.filter(poke => {
        let spawnrate = "0";
        if (poke.id.includes("_s")) {
          spawnrate = special[parseInt(poke.id)].spawnrate;
        } else {
          spawnrate = data[parseInt(poke.id)].spawnrate;
        }
        if (spawnrate == "9") return true;
        else return false;
      });
    }
    if (option.trim().split(" ")[0] == "ultrabeast" || option.trim().split(" ")[0] == "ub") {
      pokemons = pokemons.filyer(poke => {
        let spawnrate = "0";
        if (poke.id.includes("_s")) {
          spawnrate = special[parseInt(poke.id)].spawnrate;
        } else {
          spawnrate = data[parseInt(poke.id)].spawnrate;
        }
        if (spawnrate == "7") return true;
        else return false;
      });
    }
    if (option.trim().split(" ")[0] == "mythical" || option.trim().split(" ")[0] == "m") {
      pokemons = pokemons.filter(poke => {
        let spawnrate = "0";
        if (poke.id.includes("_s")) {
          spawnrate = special[parseInt(poke.id)].spawnrate;
        } else {
          spawnrate = data[parseInt(poke.id)].spawnrate;
        }
        if (spawnrate == "8") return true;
        else return false;
      });
    }
    if (option.trim().split(" ")[0] == "alolan" || option.trim().split(" ")[0] == "a") {
      pokemons = pokemons.filter(poke => {
        if (poke.id.includes("_a")) {
          return true;
        } else {
          return false;
        }
      });
    }
    if (option.trim().split(" ")[0] == "nickname" || option.trim().split(" ")[0] == "nn") {
      let name = option
        .trim()
        .split(" ")
        .slice(1)
        .join(" ");
      pokemons = pokemons.filter(poke => {
        if (poke.nickname == name) return true;
        else return false;
      });
    }
    if (option.trim().split(" ")[0] == "name" || option.trim().split(" ")[0] == "n") {
      let name = option
        .trim()
        .split(" ")
        .slice(1)
        .join(" ");
      if (!name) return (crash = `I'm missing the pokemon name to search for!`);
      let foundPokemonByName = data.find(
        d => d.names.english.toLowerCase() == name.toLowerCase()
      );
      if (!foundPokemonByName) return (crash = `I can't find that pokemon!`);
      pokemons = pokemons.filter(poke => {
        if (poke.id.split('_')[0] == foundPokemonByName.id) return true;
        else return false;
      });
    }
    if (option.trim().split(" ")[0] == "iv") {
      let type = option
        .trim()
        .split(" ")
        .slice(1)
        .join(" ");
      if (!type)
        return (crash = `Missing the iv type to filter for (ascending / descending)`);
      if (type.toLowerCase() == "ascending") type = "a";
      if (type.toLowerCase() == "descending") type = "d";
      if (!["a", "d"].includes(type.toLowerCase()))
        return (crash = `Wrong the iv type to filter for (ascending / descending)`);
      ivSort = type.toLowerCase();
    }
    if (option.trim().split(" ")[0] == "level") {
      let type = option
        .trim()
        .split(" ")
        .slice(1)
        .join(" ");
      if (!type)
        return (crash = `Missing the iv type to filter for (ascending / descending)`);
      if (type.toLowerCase() == "ascending") type = "a";
      if (type.toLowerCase() == "descending") type = "d";
      if (!["a", "d"].includes(type.toLowerCase()))
        return (crash = `Wrong the iv type to filter for (ascending / descending)`);
      levelSort = type.toLowerCase();
    }
  });

  if (ivSort == "a") {
    pokemons = pokemons.sort((a, b) =>
      parseFloat(a.iv) > parseFloat(b.iv) ? 1 : -1
    );
  } else if (ivSort == "d") {
    pokemons = pokemons.sort((a, b) =>
      parseFloat(a.iv) < parseFloat(b.iv) ? 1 : -1
    );
  }

  if (levelSort == "a") {
    pokemons = pokemons.sort((a, b) => (a.level > b.level ? 1 : -1));
  } else if (levelSort == "d") {
    pokemons = pokemons.sort((a, b) => (a.level < b.level ? 1 : -1));
  }
  if (crash !== "") return message.channel.send(crash);
  const pages = Math.floor(pokemons.length / 20) + 1;
  const highest = page * 20;
  const lowest = highest - 20;
  if (page > pages)
    return message.channel.send(`You only have ${pages} page(s)!`);
  let desc = "";
  for (let i = lowest; i < highest; i++) {
    if (!!pokemons[i]) {
      let id = pokemons[i]["id"];
      if (!id) {
        console.log("pokemon.js error 1");
        continue;
      }
      let alolan = false;
      if (id.includes("_a")) {
        id = id.replace("_a", "");
        alolan = true;
      }
      let poke = null;
      if (id.includes("_s")) {
        poke = special[parseInt(id)];
      } else {
        poke = data[parseInt(id)];
      }
      if (!poke) {
        console.log("pokemon.js error 2");
        continue;
      }
      if (alolan) poke = poke.alolan;
      if (!poke) {
        console.log("pokemon.js error 3");
        continue;
      }
      const name = poke.names.english;
      const level = pokemons[i]["level"];
      const iv = pokemons[i]["iv"];
      const nickname = pokemons[i]["nickname"];

      if (name == undefined)
        return message.channel.send(
          "Oops, it seems like something is missing in our database, please contact support! ||`" +
            pokemons[i]["id"] +
            "`||"
        );
      if (nickname == null || nickname == "") {
        if (typeof pokemons[i].shiny == "undefined")
          desc += `**${name}** | Level: ${level} | Number: ${originalPokemons.findIndex(
            element => JSON.stringify(element) == JSON.stringify(pokemons[i])
          ) + 1} | IV: ${iv}\n`;
        else if (typeof pokemons[i].shiny == "number")
          desc += `**${name}** | Level: ${level} | IV: ${iv}% | Number: ${originalPokemons.findIndex(
            element => JSON.stringify(element) == JSON.stringify(pokemons[i])
          ) + 1}\n`; // show iv based on other stats
      } else {
        if (typeof pokemons[i].shiny == "undefined")
          desc += `**${name}** | Level: ${level} | Number: ${originalPokemons.findIndex(
            element => JSON.stringify(element) == JSON.stringify(pokemons[i])
          ) + 1} | IV: ${iv} | Nickname: ${nickname}\n`;
        else if (typeof pokemons[i].shiny == "number")
          desc += `**${name}** | Level: ${level} | IV: ${iv}% | Number: ${originalPokemons.findIndex(
            element => JSON.stringify(element) == JSON.stringify(pokemons[i])
          ) + 1} | Nickname: ${nickname}\n`; // show iv based on other stats
      }
    }
  }
  const starting = (page - 1) * 20 + 1;
  const ending = page * 20;
  const embed = new discord.MessageEmbed();
  embed.setTitle(`Your Pokémon:`);
  embed.setDescription(desc);
  embed.setColor(config.embed.color);
  embed.setFooter(
    `Showing ${starting}-${ending} of ${pokemons.length} pokémon matching this search.`
  );

  return message.channel.send(embed);
};
exports.help = {
  name: "pokemon",
  category: "Info",
  description: "Check all your pokemons",
  usage:
    "pokemon [page] \n\nTo sort use [--legendary / --l] [--mythical / --m] [--alolan / --a] [--name pokemonName / --n] [--nickname nickname / --nn] [--iv ascending/descending] [--level ascending/descending]"
};
