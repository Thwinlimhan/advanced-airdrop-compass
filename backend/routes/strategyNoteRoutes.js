const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');

let strategyNotesStore = {}; // { userId: [note1, note2] }

const ensureUserNoteStore = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated properly.' });
  }
  if (!strategyNotesStore[req.user.id]) {
    strategyNotesStore[req.user.id] = [];
  }
  next();
};

router.use(authMiddleware);
router.use(ensureUserNoteStore);

// --- Helper for simulated async DB calls ---
const simulateDBWrite = () => new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
const simulateDBRead = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
  return data;
};

// GET /api/v1/strategy-notes
router.get('/', async (req, res) => {
  const userNotes = await simulateDBRead(strategyNotesStore[req.user.id]);
  res.json(userNotes);
});

// POST /api/v1/strategy-notes
router.post('/', async (req, res) => {
  const { title, content } = req.body;
  if (title === undefined || content === undefined) { // content can be empty string, title cannot
    return res.status(400).json({ message: 'Title and content are required' });
  }
  if (!title.trim()){
    return res.status(400).json({ message: 'Title cannot be empty.' });
  }
  const newNote = {
    id: `note_strat_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,
    userId: req.user.id,
    lastModified: new Date().toISOString(),
    linkedAirdropIds: req.body.linkedAirdropIds || [],
    title: title.trim(),
    content: content // Keep content as is (can be empty)
  };
  strategyNotesStore[req.user.id].push(newNote);
  await simulateDBWrite();
  res.status(201).json(newNote);
});

// GET /api/v1/strategy-notes/:noteId
router.get('/:noteId', async (req, res) => {
  const userNotes = await simulateDBRead(strategyNotesStore[req.user.id]);
  const note = userNotes.find(n => n.id === req.params.noteId);
  if (note) res.json(note); else res.status(404).json({ message: 'Strategy note not found' });
});

// PUT /api/v1/strategy-notes/:noteId
router.put('/:noteId', async (req, res) => {
  const userNotes = strategyNotesStore[req.user.id];
  const noteIndex = userNotes.findIndex(n => n.id === req.params.noteId);
  if (noteIndex > -1) {
    const { id, userId, lastModified, ...updateData } = req.body; // Exclude non-updatable fields
    if (updateData.title !== undefined && !updateData.title.trim()){
        return res.status(400).json({ message: 'Title cannot be empty when updating.' });
    }
    userNotes[noteIndex] = { 
        ...userNotes[noteIndex], 
        ...updateData, 
        lastModified: new Date().toISOString() 
    };
    await simulateDBWrite();
    res.json(userNotes[noteIndex]);
  } else {
    res.status(404).json({ message: 'Strategy note not found' });
  }
});

// DELETE /api/v1/strategy-notes/:noteId
router.delete('/:noteId', async (req, res) => {
  const userNotes = strategyNotesStore[req.user.id];
  const initialLength = userNotes.length;
  strategyNotesStore[req.user.id] = userNotes.filter(n => n.id !== req.params.noteId);
  if (strategyNotesStore[req.user.id].length < initialLength) {
    await simulateDBWrite();
    res.status(200).json({ message: 'Strategy note deleted' });
  } else {
    res.status(404).json({ message: 'Strategy note not found' });
  }
});

module.exports = router;