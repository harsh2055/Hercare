// server/controllers/symptomController.js
const SymptomLog = require('../models/SymptomLog');
const { SYMPTOM_META } = require('../models/SymptomLog');

// ── POST /api/symptoms  ──────────────────────────────────────────────────
// Create or upsert a symptom log for a given date.
// If a log already exists for that calendar day, symptoms are merged.
const createSymptomLog = async (req, res) => {
  try {
    const { date, symptoms, mood, energy, notes } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: 'At least one symptom is required.' });
    }

    // Attach category from meta if not provided by client
    const enriched = symptoms.map(s => ({
      ...s,
      category: s.category || SYMPTOM_META[s.type]?.category || 'general',
    }));

    // Normalise date to midnight UTC so one log per calendar day
    const logDate = new Date(date || Date.now());
    logDate.setUTCHours(0, 0, 0, 0);

    // Upsert: if a doc already exists for this user+day, replace symptoms
    const log = await SymptomLog.findOneAndUpdate(
      { userId: req.user._id, date: logDate },
      { $set: { symptoms: enriched, mood, energy, notes, date: logDate } },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/symptoms  ───────────────────────────────────────────────────
// Returns all symptom logs for the current user, newest first.
// Optional query: ?days=30 to limit to last N days
const getSymptomLogs = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await SymptomLog.find({
      userId: req.user._id,
      date: { $gte: since },
    }).sort({ date: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/symptoms/today  ─────────────────────────────────────────────
// Returns today's log if it exists (used to pre-fill the logger form)
const getTodayLog = async (req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const log = await SymptomLog.findOne({ userId: req.user._id, date: today });
    res.json(log || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/symptoms/:id  ───────────────────────────────────────────────
const getSymptomLogById = async (req, res) => {
  try {
    const log = await SymptomLog.findOne({ _id: req.params.id, userId: req.user._id });
    if (!log) return res.status(404).json({ message: 'Log not found.' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/symptoms/:id  ───────────────────────────────────────────────
const updateSymptomLog = async (req, res) => {
  try {
    const { symptoms, mood, energy, notes } = req.body;

    const enriched = (symptoms || []).map(s => ({
      ...s,
      category: s.category || SYMPTOM_META[s.type]?.category || 'general',
    }));

    const log = await SymptomLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { symptoms: enriched, mood, energy, notes } },
      { new: true, runValidators: true }
    );

    if (!log) return res.status(404).json({ message: 'Log not found.' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/symptoms/:id  ────────────────────────────────────────────
const deleteSymptomLog = async (req, res) => {
  try {
    const log = await SymptomLog.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!log) return res.status(404).json({ message: 'Log not found.' });
    res.json({ message: 'Symptom log deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/symptoms/trends  ────────────────────────────────────────────
// Returns frequency count of each symptom for the last N days.
// Used by Admin Dashboard (Step 8) and user insight panels.
const getSymptomTrends = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const userId = req.user.role === 'admin' ? undefined : req.user._id;

    const since = new Date();
    since.setDate(since.getDate() - days);

    const matchStage = { date: { $gte: since } };
    if (userId) matchStage.userId = userId;

    const trends = await SymptomLog.aggregate([
      { $match: matchStage },
      { $unwind: '$symptoms' },
      {
        $group: {
          _id: {
            type:     '$symptoms.type',
            category: '$symptoms.category',
          },
          count:       { $sum: 1 },
          avgSeverity: { $avg: '$symptoms.severity' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
      {
        $project: {
          _id: 0,
          type:        '$_id.type',
          category:    '$_id.category',
          count:       1,
          avgSeverity: { $round: ['$avgSeverity', 1] },
        },
      },
    ]);

    // Enrich with human-readable labels
    const enriched = trends.map(t => ({
      ...t,
      label: SYMPTOM_META[t.type]?.label || t.type,
    }));

    res.json({ trends: enriched, days, total: enriched.reduce((a, b) => a + b.count, 0) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSymptomLog,
  getSymptomLogs,
  getTodayLog,
  getSymptomLogById,
  updateSymptomLog,
  deleteSymptomLog,
  getSymptomTrends,
};