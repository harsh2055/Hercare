// server/controllers/cycleController.js
const CycleLog = require('../models/CycleLog');

const createCycleLog = async (req, res) => {
  try {
    const { lastPeriodDate, cycleLength, periodLength, flow, symptoms, notes } = req.body;

    const cycleLog = await CycleLog.create({
      userId: req.user._id,
      lastPeriodDate,
      cycleLength: cycleLength || 28,
      periodLength: periodLength || 5,
      flow,
      symptoms,
      notes
    });

    res.status(201).json(cycleLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCycleLogs = async (req, res) => {
  try {
    const logs = await CycleLog.find({ userId: req.user._id })
      .sort({ lastPeriodDate: -1 })
      .limit(12);

    // Calculate average cycle length
    const avgCycleLength = logs.length > 1
      ? Math.round(logs.slice(0, -1).reduce((acc, log, i) => {
          const next = logs[i];
          const diff = Math.abs(new Date(next.lastPeriodDate) - new Date(log.lastPeriodDate));
          return acc + Math.floor(diff / (1000 * 60 * 60 * 24));
        }, 0) / (logs.length - 1))
      : (logs[0]?.cycleLength || 28);

    res.json({ logs, avgCycleLength });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCycleLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await CycleLog.findOne({ _id: id, userId: req.user._id });

    if (!log) return res.status(404).json({ message: 'Log not found' });

    Object.assign(log, req.body);
    await log.save();
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addSymptom = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await CycleLog.findOne({ _id: id, userId: req.user._id });

    if (!log) return res.status(404).json({ message: 'Log not found' });

    log.symptoms.push(req.body);
    await log.save();
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCycleLog, getCycleLogs, updateCycleLog, addSymptom };
