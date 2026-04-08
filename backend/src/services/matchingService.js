// backend/src/services/matchingService.js
import { createClient } from 'redis';

class MatchingService {
  constructor() {
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.redisClient.connect().catch(console.error);
    this.matchQueues = new Map(); // topic -> queue
  }
  
  async addToQueue(userId, username, filters = {}) {
    const { topic = 'general', mood = 'any' } = filters;
    const queueKey = `match:${topic}:${mood}`;
    
    const userData = {
      userId,
      username,
      timestamp: Date.now(),
      filters
    };
    
    await this.redisClient.lPush(queueKey, JSON.stringify(userData));
    
    // Auto-remove after 2 minutes if not matched
    setTimeout(async () => {
      await this.removeFromQueue(userId, queueKey);
    }, 120000);
    
    return queueKey;
  }
  
  async findMatch(userId, queueKey) {
    const queueLength = await this.redisClient.lLen(queueKey);
    
    if (queueLength < 2) return null;
    
    // Get all users in queue
    const users = await this.redisClient.lRange(queueKey, 0, -1);
    
    for (const userStr of users) {
      const user = JSON.parse(userStr);
      if (user.userId !== userId) {
        // Found a match!
        await this.removeFromQueue(user.userId, queueKey);
        await this.removeFromQueue(userId, queueKey);
        return user;
      }
    }
    
    return null;
  }
  
  async removeFromQueue(userId, queueKey) {
    const users = await this.redisClient.lRange(queueKey, 0, -1);
    
    for (const userStr of users) {
      const user = JSON.parse(userStr);
      if (user.userId === userId) {
        await this.redisClient.lRem(queueKey, 1, userStr);
        break;
      }
    }
  }
  
  async getQueueStatus(queueKey) {
    const length = await this.redisClient.lLen(queueKey);
    return { queueKey, queueLength: length };
  }
}

export default new MatchingService();