// server/routes/pose.js
const express = require('express');
const router = express.Router();
const { seedPoses, getPoses, getPoseById, createPose, updatePose, deletePose } = require('../controllers/poseController');
const { protect, adminOnly } = require('../middleware/auth');

// MUST BE AT THE TOP!
router.post('/seed', protect, adminOnly, seedPoses);

router.get('/', protect, getPoses);
router.get('/:id', protect, getPoseById);
// Admin-only write routes
router.get('/seed', seedPoses);
router.post('/',      createPose);
router.put('/:id',     updatePose);
router.delete('/:id',   deletePose);

module.exports = router;
