// backend/src/services/moderationService.js
import Filter from 'bad-words';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const filter = new Filter();

// Toxic keywords and patterns
const toxicPatterns = [
  /\b(hate|kill|die|stupid|idiot)\b/i,
  /\b(fuck|shit|damn|hell)\b/i,
  /\b(racist|nazi|terrorist)\b/i
];

class ModerationService {
  
  async moderateMessage(message, userId) {
    const result = {
      isBlocked: false,
      cleanedMessage: message,
      reason: null,
      penalty: null
    };
    
    // Check for profanity
    if (filter.isProfane(message)) {
      result.isBlocked = true;
      result.reason = 'Inappropriate language detected';
      result.penalty = 'WARNING';
      
      // Check user's history
      const userReports = await prisma.report.count({
        where: { reportedId: userId }
      });
      
      if (userReports >= 3) {
        result.penalty = 'TEMP_BAN';
        result.reason += ' - Multiple violations';
      }
      
      return result;
    }
    
    // Check for toxic patterns
    for (const pattern of toxicPatterns) {
      if (pattern.test(message)) {
        result.isBlocked = true;
        result.reason = 'Toxic content detected';
        result.penalty = 'WARNING';
        return result;
      }
    }
    
    // Clean message (replace profanity)
    result.cleanedMessage = filter.clean(message);
    
    return result;
  }
  
  async applyPenalty(userId, penalty) {
    switch (penalty) {
      case 'WARNING':
        await this.addWarning(userId);
        break;
      case 'TEMP_BAN':
        await this.tempBanUser(userId, 30); // 30 minute ban
        break;
      case 'PERM_BAN':
        await this.permBanUser(userId);
        break;
    }
  }
  
  async addWarning(userId) {
    await prisma.moderationAction.create({
      data: {
        userId,
        action: 'WARNING',
        reason: 'Inappropriate content'
      }
    });
  }
  
  async tempBanUser(userId, durationMinutes) {
    const banExpiry = new Date();
    banExpiry.setMinutes(banExpiry.getMinutes() + durationMinutes);
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banExpiresAt: banExpiry
      }
    });
    
    await prisma.moderationAction.create({
      data: {
        userId,
        action: 'TEMP_BAN',
        reason: 'Multiple violations',
        duration: durationMinutes
      }
    });
  }
  
  async permBanUser(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banExpiresAt: null // Permanent ban
      }
    });
    
    await prisma.moderationAction.create({
      data: {
        userId,
        action: 'PERM_BAN',
        reason: 'Severe violations'
      }
    });
  }
  
  async reportUser(reporterId, reportedId, sessionId, reason) {
    const report = await prisma.report.create({
      data: {
        reporterId,
        reportedId,
        sessionId,
        reason
      }
    });
    
    // Check if reported user has reached threshold
    const reportCount = await prisma.report.count({
      where: { reportedId, resolved: false }
    });
    
    if (reportCount >= 5) {
      await this.tempBanUser(reportedId, 60); // 1 hour ban
    }
    
    return report;
  }
}

export default new ModerationService();