// server/routes/reminder.js
const express = require('express');
const router = express.Router();
const { createReminder, getReminders, updateReminder, deleteReminder } = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReminder);
router.get('/', protect, getReminders);
router.put('/:id', protect, updateReminder);
router.delete('/:id', protect, deleteReminder);

module.exports = router;
