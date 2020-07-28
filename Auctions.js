const pokemon = require("./data/all.json"); // TODO: Put JSON file path here

const schema = require("./mongodb/auction.js");

/**
 * Auctions Module
 * @typeof {object}
 */
const Auctions = { };

// Interfaces

/**
 * Interface Stats
 * @typeof {interface}
 * @property {number} hp HP stat of the Pokémon.
 * @property {number} atk Atk stat of the Pokémon.
 * @property {number} def Def stat of the Pokémon.
 * @property {number} spatk Sp. Atk stat of the Pokémon.
 * @property {number} spdef Sp. Def stat of the Pokémon.
 * @property {number} speed Speed stat of the Pokémon.
 * @property {number} total Total Stats of the Pokémon.
 */
const IStats = {
    hp: 0,
    atk: 0,
    def: 0,
    spatk: 0,
    spdef: 0,
    speed: 0,
    total: 0,
};

/**
 * Interface Pokémon
 * @typeof {interface}
 * @property {string} _ID Unique ID of the Pokémon.
 * @property {number} ID Dex ID of the Pokémon.
 * @property {string} name Name of the Pokémon.
 * @property {number} xp XP of the Pokémon.
 * @property {number} level Level of the Pokémon.
 * @property {object} stats Stats of the Pokémon.
 */
const IPokemon = {
    ID: 0,
    name: "",
    xp: 0,
    level: 0,
    stats: IStats,
};

/**
 * Interface Bid 
 * @typeof {interface}
 * @property {string} user ID of the User.
 * @property {number} price Amount of money offered in bid.
 */
const Bid = {
	user: "",
	price: 0,
};

/**
 * Interface PostData
 * @typeof {interface}
 * @property {string} ID Post's Unique ID.
 * @property {string} author User's ID.
 * @property {Bid} bids Current bid.
 * @property {string} endsAt Time (string) at which Auction will end.
 * @property {object} pokemon The Pokémon user posts in Auctions.
 */
const IPostData = {
    ID: "",
    author: "",
    bid: Bid,
    insta: 0,
    endsAt: "",
    pokemon: IPokemon,
};

/**
 * Get All post from Auctions.
 * @param {object} filter
 * @return {Promise<IPostData[]>}
 */
Auctions.getAll = async function(filter, client = null){
    const obj = {}
    if(filter){
      if(filter.level) obj["pokemon.level"]  = parseInt(filter.level);
      if(filter.id) obj["pokemon.id"]  = filter.id;
      if(filter.author) obj.author = filter.author;
      if(filter.ID) obj._id = filter.ID;
    }
    let posts = await schema.find(obj);
    if(filter){
      if(filter.name) posts = posts.filter(post=>post.pokemon.name.toLowerCase().includes(filter.name.toLowerCase()));
      if(filter.price) posts = posts.filter(post=>post.insta<=parseInt(filter.price));
      if(filter.order){ let spl = filter.order.split(/ +/); if(spl.includes("iv") && (spl.includes("a") || spl.includes("asc") || spl.includes("ascending") || spl.includes("increase"))) { posts.sort((a, b) => a.pokemon.stats.total - b.pokemon.stats.total); } else if(spl.includes("iv") && (spl.includes("d") || spl.includes("des") || spl.includes("descending") || spl.includes("decrease"))) { posts.sort((a, b) => b.pokemon.stats.total - a.pokemon.stats.total); }}
      if(filter.ID) return posts;
    }
    let n = new Date().getTime();
    if(client !== null){
      posts.forEach(post => {
        if((new Date(post.endsAt).getTime())<n){
          this.endAuction(post._id, client);
        };
      });
    };
    posts = posts.filter(a=>(new Date(a.endsAt).getTime())>n);
    return posts;
}

/**
 * Get a Post from Auctions by ID.
 * @param {string} postID 
 * @return {postData | null}
 */
Auctions.getPost = async function(postID){
    let posts = await this.getAll({ID: postID});
    let post = posts[0];
    if(!post) return null;
    return post;
}

/**
 * Get a Post from Auctions by UserID.
 * @param {string} userID 
 * @return {postData | null}
 */
Auctions.getByUser = async function(user){
    let posts = await this.getAll({author: user});
    let post = posts[0];
    if(!post) return null;
    return post;
}

