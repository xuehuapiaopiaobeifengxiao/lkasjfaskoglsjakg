const Discord = require("discord.js");
const Auctions = require("../Auctions.js");
const moment = require("moment");
const mdf = require("moment-duration-format");
const jsonFile = require("../data/all.json");

const col = require("../config.json").embed.color;

const query = name => {
  name = name.toLowerCase();
  if (["showiv", "showstat", "showtotal", "siv"].includes(name)) return "showiv";
  else if (["order", "arr", "arrange", "sort"].includes(name)) return "order";
  else if (["page", "p", "pg"].includes(name)) return "page";
  else if (["name", "poke", "poké", "pokémon", "pkmn"].includes(name)) return "name";
  else if (["user", "author", "usr"].includes(name)) return "author";
  else if (["lvl", "lv", "level","l"].includes(name)) return "level";
  else if (["insta", "price", "buyout", "instabid"].includes(name)) return "price";
  else return name;
};

const stat = val => {
  let p = Math.floor((val / 31) * 100);
  return `${p}% - IV: ${val}/31`;
};

module.exports.run = async (client, msg, args, prefix) => {
  const reply = (txt,col="RED") => msg.channel.send({embed:{description:`**${msg.author.username}**, ${txt}`,color:col}});
  
  let raw = (args[1] || "").toLowerCase();
  let arg = "";

  let input = msg.content
    .slice(prefix.length)
    .trim()
    .slice("auction".length)
    .trim();
  if (raw != "") input = input.slice(raw.length).trim();

  if (["lists", "my","listings"].includes(raw)) arg = "list";
  else if (
    ["list", "create", "make", "oragnise", "organize", "mk", "start", "lis"].includes(
      raw
    )
  )
    arg = "create";
  else if (["find", "search", "query", "filter", "q","all"].includes(raw))
    arg = "find";
  else if (["bid", "createbid", "makebid", "mkbid"].includes(raw)) arg = "bid";
  else if (["", "view", "info", "v"].includes(raw)) arg = "view";
  else if (["end", "stop", "complete"].includes(raw)) arg = "end";
  else return reply("Invalid Usage! Cannot find sub-command " + raw + "!"+` For help do ${prefix}help auction!`);

  //console.log(`${raw} => ${arg}`);
  //console.log(`Input: ${input}`);

  if (arg == "list") {
    if (input != "") {
      input = parseInt(input) || 1;
    } else input = 0;
    let dif = 20;
    let min = dif * (input - 1);
    let max = min + dif;
    let all = await Auctions.getAll({ author: msg.author.id });
    if (!all || !all.length) return reply("You have no Auctions going on.");
    let posts = all.filter((v, i) => i >= min && i < max);
    if (!posts.length) {
      posts = all.filter((v, i) => i < 20);
      input = 1;
    }

    let showiv = msg.content.toLowerCase().includes("--showiv");

    let embed = new Discord.MessageEmbed()
      .setTitle("Your Auctions:")
      .setDescription(
        posts
          .map(
            post =>
              `**Level ${post.pokemon.level} ${post.pokemon.name}** | ID: ${
                post._id
              } ${
                showiv == true ? "| IV: " + post.pokemon.stats.total + "% " : ""
              }| Bid: ${post.bid.price} ${
                post.insta ? "| Buyout: " + post.insta + " " : ""
              }|`
          )
          .join("\n")
      )
      .setColor("GREEN")
      .setFooter(
        `Showing ${
          !input || input == 1 ? "1-20" : min + "-" + max
        } Pokémon of ${all.length}`
      );

    msg.channel.send(embed);
  } else if (arg == "find") {
    let qsRaw = input
      .split("--")
      .map(e => e.trim())
      .filter(e => e != "")
      .map(e => e.split(" "))
      .map(e => {
        let o = {};
        o[`${e[0]}`] = e.filter((v, i) => i != 0).join(" ");
        return o;
      });
    let qs = {};
    qsRaw.forEach(q => {
      let key = Object.keys(q)[0];
      let val = Object.values(q)[0];
      qs[key] = val;
    });
    let all = await Auctions.getAll(qs, client);
    if (!all || !all.length)
      return reply("No Auction matching query could be found!");
    let page = parseInt(qs["page"] || qs["p"]) || 1;
    let dif = 20;
    let min = dif * (page - 1);
    let max = min + dif;
    //console.log(`DIF: ${dif}, MIN: ${min}, MAX: ${max}, PAGE: ${page}`);
    let posts = all.filter((v, i) => i >= min && i < max);
    if (!posts.length) {
      posts = all.filter((v, i) => i < 20);
      page = 1;
    }
    let showiv = typeof qs["showiv"] != "undefined";

    let embed = new Discord.MessageEmbed()
      .setTitle("Pokémon Auction House:")
      .setDescription(
        posts
          .map(
            post =>
              `**Level ${post.pokemon.level} ${post.pokemon.name}** | ID: ${
                post._id
              } ${
                showiv == true ? "| IV: " + post.pokemon.stats.total + "% " : ""
              }| Bid: ${post.bid.price} ${
                post.insta ? "| Buyout: " + post.insta + " " : ""
              }|`
          )
          .join("\n")
      )
      .setColor("GREEN")
      .setFooter(
        `Showing ${!page || page == 1 ? "1-20" : min + "-" + max} Pokémon of ${
          all.length
        } matching query`
      );

    msg.channel.send(embed);
  } else if (arg == "bid") {
    let spl = input.split(/ +/);
    let id = spl[0];
    let bid = parseInt(spl[1]);
    if(!id) return reply("You need to specify an Auction ID!");
    let post = await Auctions.getPost(id);
    if (!post) return reply("Cannot find Auction with ID: " + id + "!");
    if (msg.author.id == post.author) return reply("Cannot bid on your own Pokémon!");
    if (!bid) return reply("Invalid Bid amount!");
    if (post.bid && post.bid.price && post.bid.price >= bid)
      return reply(
        "Someone has already bid " +
          post.bid.price +
          "! You'll have to bid more than " +
          post.bid.price +
          "."
      );
  
    let user = await client.getUser(msg.author.id);
    let author = await client.getUser(post.author);
    if (user.balance < bid)
      return reply("You don't even have " + bid + " credits!");
    user.balance -= bid;
    if(post.bid && post.bid.user){
      let old = await client.getUser(post.bid.user);
      old.balance += post.bid.price;
      await client.saveUser(old);
      old = client.users.cache.get(post.bid.user);
      if(old) old.send(`${msg.author.tag} has bid ${bid} credits on Auction with ID ${post._id}!`);
    }
    if (post.insta && post.insta <= bid) {
      //author.pokemons = author.pokemons.filter(
        //(v, i) => i != parseInt(post.pokemon.index) - 1
      //);
      user.pokemons.set(
        user.pokemons.length,
        Auctions.rawPokemon(post.pokemon)
      );
      author.balance += bid;
      await client.saveUser(author);
      //await client.saveUser(post.bid.user, user);
      await Auctions.deletePost(post._id);
      await client.saveUser(user);
      //await client.saveUser(post.author, author);
      let usr = client.users.cache.get(post.author);
      if (usr)
        usr.send(
          `Auction with ID: ${post._id} has ended! ${msg.author.tag} has won the Auction with bid of ${bid}!`
        );
      reply(
        `Auction with ID ${post._id} has ended, and you have won the Auction with bid of ${bid}!`
      , col);
      return;
    }
    await client.saveUser(user);
    //await client.saveUser(post.author, author);
    post.bid = { user: msg.author.id, price: bid };
    await Auctions.modifyPost(post._id, post);
    let usr = client.users.cache.get(post.author);
    usr.send(`${msg.author.tag} has bid ${bid} on your Auction with ID: ${post._id}!`);
    reply(`Successfully bid with ${bid} credits!`, col);
  } else if (arg == "view") {
    let post;
    if (input == "") post = await Auctions.getByUser(msg.author.id);
    else post = await Auctions.getPost(input);
    if (!post)
      return reply(
        "Cannot find auction. Try using `" +
          prefix +
          "auction search` to view a list of Auctions, or `" +
          prefix +
          "auction search <query>` to search!"
      );
    let d = new Date(post.endsAt);
    let n = new Date().getTime();
    if (d.getTime() < n)
      return reply(
        "Cannot find auction. Try using `" +
          prefix +
          "auction search` to view a list of Auctions, or `" +
          prefix +
          "auction search <query>` to search!"
      );
    let dif = d.getTime() - n;
    //console.log(post);
    let embed = new Discord.MessageEmbed()
      .setAuthor("Professor Oak")
      .setTitle(
        `Level ${post.pokemon.level} ${post.pokemon.name} - ID: ${post._id}`
      )
      .setDescription(
        `**HP**: ${stat(post.pokemon.stats.hp)}\n**Attack**: ${stat(
          post.pokemon.stats.atk
        )}\n**Defense**: ${stat(
          post.pokemon.stats.def
        )}\n**Sp. Attack**: ${stat(
          post.pokemon.stats.spatk
        )}\n**Sp. Defense**: ${stat(
          post.pokemon.stats.spdef
        )}\n**Speed**: ${stat(post.pokemon.stats.speed)}\n**Total IV%**: ${
          post.pokemon.stats.total
        }%\n${post.insta ? "Buyout: " + post.insta + " - " : ""}Current Bid: ${
          post.bid.price
        } - Time Left: ${moment
          .duration(dif)
          .format("HH [hours], MM [mins]")} ⌛`
      )
      .setColor("GREEN")
      .setFooter(
        `To bid on this Pokémon, place a bid of more than ${post.bid.price ||
          0} by using "${prefix}auction bid ${post._id} <bid>".`
      )
      .setImage(jsonFile[post.pokemon.ID || 0].image);
    msg.channel.send(embed);
  } else if (arg == "end") {
    let id = input;
    if(!id || id == "") return reply("Mention a valid Auction ID!");
    let post = await Auctions.getPost(id);
    if (!post) return reply("Cannot find Auction!");
    if (post.author != msg.author.id)
      return reply("Cannot end Auction! This is not your Auction.");
    if (!post.bid || !post.bid.price)
      return reply("No one has bid on your Auction yet.");
    let user1 = await client.getUser(msg.author.id);
    let user2 = await client.getUser(post.bid.user);
    if (!user2)
      return reply("Both users must have picked starter!");
    user2.pokemons.set(
      user2.pokemons.length,
      Auctions.rawPokemon(post.pokemon)
    );
    user1.balance += post.bid.price;
    await client.saveUser(user1);
    await client.saveUser(user2);
    await Auctions.deletePost(post._id);
    let user = client.users.cache.get(post.bid.user);
    if (user)
      user.send(
        `Auction (ID: ${post._id}) has ended, and you have won the Auction with bid of ${post.bid.price}!`
      );
    reply(
      `Auction (ID: ${post._id}) ended! ${user.tag} has won the Auction with bid of ${post.bid.price}!`
    ,col);
  } else if (arg == "create") {
    //let post = await Auctions.getByUser(msg.author.id);
    //if(post) return reply("You cannot create more than one Auction at same time!");
    let spl = input.split(/ +/);
    let user = await client.getUser(msg.author.id);
    let pid = parseInt(spl[0])||0;
    if(!pid) return reply("You need to mention a valid Pokémon ID!");
    let insta = parseInt(spl[2]) || null;
    let time = spl[1];
    let td = 1000*60*60*24;
    if(time){
      time = time.toLowerCase();
      if(time.endsWith("days")||time.endsWith("d")) td = 1000*60*60*24*(parseInt(time)||1);
      else if(time.endsWith("hours")||time.endsWith("h")) td = 1000*60*60*(parseInt(time)||1);
    }
    if (!pid || !user.pokemons[pid - 1])
      return reply("Cannot find Pokémon with ID " + pid + "!");
    if(pid == 1) return reply("Cannot start Auction with Starter Pokémon!");
    if(user.pokemons.length < 2) return reply("You must have at least 2 Pokémon to start Auction!");
    await client.saveUser(user);
    let ID = Math.floor(Math.random() * 10000000);
    let poke = Auctions.pokemon(user.pokemons[pid - 1]);
    user.pokemons = user.pokemons.filter((v,i)=>i!=(pid-1));
    poke.index = pid;
    await Auctions.createPost({
      ID,
      author: msg.author.id,
      pokemon: poke,
      bid: { user: null, price: 0 },
      insta, td
    });
    reply(`Created Auction with ID: ${ID}!`, col);
  }
};

exports.help = {
  name: "auction",
  category: "Economy",
  description: "View/Manage/Bid/Find Auctions!",
  usage: "`auction search` to get a list of Auctions\n`auction search <query>` to search in all auctions using query\n- `--name <name>`\n- `--price <max buyout>`\n- `--author <user id>`\n- `--order iv a/d`\n- `--level <level>`\n`auction list <Pokemon ID> <time default = 1 day> <buyout if any>` - to create Auction listing\n`auction bid <Auction ID> <Bid Amount>` - to bid on an Auction\n`auction info <ID>` - to view an Auction's details\n`auction end <ID>` - to end an Auction if it is your"
};
