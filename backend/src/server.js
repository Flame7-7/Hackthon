// backend/src/server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { setupChatHandlers } from './websocket/chatHandler.js';
import { setupMatchingHandlers } from './websocket/matchingHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket setup
io.use(async (socket, next) => {
  try {
    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error('Username required'));
    }
    
    // Check if user is banned
    const user = await prisma.user.findUnique({
      where: { id: socket.id }
    });
    
    if (user?.isBanned && user?.banExpiresAt > new Date()) {
      return next(new Error('User is temporarily banned'));
    }
    
    socket.userId = socket.id;
    socket.username = username;
    next();
  } catch (error) {
    next(error);
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.username} (${socket.userId})`);
  
  // Register user
  prisma.user.upsert({
    where: { id: socket.userId },
    update: { lastActive: new Date() },
    create: {
      id: socket.userId,
      username: socket.username
    }
  }).catch(console.error);
  
  // Setup handlers
  setupChatHandlers(io, socket);
  setupMatchingHandlers(io, socket);
  
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.username}`);
    
    // Update user status
    await prisma.user.update({
      where: { id: socket.userId },
      data: { lastActive: new Date() }
    });
    
    // Handle session cleanup if user was in a chat
    if (socket.sessionId) {
      const session = await prisma.session.findUnique({
        where: { id: socket.sessionId }
      });
      
      if (session && !session.endedAt) {
        const otherParticipants = session.participants.filter(p => p !== socket.userId);
        
        if (otherParticipants.length === 0) {
          // End session if no participants left
          await prisma.session.update({
            where: { id: socket.sessionId },
            data: { endedAt: new Date() }
          });
        } else {
          // Notify others
          otherParticipants.forEach(participantId => {
            io.to(participantId).emit('user_left', {
              userId: socket.userId,
              username: socket.username
            });
          });
        }
      }
    }
  });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});