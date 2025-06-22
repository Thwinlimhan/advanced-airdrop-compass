const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');

let recurringTasksStore = {}; // { userId: [task1, task2] }

const ensureUserTaskStore = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated properly.' });
  }
  if (!recurringTasksStore[req.user.id]) {
    recurringTasksStore[req.user.id] = [];
  }
  next();
};

router.use(authMiddleware);
router.use(ensureUserTaskStore);

// --- Helper for simulated async DB calls ---
const simulateDBWrite = () => new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
const simulateDBRead = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
  return data;
};

// --- Date Calculation Helper (Simplified, for backend stub) ---
const calculateNextDueDate = (task, fromDate = new Date()) => {
    let nextDate = new Date(fromDate);
    nextDate.setHours(0,0,0,0); // Normalize fromDate

    switch (task.frequency) {
        case 'Daily': // TaskFrequency.DAILY
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case 'Weekly': // TaskFrequency.WEEKLY
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case 'Monthly': // TaskFrequency.MONTHLY
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case 'Every X Days': // TaskFrequency.EVERY_X_DAYS
            nextDate.setDate(nextDate.getDate() + (task.everyXDaysValue || 1));
            break;
        // Add more complex logic for SPECIFIC_DAYS_OF_WEEK, EVERY_X_WEEKS_ON_DAY, NTH_WEEKDAY_OF_MONTH, SPECIFIC_DATES
        // This requires more detailed implementation similar to AppContext. For stub, keep it simple or use placeholder.
        default: // Fallback if frequency logic is complex or not implemented here
             nextDate.setDate(nextDate.getDate() + 7); // Default to weekly for unknown/complex
            break;
    }
    return nextDate.toISOString().split('T')[0];
};


// GET /api/v1/recurring-tasks
router.get('/', async (req, res) => {
  const userTasks = await simulateDBRead(recurringTasksStore[req.user.id]);
  res.json(userTasks);
});

// POST /api/v1/recurring-tasks
router.post('/', async (req, res) => {
  const { name, frequency, description, nextDueDate } = req.body;
  if (!name || !frequency || !description || !nextDueDate) {
    return res.status(400).json({ message: 'Name, frequency, description, and nextDueDate are required' });
  }
  try {
    new Date(nextDueDate).toISOString(); // Validate date format
  } catch (e) {
    return res.status(400).json({message: 'Invalid nextDueDate format.'});
  }

  const newTask = {
    id: `task_rec_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,
    userId: req.user.id,
    completionHistory: [],
    isActive: true,
    notes: req.body.notes || '',
    tags: req.body.tags || [],
    ...req.body 
  };
  recurringTasksStore[req.user.id].push(newTask);
  await simulateDBWrite();
  res.status(201).json(newTask);
});

// GET /api/v1/recurring-tasks/:taskId
router.get('/:taskId', async (req, res) => {
  const userTasks = await simulateDBRead(recurringTasksStore[req.user.id]);
  const task = userTasks.find(t => t.id === req.params.taskId);
  if (task) res.json(task); else res.status(404).json({ message: 'Recurring task not found' });
});

// PUT /api/v1/recurring-tasks/:taskId
router.put('/:taskId', async (req, res) => {
  const userTasks = recurringTasksStore[req.user.id];
  const taskIndex = userTasks.findIndex(t => t.id === req.params.taskId);
  if (taskIndex > -1) {
    const { id, userId, completionHistory, ...updateData } = req.body; // Exclude non-updatable fields
    userTasks[taskIndex] = { 
        ...userTasks[taskIndex], 
        ...updateData, 
    };
    if (updateData.nextDueDate) {
        try { new Date(updateData.nextDueDate).toISOString(); } 
        catch(e) { return res.status(400).json({message: "Invalid nextDueDate format on update."});}
    }
    await simulateDBWrite();
    res.json(userTasks[taskIndex]);
  } else {
    res.status(404).json({ message: 'Recurring task not found' });
  }
});

// DELETE /api/v1/recurring-tasks/:taskId
router.delete('/:taskId', async (req, res) => {
  const userTasks = recurringTasksStore[req.user.id];
  const initialLength = userTasks.length;
  recurringTasksStore[req.user.id] = userTasks.filter(t => t.id !== req.params.taskId);
  if (recurringTasksStore[req.user.id].length < initialLength) {
    await simulateDBWrite();
    res.status(200).json({ message: 'Recurring task deleted' });
  } else {
    res.status(404).json({ message: 'Recurring task not found' });
  }
});

// POST /api/v1/recurring-tasks/:taskId/complete
router.post('/:taskId/complete', async (req, res) => {
  const userTasks = recurringTasksStore[req.user.id];
  const taskIndex = userTasks.findIndex(t => t.id === req.params.taskId);
  if (taskIndex > -1) {
    const task = userTasks[taskIndex];
    if (!task.isActive && task.frequency !== 'One Time') { 
        return res.status(400).json({ message: 'Task is not active and cannot be completed.'})
    }
    if(!task.completionHistory) task.completionHistory = [];
    
    // Streak logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateForCheck = new Date(task.nextDueDate);
    dueDateForCheck.setHours(0, 0, 0, 0);
    
    const isOverdue = dueDateForCheck < today;
    let newStreak = task.currentStreak || 0;
    
    if (isOverdue) {
      newStreak = 1; // Reset streak if task was completed late
    } else {
      newStreak += 1; // Increment streak for on-time completion
    }
    
    const completionDate = new Date().toISOString();
    task.completionHistory.push(completionDate);
    task.lastCompletedDate = completionDate;
    task.currentStreak = newStreak;
    
    if (task.frequency !== 'One Time') { // 'One Time' corresponds to TaskFrequency.ONE_TIME
        task.nextDueDate = calculateNextDueDate(task, new Date());
    } else {
        task.isActive = false; // Mark one-time tasks as inactive upon completion
    }
    await simulateDBWrite();
    res.json(task);
  } else {
    res.status(404).json({ message: 'Recurring task not found' });
  }
});

// POST /api/v1/recurring-tasks/:taskId/snooze
router.post('/:taskId/snooze', async (req, res) => {
  const { daysToSnooze } = req.body;
  if (typeof daysToSnooze !== 'number' || daysToSnooze <= 0) {
    return res.status(400).json({ message: 'Invalid daysToSnooze value. Must be a positive number.' });
  }
  const userTasks = recurringTasksStore[req.user.id];
  const taskIndex = userTasks.findIndex(t => t.id === req.params.taskId);
  if (taskIndex > -1) {
    const task = userTasks[taskIndex];
    if (!task.isActive) {
        return res.status(400).json({ message: 'Cannot snooze an inactive task.' });
    }
    const currentDueDate = new Date(task.nextDueDate);
    currentDueDate.setDate(currentDueDate.getDate() + daysToSnooze);
    task.nextDueDate = currentDueDate.toISOString().split('T')[0];
    await simulateDBWrite();
    res.json(task);
  } else {
    res.status(404).json({ message: 'Recurring task not found' });
  }
});

// GET /api/v1/recurring-tasks/:taskId/completion-history
router.get('/:taskId/completion-history', async (req, res) => {
  const userTasks = await simulateDBRead(recurringTasksStore[req.user.id]);
  const task = userTasks.find(t => t.id === req.params.taskId);
  if (task) res.json(await simulateDBRead(task.completionHistory || []));
  else res.status(404).json({ message: 'Recurring task not found' });
});

module.exports = router;