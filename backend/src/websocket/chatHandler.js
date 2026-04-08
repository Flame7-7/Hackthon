// backend/src/websocket/chatHandler.js
import { PrismaClient } from '@prisma/client';
import moderationService from '../services/moderationService.js';
import sessionService from '../services/sessionService.js';

const prisma = new PrismaClient();

export function setupChatHandlers(io, socket) {
  
  // Handle joining a chat session
  socket.on('join_chat', async ({ sessionId, participants }) => {
    try {
      socket.join(sessionId);
      socket.sessionId = sessionId;
      
      // Get or create session
      let session = await prisma.session.findUnique({
        where: { id: sessionId }
      });
      
      if (!session) {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 min expiry
        
        session = await prisma.session.create({
          data: {
            id: sessionId,
            participants,
            expiresAt
          }
        });
      }
      
      // Update user's session
      await prisma.user.update({
        where: { id: socket.userId },
        data: { sessionId: session.id }
      });
      
      // Notify other participants
      socket.to(sessionId).emit('user_joined', {
        userId: socket.userId,
        username: socket.username
      });
      
      // Send session info
      socket.emit('session_ready', {
        sessionId: session.id,
        expiresAt: session.expiresAt,
        participants: session.participants
      });
      
    } catch (error) {
      console.error('Join chat error:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });
  
  // Handle sending messages
  socket.on('send_message', async ({ sessionId, message }) => {
    try {
      // Check moderation
      const moderationResult = await moderationService.moderateMessage(message, socket.userId);
      
      if (moderationResult.isBlocked) {
        socket.emit('message_blocked', { reason: moderationResult.reason });
        
        // Apply penalty if needed
        if (moderationResult.penalty) {
          await moderationService.applyPenalty(socket.userId, moderationResult.penalty);
        }
        return;
      }
      
      // Get session to verify participant
      const session = await prisma.session.findUnique({
        where: { id: sessionId }
      });
      
      if (!session || session.endedAt) {
        socket.emit('error', { message: 'Session expired' });
        return;
      }
      
      // Update message count
      await prisma.session.update({
        where: { id: sessionId },
        data: { messageCount: { increment: 1 } }
      });
      
      // Broadcast message to session
      const messageData = {
        id: `${Date.now()}-${socket.userId}`,
        userId: socket.userId,
        username: socket.username,
        message: moderationResult.cleanedMessage || message,
        timestamp: new Date().toISOString()
      };
      
      io.to(sessionId).emit('new_message', messageData);
      
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Handle typing indicators
  socket.on('typing', ({ sessionId, isTyping }) => {
    socket.to(sessionId).emit('user_typing', {
      userId: socket.userId,
      username: socket.username,
      isTyping
    });
  });
  
  // Handle leaving chat
  socket.on('leave_chat', async ({ sessionId }) => {
    await handleLeaveChat(socket, sessionId);
  });
  
  // Handle skip
  socket.on('skip_chat', async ({ sessionId }) => {
    await handleLeaveChat(socket, sessionId);
    socket.emit('chat_skipped');
  });
  
  async function handleLeaveChat(socket, sessionId) {
    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId }
      });
      
      if (session && !session.endedAt) {
        // Remove user from session
        const updatedParticipants = session.participants.filter(p => p !== socket.userId);
        
        if (updatedParticipants.length === 0) {
          // End session
          await prisma.session.update({
            where: { id: sessionId },
            data: { endedAt: new Date() }
          });
        } else {
          // Update session participants
          await prisma.session.update({
            where: { id: sessionId },
            data: { participants: updatedParticipants }
          });
          
          // Notify others
          socket.to(sessionId).emit('user_left', {
            userId: socket.userId,
            username: socket.username
          });
        }
        
        // Clear user's session
        await prisma.user.update({
          where: { id: socket.userId },
          data: { sessionId: null }
        });
        
        socket.leave(sessionId);
        delete socket.sessionId;
      }
    } catch (error) {
      console.error('Leave chat error:', error);
    }
  }
}