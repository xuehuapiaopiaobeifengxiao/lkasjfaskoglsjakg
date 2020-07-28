require('dotenv').config({ path: __dirname + "/.env" });
const { ShardingManager } = require('discord.js');
const io = require('socket.io-client');
const Redis = require("ioredis");
const redClient = new Redis({
  port: process.env.redis_port,
  host: process.env.redis_host,
  password: process.env.redis_password
});
const manager = new ShardingManager('./bot.js', { token: process.env.token, totalShards: parseInt(process.env.shards) });

(async () => {
    await manager.spawn();
})();
manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

if (process.env.monitor) {
  const socket = io.connect(process.env.monitor, { reconnect: true });
  setInterval(async () => {
    const count = await getRedis('count');
    setRedis('count', 0);
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    socket.emit('commandCount', { count, time, });
  }, 5000)
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