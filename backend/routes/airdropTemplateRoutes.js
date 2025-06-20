const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');

let airdropTemplatesStore = {}; // { userId: [template1, template2] }

const ensureUserTemplateStore = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated properly.' });
  }
  if (!airdropTemplatesStore[req.user.id]) {
    airdropTemplatesStore[req.user.id] = [];
  }
  next();
};

router.use(authMiddleware);
router.use(ensureUserTemplateStore);

// --- Helper for simulated async DB calls ---
const simulateDBWrite = () => new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
const simulateDBRead = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
  return data;
};

// GET /api/v1/airdrop-templates
router.get('/', async (req, res) => {
  const userTemplates = await simulateDBRead(airdropTemplatesStore[req.user.id]);
  res.json(userTemplates);
});

// POST /api/v1/airdrop-templates
router.post('/', async (req, res) => {
  const { name, tasks } = req.body;
  if (!name || !Array.isArray(tasks)) {
    return res.status(400).json({ message: 'Name and tasks array are required' });
  }
  if (!name.trim()) {
    return res.status(400).json({ message: 'Template name cannot be empty.' });
  }
  const newTemplate = {
    id: `template_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,
    userId: req.user.id,
    name: name.trim(),
    description: req.body.description || '',
    blockchain: req.body.blockchain || '',
    tasks: tasks.map(task => ({ description: task.description, ...task })) // Ensure description is primary
  };
  airdropTemplatesStore[req.user.id].push(newTemplate);
  await simulateDBWrite();
  res.status(201).json(newTemplate);
});

// GET /api/v1/airdrop-templates/:templateId
router.get('/:templateId', async (req, res) => {
  const userTemplates = await simulateDBRead(airdropTemplatesStore[req.user.id]);
  const template = userTemplates.find(t => t.id === req.params.templateId);
  if (template) res.json(template); else res.status(404).json({ message: 'Airdrop template not found' });
});

// PUT /api/v1/airdrop-templates/:templateId
router.put('/:templateId', async (req, res) => {
  const userTemplates = airdropTemplatesStore[req.user.id];
  const templateIndex = userTemplates.findIndex(t => t.id === req.params.templateId);
  if (templateIndex > -1) {
    const { id, userId, ...updateData } = req.body; // Exclude non-updatable fields
    if (updateData.name !== undefined && !updateData.name.trim()){
        return res.status(400).json({ message: 'Template name cannot be empty when updating.' });
    }
    userTemplates[templateIndex] = { 
        ...userTemplates[templateIndex], 
        ...updateData
    };
    await simulateDBWrite();
    res.json(userTemplates[templateIndex]);
  } else {
    res.status(404).json({ message: 'Airdrop template not found' });
  }
});

// DELETE /api/v1/airdrop-templates/:templateId
router.delete('/:templateId', async (req, res) => {
  const userTemplates = airdropTemplatesStore[req.user.id];
  const initialLength = userTemplates.length;
  airdropTemplatesStore[req.user.id] = userTemplates.filter(t => t.id !== req.params.templateId);
  if (airdropTemplatesStore[req.user.id].length < initialLength) {
    await simulateDBWrite();
    res.status(200).json({ message: 'Airdrop template deleted' });
  } else {
    res.status(404).json({ message: 'Airdrop template not found' });
  }
});

module.exports = router;