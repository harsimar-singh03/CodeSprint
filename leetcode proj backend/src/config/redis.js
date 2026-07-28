const { createClient }= require('redis') 

const redisClient = createClient({
    password: process.env.redis_pass,
    socket: {
        host: 'redis-14739.crce310.us-east-1-6.ec2.cloud.redislabs.com',
        port: 14739
    }
});

module.exports = redisClient;
