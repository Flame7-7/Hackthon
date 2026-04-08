// backend/src/websocket/matchingHandler.js
import matchingService from '../services/matchingService.js';
import sessionService from '../services/sessionService.js';
import { v4 as uuidv4 } from 'uuid';

export function setupMatchingHandlers(io, socket) {
  
  socket.on('find_match', async (filters = {}) => {
    try {
      // Add user to matching queue
      const queueKey = await matchingService.addToQueue(
        socket.userId,
        socket.username,
        filters
      );
      
      // Try to find a match
      const match = await matchingService.findMatch(socket.userId, queueKey);
      
      if (match) {
        // Create new session
        const sessionId = uuidv4();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 30);
        
        const participants = [socket.userId, match.userId];
        
        // Create session in database
        const session = await sessionService.createSession({
          id: sessionId,
          participants,
          topic: filters.topic || 'general',
          mood: filters.mood || 'any',
          expiresAt
        });
        
        // Notify both users
        io.to(socket.userId).emit('match_found', {
          sessionId,
          participants,
          expiresAt,
          matchedWith: match.username
        });
        
        io.to(match.userId).emit('match_found', {
          sessionId,
          participants,
          expiresAt,
          matchedWith: socket.username
        });
        
        // Join both users to the session room
        socket.join(sessionId);
        const matchSocket = io.sockets.sockets.get(match.userId);
        if (matchSocket) {
          matchSocket.join(sessionId);
        }
      } else {
        // No match found, notify user they're in queue
        socket.emit('waiting_for_match', {
          message: 'Looking for someone to chat with...',
          queuePosition: await matchingService.getQueueStatus(queueKey)
        });
      }
    } catch (error) {
      console.error('Match finding error:', error);
      socket.emit('match_error', { message: 'Failed to find match' });
    }
  });
  
  socket.on('cancel_match', async () => {
    // Remove user from all queues
    // This would need to track which queue the user is in
    socket.emit('match_cancelled', { message: 'Search cancelled' });
  });
}