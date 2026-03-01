// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, deleteAccount, firebaseAuth } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/firebase', firebaseAuth);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/account', protect, deleteAccount);

module.exports = router;
