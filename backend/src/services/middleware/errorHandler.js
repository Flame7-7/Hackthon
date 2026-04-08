// backend/src/middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: 'A record with this identifier already exists'
    });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Not found',
      message: 'The requested resource was not found'
    });
  }
  
  // JWT errors (if implemented later)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication token is invalid'
    });
  }
  
  // Default error
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

// WebSocket error handler
export const handleWebSocketError = (socket, error) => {
  console.error('WebSocket error:', error);
  socket.emit('error', {
    message: error.message || 'An error occurred',
    code: error.code || 'UNKNOWN_ERROR'
  });
};