const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

class CacheService {
  static async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key, value, expireTime = 3600) {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', expireTime);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Cache city and district information
  static async getCities() {
    const cacheKey = 'cities';
    let cities = await this.get(cacheKey);
    
    if (!cities) {
      cities = await CitiesService.getAllCities();
      await this.set(cacheKey, cities, 86400);
    }
    
    return cities;
  }
}

module.exports = CacheService; 