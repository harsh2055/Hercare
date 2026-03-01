// server/models/Reminder.js
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['period', 'ovulation', 'medication', 'appointment', 'exercise', 'water', 'prenatal_vitamin', 'custom'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String },
  date: { type: Date, required: true },
  time: { type: String },
  recurring: { type: Boolean, default: false },
  recurringInterval: { type: String, enum: ['daily', 'weekly', 'monthly'] },
  status: { type: String, enum: ['pending', 'sent', 'dismissed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reminder', reminderSchema);
