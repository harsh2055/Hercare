// server/routes/chat.js
const express    = require('express');
const router     = express.Router();
const { chat }   = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// POST /api/chat — protected: user must be logged in
router.post('/', protect, chat);

module.exports = router;