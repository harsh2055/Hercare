const express = require('express');
const router = express.Router();
const dietController = require('../controllers/dietController');
const authMiddleware = require('../middleware/auth');

// Handle both export styles:
//   module.exports = fn
//   module.exports = { protect } or { auth } or { verifyToken }
const auth = typeof authMiddleware === 'function'
  ? authMiddleware
  : (authMiddleware.protect || authMiddleware.auth || authMiddleware.verifyToken);

const getDietPlan = typeof dietController === 'function'
  ? dietController
  : dietController.getDietPlan;

router.get('/', auth, getDietPlan);

module.exports = router;