/**
 * Create Post in Auctions
 * @param {IPostData} postData 
 * @return {Promise<boolean>}
 */
Auctions.createPost = async function(postData){
  const obj = {
      _id: postData.ID,
      author: postData.author,
      pokemon: postData.pokemon,
      bid: postData.bid,
      endsAt: new Date(new Date().getTime() + (postData.td)).toUTCString()
    }
    if(postData.insta) obj.insta = postData.insta;
    const data = new schema(obj);
    return data.save().then(() => {
      return true;
    }).catch(() => {
      return false;
    })
}


/**
 * Delete Post from Auctions
 * @param {string} postID
 * @return {Promise<boolean>} 
 */
Auctions.deletePost = async function(postID){
    return schema.findByIdAndRemove(postID).then(() => {
      return true;
    }).catch(() => {
      return false;
    })
}

Auctions.modifyPost = async function(postID, newPost){
	let post = await this.getPost(postID);
	if(!post) return false;
  if(post.author !== newPost.author) {
    post.author = newPost.author;
    post.markModified('author');
  }
  if(post.pokemon !== newPost.pokemon) {
    post.pokemon = newPost.pokemon;
    post.markModified('pokemon');
  }
  if(post.bid !== newPost.bid) {
    post.bid = newPost.bid;
    post.markModified('bid');
  }
  if(post.insta !== newPost.insta) {
    post.insta = newPost.insta;
    post.markModified('insta');
  }
  if(post.endsAt !== newPost.endsAt) {
    post.endsAt = newPost.endsAt;
    post.markModified('endsAt');
  }
  return post.save().then(() => {
    return true;
  }).catch(() => {
    return false;
  })
}

Auctions.makeBid = async function(postID, user, price){
	let post = await this.getPost(postID);
	if(!post) return 1;
	if(!post.bid) post.bid = { user, price };
	else {
		if(post.bid.price <= price) return 2;
		post.bid = { user, price };
	}
	await this.modifyPost(postID, post);
	return 0;
}

Auctions.pokemon = (raw) => {
	let poke = {};
  poke.uuid = raw.uuid;
	poke.ID = raw.id;
	poke.name = pokemon[parseInt(raw.id)].names.english;
	poke.level = raw.level;
	poke.xp = raw.xp;
  poke.shiny = raw.shiny;
  poke.nickname = raw.nickname;
	poke.stats = { hp: raw.hp, atk: raw.atk, def: raw.def, spatk: raw.spatk, spdef: raw.spdef, speed: raw.speed, total: raw.iv };
	return poke;
};

Auctions.rawPokemon = (poke) => {
	let raw = {};
	raw.id = poke.ID;
	raw.level = poke.level;
	raw.xp = poke.xp;
  raw.nickname = poke.nickname;
  raw.uuid = poke.uuid;
  raw.shiny = poke.shiny;
	raw.hp = poke.stats.hp;
	raw.atk = poke.stats.atk;
	raw.def = poke.stats.def;
	raw.spatk = poke.stats.spatk;
	raw.spdef = poke.stats.spdef;
	raw.speed = poke.stats.speed;
	raw.iv = poke.stats.total;
	return raw;
};

Auctions.endAuction = async function(id, client) {
  let post = await this.getPost(id);
  if (!post.bid || !post.bid.price) return "No one has bid on your Auction yet.";
  let user1 = await client.getUser(post.author);
  let user2 = await client.getUser(post.bid.user);
  if (!user2 || user2.pokemons.length == 0) return "Both users must have picked starter!";
  user2.pokemons.set(
    user2.pokemons.length,
    Auctions.rawPokemon(post.pokemon)
  );
  user1.balance += post.bid.price;
  await client.saveUser(user1);
  await client.saveUser(user2);
  await Auctions.deletePost(post._id);
  user1 = client.users.cache.get(post.author);
  user2 = client.users.cache.get(post.bid.user);
  if (user1) user1.send(`Auction (ID: ${post._id}) ended! ${user2.tag} has won the Auction with bid of ${post.bid.price}!`)
  if (user2) user2.send(`Auction (ID: ${post._id}) has ended, and you have won the Auction with bid of ${post.bid.price}!`);
  return true;
}

// Export the Auctions Module
module.exports = Auctions;