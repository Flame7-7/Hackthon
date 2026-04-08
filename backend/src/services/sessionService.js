// backend/src/services/sessionService.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class SessionService {
  
  async createSession(sessionData) {
    try {
      const session = await prisma.session.create({
        data: {
          id: sessionData.id,
          participants: sessionData.participants,
          topic: sessionData.topic,
          mood: sessionData.mood,
          expiresAt: sessionData.expiresAt,
          startedAt: new Date()
        }
      });
      
      // Schedule session cleanup
      this.scheduleSessionCleanup(session.id, sessionData.expiresAt);
      
      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }
  
  async getSession(sessionId) {
    try {
      return await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          reports: true
        }
      });
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }
  
  async endSession(sessionId) {
    try {
      const session = await prisma.session.update({
        where: { id: sessionId },
        data: {
          endedAt: new Date()
        }
      });
      
      // Clean up any associated data
      await this.cleanupSessionData(sessionId);
      
      return session;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }
  
  async cleanupSessionData(sessionId) {
    // Delete any temporary data associated with the session
    // Messages are already not stored, so this is mostly for analytics
    try {
      // Mark all reports as resolved for this session
      await prisma.report.updateMany({
        where: { sessionId, resolved: false },
        data: { resolved: true }
      });
      
      // Update user sessions to null
      await prisma.user.updateMany({
        where: { sessionId },
        data: { sessionId: null }
      });
    } catch (error) {
      console.error('Error cleaning up session:', error);
    }
  }
  
  scheduleSessionCleanup(sessionId, expiresAt) {
    const now = new Date();
    const delay = expiresAt.getTime() - now.getTime();
    
    if (delay > 0) {
      setTimeout(async () => {
        const session = await this.getSession(sessionId);
        if (session && !session.endedAt) {
          console.log(`Auto-ending session ${sessionId} due to expiry`);
          await this.endSession(sessionId);
        }
      }, delay);
    }
  }
  
  async getActiveSessions() {
    try {
      return await prisma.session.findMany({
        where: {
          endedAt: null,
          expiresAt: { gt: new Date() }
        }
      });
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }
}

export default new SessionService();