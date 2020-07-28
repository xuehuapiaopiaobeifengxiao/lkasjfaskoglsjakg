const ms = require("parse-ms");
const discord = require('discord.js')
const config = require("../config.json");
const data = require("../data/all.json");

module.exports.run = async (client, message, args, prefix, userResult) => {
    let timeout = 8.28e7;
    let claimAmount = config.claimAmount;



    let reward = 0;


    const embed = new discord.MessageEmbed().setColor(config.embed.color)
    if (userResult == null) userResult = await client.getUser(message.author.id);
    let pokemons = userResult.pokemons;
    if (!args[1] || args[1] != "claim") {
        let page = args[1];
        if (isNaN(page) || page == null || page == undefined || page < 1) page = 1;
        const itemsPerPage = 21;
        const pages = Math.floor(data.length / itemsPerPage) + 1
        let highest = page * itemsPerPage;
        let lowest = highest - itemsPerPage;
        if (highest > data.length) highest = data.length;
        embed.setFooter(`Showing ${itemsPerPage} of ${data.length} Pokémon.\nPage ${page}/${pages}`)
        if (page > pages) return message.channel.send(`There aren't that many pages!`);
        let desc = `**Pokédex**\nYou have caught ${userResult["claimed"].length} of ${data.length} Pokémon.\nPage ${page}/${pages}\n`
        let two = "";
        let one = "";
        let newClaimed = false;
        for (let i = 0; i < pokemons.length; i++) {
            const id = pokemons[i]["id"];
            if(id.includes('_a') || id.includes('_s')) continue;
            if (!userResult["claimed"].includes(id) && pokemons[i].traded == undefined) newClaimed = true;
        }
        if (newClaimed) desc += `Looks like you have some unclaimed rewards!\nUse \`${prefix}pokedex claim all\` to claim them all!\n`

        for (let i = lowest + 1; i < highest + 1; i++) {
            if (data[i]) {
                one = `**${data[i]["names"]["english"]}#${i}**\n`;
                if (userResult["claimed"].includes(i)) {
                    two = `Captured!✅\n`;
                } else {
                    two = `Not caught yet!❌\n`;
                }
                embed.addField(one, two, true);
            }
        }
        embed.setDescription(desc)
        return message.channel.send(embed)
    } else if (args[1].toLowerCase() == "claim") {
        if (!args[2]) return message.channel.send(`Please do this: ${prefix}pokedex claim all/pokemon name`);

        //if the user wants to claim
        let toClaim = [];
        if (args[2] == "all") {

          for (let i = 0; i < pokemons.length; i++) {
              const id = pokemons[i]["id"];
              if(id.includes('_a') || id.includes('_s')) continue;
              if (!userResult["claimed"].includes(id) && pokemons[i].traded == undefined && !toClaim.includes(id)) toClaim.push(id);
          }
          
        } else {
            name = args[2];
            const pokemonID = data.find(x => x.names.english.toLowerCase() == name.toLowerCase());
            if(!pokemonID) return message.channel.send(`That's an invalid name!`);
            
            const results = userResult.pokemons.filter(x => x.id == pokemonID.id && x.traded == undefined);
            if (results.length == 0) return message.channel.send("You haven't caught that pokemon yet!");
            if (userResult["claimed"].includes(pokemonID.id)) return message.channel.send("You have already claimed that pokemon!");
            toClaim.push(pokemonID.id);
        }
        if(toClaim.length < 1) return message.channel.send(`You've already claimed the rewards!`);
        userResult.claimed = userResult.claimed.concat(toClaim);
        const reward = claimAmount * toClaim.length;
        const currentBalance = userResult.balance ? userResult.balance : 0;
        userResult.balance = Math.round(currentBalance + reward);
        embed.setDescription(`You claimed ${toClaim.length} rewards and got ${reward} credits!`)
        return client.saveUser(userResult).then(() => {
            return message.channel.send(embed);
        }).catch(err => {
            return client.sendSupport(message.channel, err, 2);
        });
    }
};

exports.help = {
    name: "pokedex",
    category: "Information",
    description: "View the pokedex and gain credits for catching new species of Pokémon!",
    usage: "pokedex [page] / pokedex claim [all/pokemon name]"
};
