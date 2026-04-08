// backend/src/services/redisService.js
import { createClient } from 'redis';

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }
  
  async connect() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('The server refused the connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });
      
      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });
      
      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });
      
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isConnected = false;
    }
  }
  
  async set(key, value, ttlSeconds = null) {
    if (!this.isConnected) return null;
    try {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      } else {
        await this.client.set(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }
  
  async get(key) {
    if (!this.isConnected) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }
  
  async delete(key) {
    if (!this.isConnected) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }
  
  async lPush(key, value) {
    if (!this.isConnected) return null;
    try {
      return await this.client.lPush(key, value);
    } catch (error) {
      console.error('Redis lPush error:', error);
      return null;
    }
  }
  
  async lRange(key, start, stop) {
    if (!this.isConnected) return [];
    try {
      return await this.client.lRange(key, start, stop);
    } catch (error) {
      console.error('Redis lRange error:', error);
      return [];
    }
  }
  
  async lLen(key) {
    if (!this.isConnected) return 0;
    try {
      return await this.client.lLen(key);
    } catch (error) {
      console.error('Redis lLen error:', error);
      return 0;
    }
  }
  
  async lRem(key, count, value) {
    if (!this.isConnected) return 0;
    try {
      return await this.client.lRem(key, count, value);
    } catch (error) {
      console.error('Redis lRem error:', error);
      return 0;
    }
  }
}

export default new RedisService();