// server/routes/cycle.js
const express = require('express');
const router = express.Router();
const { createCycleLog, getCycleLogs, updateCycleLog, addSymptom } = require('../controllers/cycleController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createCycleLog);
router.get('/', protect, getCycleLogs);
router.put('/:id', protect, updateCycleLog);
router.post('/:id/symptom', protect, addSymptom);

module.exports = router;
