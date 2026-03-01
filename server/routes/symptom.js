// server/routes/symptom.js
const express = require('express');
const router  = express.Router();
const {
  createSymptomLog,
  getSymptomLogs,
  getTodayLog,
  getSymptomLogById,
  updateSymptomLog,
  deleteSymptomLog,
  getSymptomTrends,
} = require('../controllers/symptomController');
const { protect } = require('../middleware/auth');

// All symptom routes require authentication
router.use(protect);

router.post('/',          createSymptomLog);
router.get('/',           getSymptomLogs);
router.get('/today',      getTodayLog);
router.get('/trends',     getSymptomTrends);
router.get('/:id',        getSymptomLogById);
router.put('/:id',        updateSymptomLog);
router.delete('/:id',     deleteSymptomLog);

module.exports = router;