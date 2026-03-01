// server/controllers/reminderController.js
const Reminder = require('../models/Reminder');

const createReminder = async (req, res) => {
  try {
    const reminder = await Reminder.create({ ...req.body, userId: req.user._id });
    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id })
      .sort({ date: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReminder = async (req, res) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReminder, getReminders, updateReminder, deleteReminder };
