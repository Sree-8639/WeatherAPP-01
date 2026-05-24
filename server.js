/**
 * Weather APP - Express.js Server
 * Serves static files and handles routing
 */

const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Weather APP'
  });
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Weather APP',
    version: '1.0.0',
    description: 'Real-time Weather Forecasting Platform',
    author: 'Sree-8639',
    apiProvider: 'OpenWeatherMap v2.5'
  });
});

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     🌤️  Weather APP - Server Ready     ║
╠════════════════════════════════════════╣
║ Server running on: http://localhost:${PORT}   ║
║ API Health: http://localhost:${PORT}/health  ║
║ Status: ✅ Production Ready             ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
