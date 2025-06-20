require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const airdropRoutes = require('./routes/airdropRoutes');
const recurringTaskRoutes = require('./routes/recurringTaskRoutes');
const learningResourceRoutes = require('./routes/learningResourceRoutes');
const strategyNoteRoutes = require('./routes/strategyNoteRoutes');
const userAlertRoutes = require('./routes/userAlertRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const airdropTemplateRoutes = require('./routes/airdropTemplateRoutes');
const yieldPositionRoutes = require('./routes/yieldPositionRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const aiStrategyRoutes = require('./routes/aiStrategyRoutes');
const syncRoutes = require('./routes/syncRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes'); // Added
const toolsRoutes = require('./routes/toolsRoutes'); // Added
const healthRoutes = require('./routes/healthRoutes'); // Added
const aiRoutes = require('./routes/aiRoutes'); // Added

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('Airdrop Compass Backend is running!');
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/wallets', walletRoutes);
app.use('/api/v1/airdrops', airdropRoutes);
app.use('/api/v1/recurring-tasks', recurringTaskRoutes);
app.use('/api/v1/learning-resources', learningResourceRoutes);
app.use('/api/v1/strategy-notes', strategyNoteRoutes);
app.use('/api/v1/user-alerts', userAlertRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/watchlist', watchlistRoutes); 
app.use('/api/v1/airdrop-templates', airdropTemplateRoutes); 
app.use('/api/v1/yield-positions', yieldPositionRoutes); 
app.use('/api/v1/user-profile', userProfileRoutes); 
app.use('/api/v1/ai-strategies', aiStrategyRoutes); 
app.use('/api/v1/sync', syncRoutes);
app.use('/api/v1/portfolio', portfolioRoutes);
app.use('/api/v1/analytics', analyticsRoutes); // Added
app.use('/api/v1/tools', toolsRoutes); // Added
app.use('/api/v1/health', healthRoutes); // Added
app.use('/api/v1/ai', aiRoutes); // Added

// Global Error Handler (simple example)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not set in your .env file. Authentication will not be secure.');
  }
});
