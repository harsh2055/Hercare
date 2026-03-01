// server/routes/pregnancy.js
const express = require('express');
const router = express.Router();
const { createPregnancy, getPregnancy, updatePregnancy } = require('../controllers/pregnancyController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createPregnancy);
router.get('/', protect, getPregnancy);
router.put('/', protect, updatePregnancy);

module.exports = router;
