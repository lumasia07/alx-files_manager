const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    // Create Redis client
    this.client = redis.createClient();

    // Handle Redis client error
    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
    });

    // Promisify Redis client methods for async/await
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  // Check if Redis connection is alive
  isAlive() {
    return this.client.connected;
  }

  // Get value from Redis by key
  async get(key) {
    try {
      const value = await this.getAsync(key);
      return value;
    } catch (error) {
      console.error('Error getting value from Redis:', error);
      return null;
    }
  }

  // Set value in Redis with expiration time
  async set(key, value, duration) {
    try {
      await this.setAsync(key, value, 'EX', duration);
    } catch (error) {
      console.error('Error setting value in Redis:', error);
    }
  }

  // Delete key from Redis
  async del(key) {
    try {
      await this.delAsync(key);
    } catch (error) {
      console.error('Error deleting value from Redis:', error);
    }
  }
}

// Create and export an instance of RedisClient
const redisClient = new RedisClient();
module.exports = redisClient;
