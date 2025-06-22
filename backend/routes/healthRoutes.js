const express = require('express');
const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Simple health check without database dependency
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'Airdrop Compass Backend',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
