const discord = require("discord.js");
const config = require("../config.json");
const db = require("quick.db");

module.exports.run = async (client, message, args, prefix) => {
  if (!(db.has('eventGuess'))) return message.channel.send("No guess event is active at the moment!");
  let event=db.get(`eventGuess`);
  if (!args[1])return message.channel.send("You didnt guess anythng!");
  const guess=args[1].toLowerCase();
  if (db.has('eventGuess.winner')) return message.channel.send("Someone has already won :( try again next time!");
  
    if(db.has(`eventGuess[${message.author.id}]`)){
    
    if(parseInt(event[message.author.id])>parseInt(event.info.maxGuesses)) return message.channel.send("You have allready guessed too many times in this event");
    
    if(guess==event.info.pokemon.toLowerCase()){
      db.set('eventGuess.winner',message.author.id)
      message.channel.send(`Winner, Winner Chicken Dinner! You guessed the right pokemon your reward is ${event.info.reward}`)

    } 
  db.add(`eventGuess[${message.author.id}]`,1)
  message.channel.send(`unlucky you didn't guess right you still have ${parseInt(event.info.maxGuesses)-parseInt(event[message.author.id])} guess left!`)
  }
  db.set(`eventGuess[${message.author.id}]`,1)
  message.channel.send(`unlucky you didn't guess right you still have ${parseInt(event.info.maxGuesses)-1} guess left!`)
};
exports.help = {
  name: "guess",
  category: "Economy",
  description: "Guess an event",
  usage: "guess <what>"
};

//db.set('eventGuess.info', { pokemon: '', maxGuesses: '', reward:''})


