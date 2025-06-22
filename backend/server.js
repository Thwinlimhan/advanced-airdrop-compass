const express = require('express');
const cors = require('cors');
const config = require('./config/environment');
const storage = require('./utils/storage');

// Import routes
const authRoutes = require('./routes/authRoutes');
const airdropRoutes = require('./routes/airdropRoutes');
const walletRoutes = require('./routes/walletRoutes');
const recurringTaskRoutes = require('./routes/recurringTaskRoutes');
const learningResourceRoutes = require('./routes/learningResourceRoutes');
const strategyNoteRoutes = require('./routes/strategyNoteRoutes');
const userAlertRoutes = require('./routes/userAlertRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const airdropTemplateRoutes = require('./routes/airdropTemplateRoutes');
const yieldPositionRoutes = require('./routes/yieldPositionRoutes');
const aiStrategyRoutes = require('./routes/aiStrategyRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const healthRoutes = require('./routes/healthRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const toolsRoutes = require('./routes/toolsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const syncRoutes = require('./routes/syncRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
})); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Response validation middleware to prevent null body issues
app.use((req, res, next) => {
  // Store the original send method
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;
  
  // Override send method to ensure proper response structure
  res.send = function(data) {
    // Ensure we always send a valid response body
    if (data === null || data === undefined) {
      data = { message: 'No content' };
    }
    return originalSend.call(this, data);
  };
  
  // Override json method to ensure proper response structure
  res.json = function(data) {
    // Ensure we always send a valid JSON response body
    if (data === null || data === undefined) {
      data = { message: 'No content' };
    }
    return originalJson.call(this, data);
  };
  
  // Override end method to ensure proper response structure
  res.end = function(data) {
    // Ensure we always send a valid response body
    if (data === null || data === undefined) {
      data = '';
    }
    return originalEnd.call(this, data);
  };
  
  next();
});

// Set JWT_SECRET for auth routes
process.env.JWT_SECRET = config.jwtSecret;

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/airdrops', airdropRoutes);
app.use('/api/v1/wallets', walletRoutes);
app.use('/api/v1/recurring-tasks', recurringTaskRoutes);
app.use('/api/v1/learning-resources', learningResourceRoutes);
app.use('/api/v1/strategy-notes', strategyNoteRoutes);
app.use('/api/v1/user-alerts', userAlertRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/watchlist', watchlistRoutes);
app.use('/api/v1/airdrop-templates', airdropTemplateRoutes);
app.use('/api/v1/yield-positions', yieldPositionRoutes);
app.use('/api/v1/ai-strategies', aiStrategyRoutes);
app.use('/api/v1/user-profile', userProfileRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/portfolio', portfolioRoutes);
app.use('/api/v1/tools', toolsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/sync', syncRoutes);

// Global Error Handler (simple example)
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });
  
  // Ensure we always send a proper response
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? err.message : 'Something went wrong'
    });
  }
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = config.port;

// Initialize storage and start server
async function startServer() {
  try {
    // Initialize persistent storage
    await storage.initializeStorage();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🌐 CORS Origin: ${config.corsOrigin}`);
      console.log(`🔐 JWT Secret: ${config.jwtSecret ? 'Configured' : 'Missing!'}`);
      console.log(`💾 Persistent Storage: Enabled`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
