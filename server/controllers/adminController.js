// server/controllers/adminController.js
const User       = require('../models/User');
const CycleLog   = require('../models/CycleLog');
const SymptomLog = require('../models/SymptomLog');
const DietPlan   = require('../models/DietPlan');
const ExercisePose = require('../models/ExercisePose');

const { SYMPTOM_META } = require('../models/SymptomLog');

// ── GET /api/admin/stats ─────────────────────────────────────────────────────
const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalCycleLogs,
      totalSymptomLogs,
      newUsersThisMonth,
      totalDietPlans,
      totalPoses,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      CycleLog.countDocuments(),
      SymptomLog.countDocuments(),
     User.countDocuments({
        createdAt: { $gte: new Date(new Date().setDate(1)) }, // first of this month
      }),
      DietPlan.countDocuments(),
      ExercisePose.countDocuments(),
    ]);

    // Users registered by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          label: {
            $concat: [
              { $arrayElemAt: [
                ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                '$_id.month',
              ]},
            ],
          },
          count: 1,
        },
      },
    ]);

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      totalCycleLogs,
      totalSymptomLogs,
      newUsersThisMonth,
      totalDietPlans,
      totalPoses,
      userGrowth,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/admin/users ─────────────────────────────────────────────────────
const getAdminUsers = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip  = (page - 1) * limit;

    const query = search
      ? { $or: [
          { name:  { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ]}
      : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PATCH /api/admin/users/:id/toggle-status ─────────────────────────────────
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot deactivate admin accounts.' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/admin/users/:id ──────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin accounts.' });

    // Cascade delete all user health data
    await Promise.all([
      CycleLog.deleteMany({ userId: user._id }),
      SymptomLog.deleteMany({ userId: user._id }),
    ]);

    await user.deleteOne();
    res.json({ message: 'User and all associated data deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// SYMPTOM TRENDS (Step 2 data, surfaced in admin)
// ════════════════════════════════════════════════════════════════════════════

// ── GET /api/admin/symptom-trends ────────────────────────────────────────────
// Returns top symptoms across ALL users for the last N days.
// Used by the Symptom Trends chart in the admin panel.
const getSymptomTrends = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Top 10 symptoms by frequency
    const trends = await SymptomLog.aggregate([
      { $match: { date: { $gte: since } } },
      { $unwind: '$symptoms' },
      {
        $group: {
          _id: {
            type:     '$symptoms.type',
            category: '$symptoms.category',
          },
          count:          { $sum: 1 },
          avgSeverity:    { $avg: '$symptoms.severity' },
          uniqueUsers:    { $addToSet: '$userId' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          type:        '$_id.type',
          category:    '$_id.category',
          count:       1,
          avgSeverity: { $round: ['$avgSeverity', 1] },
          uniqueUsers: { $size: '$uniqueUsers' },
        },
      },
    ]);

    // Enrich with labels
    const enriched = trends.map(t => ({
      ...t,
      label: SYMPTOM_META[t.type]?.label || t.type,
    }));

    // Daily breakdown for sparkline (last 14 days)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);

    const dailyCounts = await SymptomLog.aggregate([
      { $match: { date: { $gte: twoWeeksAgo } } },
      { $unwind: '$symptoms' },
      {
        $group: {
          _id: {
            day:   { $dayOfMonth: '$date' },
            month: { $month:      '$date' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1, '_id.day': 1 } },
      {
        $project: {
          _id: 0,
          label: { $concat: [{ $toString: '$_id.day' }, '/', { $toString: '$_id.month' }] },
          count: 1,
        },
      },
    ]);

    // Category breakdown
    const categoryBreakdown = await SymptomLog.aggregate([
      { $match: { date: { $gte: since } } },
      { $unwind: '$symptoms' },
      { $group: { _id: '$symptoms.category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, category: '$_id', count: 1 } },
    ]);

    res.json({
      trends:  enriched,
      daily:   dailyCounts,
      categories: categoryBreakdown,
      days,
      totalEntries: enriched.reduce((a, b) => a + b.count, 0),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// DIET PLAN CRUD
// ════════════════════════════════════════════════════════════════════════════

const getDietPlans = async (req, res) => {
  try {
    const { preference, phase, trimester } = req.query;
    const filter = {};
    if (preference) filter.dietaryPreference = preference;
    if (phase)      filter.phase = phase;
    if (trimester)  filter.trimester = parseInt(trimester);

    const plans = await DietPlan.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDietPlanById = async (req, res) => {
  try {
    const plan = await DietPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Diet plan not found.' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDietPlan = async (req, res) => {
  try {
    const plan = await DietPlan.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateDietPlan = async (req, res) => {
  try {
    const plan = await DietPlan.findByIdAndUpdate(
      req.params.id, req.body,
      { new: true, runValidators: true }
    );
    if (!plan) return res.status(404).json({ message: 'Diet plan not found.' });
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteDietPlan = async (req, res) => {
  try {
    const plan = await DietPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Diet plan not found.' });
    res.json({ message: 'Diet plan deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// POSE CRUD (admin wrappers — thin pass-throughs to poseController)
// ════════════════════════════════════════════════════════════════════════════

const getAllPoses = async (req, res) => {
  try {
    const filter = {};
    if (req.query.phase)     filter.phase = req.query.phase;
    if (req.query.trimester) filter.trimester = parseInt(req.query.trimester);

    const poses = await ExercisePose.find(filter).sort({ phase: 1, order: 1 });
    res.json(poses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePose = async (req, res) => {
  try {
    const pose = await ExercisePose.findByIdAndUpdate(
      req.params.id, req.body,
      { new: true, runValidators: true }
    );
    if (!pose) return res.status(404).json({ message: 'Pose not found.' });
    res.json(pose);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletePose = async (req, res) => {
  try {
    const pose = await ExercisePose.findByIdAndDelete(req.params.id);
    if (!pose) return res.status(404).json({ message: 'Pose not found.' });
    res.json({ message: 'Pose deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
