
const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');

let userAlertsStore = {}; // { userId: [alert1, alert2] }

const ensureUserAlertStore = (req, res, next) => {
  if (!req.user || !req.user.id) { 
    return res.status(401).json({ message: 'User not authenticated properly for alert store.' });
  }
  if (!userAlertsStore[req.user.id]) {
    userAlertsStore[req.user.id] = [];
  }
  next();
};

router.use(authMiddleware);
router.use(ensureUserAlertStore);

// --- Helper for simulated async DB calls ---
const simulateDBWrite = () => new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
const simulateDBRead = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
  return data;
};

// GET /api/v1/user-alerts
router.get('/', async (req, res) => {
  const userAlerts = await simulateDBRead(userAlertsStore[req.user.id]);
  res.json(userAlerts);
});

// GET /api/v1/user-alerts/:alertId
router.get('/:alertId', async (req, res) => {
  const userAlerts = await simulateDBRead(userAlertsStore[req.user.id]);
  const alert = userAlerts.find(a => a.id === req.params.alertId);
  if (alert) res.json(alert); else res.status(404).json({ message: 'Alert not found' });
});

// POST /api/v1/user-alerts
router.post('/', async (req, res) => {
  const { type, body, title, relatedAirdropId } = req.body;
  if (!type || !body) {
    return res.status(400).json({ message: 'Type and body are required for an alert' });
  }
  const newAlert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substring(2,5)}`,
    userId: req.user.id,
    date: new Date().toISOString(),
    isRead: false,
    type, body,
    title: title || (body.length > 30 ? body.substring(0, 30) + '...' : body),
    relatedAirdropId
  };
  userAlertsStore[req.user.id].unshift(newAlert); // Add to beginning for recent first
  await simulateDBWrite();
  res.status(201).json(newAlert);
});

// PUT /api/v1/user-alerts/:alertId - Update alert content
router.put('/:alertId', async (req, res) => {
  const userAlerts = userAlertsStore[req.user.id];
  const alertIndex = userAlerts.findIndex(a => a.id === req.params.alertId);
  if (alertIndex > -1) {
    // Exclude non-updatable fields like id, userId, date from req.body
    // isRead is handled by a specific endpoint.
    const { id, userId, date, isRead, ...updateData } = req.body; 
    if(updateData.body !== undefined && !updateData.body.trim()){
        return res.status(400).json({ message: 'Alert body cannot be empty when updating.' });
    }
    userAlerts[alertIndex] = { ...userAlerts[alertIndex], ...updateData };
    await simulateDBWrite();
    res.json(userAlerts[alertIndex]);
  } else {
    res.status(404).json({ message: 'Alert not found' });
  }
});


// PUT /api/v1/user-alerts/:alertId/read - Mark as read
router.put('/:alertId/read', async (req, res) => {
  const userAlerts = userAlertsStore[req.user.id];
  const alertIndex = userAlerts.findIndex(a => a.id === req.params.alertId);
  if (alertIndex > -1) {
    userAlerts[alertIndex].isRead = true;
    await simulateDBWrite();
    res.json(userAlerts[alertIndex]);
  } else {
    res.status(404).json({ message: 'Alert not found' });
  }
});

// DELETE /api/v1/user-alerts/:alertId
router.delete('/:alertId', async (req, res) => {
  const userAlerts = userAlertsStore[req.user.id];
  const initialLength = userAlerts.length;
  userAlertsStore[req.user.id] = userAlerts.filter(a => a.id !== req.params.alertId);
  if (userAlertsStore[req.user.id].length < initialLength) {
    await simulateDBWrite();
    res.status(200).json({ message: 'Alert deleted' });
  } else {
    res.status(404).json({ message: 'Alert not found' });
  }
});

// POST /api/v1/user-alerts/mark-all-read
router.post('/mark-all-read', async (req, res) => {
  const userAlerts = userAlertsStore[req.user.id];
  let changed = false;
  userAlerts.forEach(alert => {
      if (!alert.isRead) {
          alert.isRead = true;
          changed = true;
      }
  });
  if (changed) await simulateDBWrite();
  res.json({ message: 'All alerts marked as read' });
});

// DELETE /api/v1/user-alerts/read/clear
router.delete('/read/clear', async (req, res) => { 
  const initialLength = userAlertsStore[req.user.id].length;
  userAlertsStore[req.user.id] = userAlertsStore[req.user.id].filter(alert => !alert.isRead);
  const finalLength = userAlertsStore[req.user.id].length;
  if (finalLength < initialLength) await simulateDBWrite();
  res.json({ message: `${initialLength - finalLength} read alerts cleared` });
});

// DELETE /api/v1/user-alerts/all/clear
router.delete('/all/clear', async (req, res) => { 
  const count = userAlertsStore[req.user.id].length;
  userAlertsStore[req.user.id] = [];
  if (count > 0) await simulateDBWrite();
  res.json({ message: `All ${count} alerts cleared` });
});

module.exports = router;