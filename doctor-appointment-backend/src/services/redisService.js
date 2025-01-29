const Redis = require('ioredis');
const logger = require('../utils/logger');
const citiesData = require('../data/cities.json');
const districtsData = require('../data/districts.json');

class RedisService {
  static client = null;
  static isRedisEnabled = false;

  static async getClient() {
    if (!this.isRedisEnabled) {
      return null;
    }

    if (!this.client) {
      try {
        this.client = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          enableOfflineQueue: true,
          lazyConnect: true
        });

        await this.client.connect();
      } catch (error) {
        logger.error('Redis connection error:', error);
        this.client = null;
      }
    }
    return this.client;
  }

  static async get(key) {
    if (!this.isRedisEnabled) {
      return null;
    }

    try {
      const client = await this.getClient();
      if (!client) return null;
      
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  static async set(key, value, expireTime = 3600) {
    if (!this.isRedisEnabled) {
      return;
    }

    try {
      const client = await this.getClient();
      if (!client) return;
      
      await client.set(key, JSON.stringify(value), 'EX', expireTime);
    } catch (error) {
      logger.error('Redis set error:', error);
    }
  }

  static async disconnect() {
    if (this.client) {
      try {
        await this.client.quit();
        this.client = null;
      } catch (error) {
        logger.error('Redis disconnect error:', error);
      }
    }
  }

  static async getCities() {
    try {
      const client = await this.getClient();
      if (client) {
        const cachedCities = await client.get('cities');
        if (cachedCities) {
          return JSON.parse(cachedCities);
        }
      }

      return citiesData;
    } catch (error) {
      logger.error('Error getting cities:', error);
      return citiesData;
    }
  }

  static async getDistricts(cityId) {
    try {
      const client = await this.getClient();
      if (client) {
        const cachedDistricts = await client.get(`districts:${cityId}`);
        if (cachedDistricts) {
          return JSON.parse(cachedDistricts);
        }
      }

      // Read directly from the file if not in Redis or if Redis connection is unavailable
      return districtsData[cityId] || [];
    } catch (error) {
      logger.error('Error getting districts:', error);
      return districtsData[cityId] || [];
    }
  }
}

module.exports = RedisService; 