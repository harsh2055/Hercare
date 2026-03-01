// server/routes/admin.js
const express = require('express');
const router  = express.Router();
const {
  getAdminStats,
  getAdminUsers,
  toggleUserStatus,
  deleteUser,
  getSymptomTrends,
  getDietPlans,
  getDietPlanById,
  createDietPlan,
  updateDietPlan,
  deleteDietPlan,
  getAllPoses,
  updatePose,
  deletePose,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// ── Overview stats ────────────────────────────────────────────────────────────
router.get('/stats',            getAdminStats);

// ── User management ───────────────────────────────────────────────────────────
router.get('/users',            getAdminUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id',     deleteUser);

// ── Symptom trends ────────────────────────────────────────────────────────────
router.get('/symptom-trends',   getSymptomTrends);

// ── Diet plans ────────────────────────────────────────────────────────────────
router.get('/diet-plans',       getDietPlans);
router.get('/diet-plans/:id',   getDietPlanById);
router.post('/diet-plans',      createDietPlan);
router.put('/diet-plans/:id',   updateDietPlan);
router.delete('/diet-plans/:id',deleteDietPlan);

// ── Poses ─────────────────────────────────────────────────────────────────────
router.get('/poses',            getAllPoses);
router.put('/poses/:id',        updatePose);
router.delete('/poses/:id',     deletePose);

// server/routes/admin.js — ADD this route to your existing admin router
// ADD THIS near the top of admin.js (with your other requires):
const authMiddleware = require('../middleware/auth');
const _auth = typeof authMiddleware === 'function'
  ? authMiddleware
  : (authMiddleware.protect || authMiddleware.auth || authMiddleware.verifyToken);

// ADD THIS route wherever you want in admin.js:
router.post('/seed-diet-plans', _auth, async (req, res) => {
  try {
    const DietPlan = require('../models/DietPlan');
    await DietPlan.deleteMany({});
    const seedDietPlans = require('../seeders/seedDietPlans');
    await seedDietPlans();
    const count = await DietPlan.countDocuments();
    res.json({ message: `Successfully seeded ${count} diet plans.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
