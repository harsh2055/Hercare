// server/models/Pregnancy.js
const mongoose = require('mongoose');

const pregnancySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date, required: true },
  currentWeek: { type: Number },
  trimester: { type: Number, min: 1, max: 3 },
  lastMenstrualPeriod: { type: Date },
  symptoms: [{
    date: Date,
    symptom: String,
    severity: Number,
    notes: String
  }],
  weight: [{
    date: Date,
    value: Number,
    unit: { type: String, default: 'kg' }
  }],
  appointments: [{
    date: Date,
    type: String,
    notes: String,
    completed: { type: Boolean, default: false }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

pregnancySchema.pre('save', function(next) {
  const today = new Date();
  const conceptionDate = new Date(this.dueDate);
  conceptionDate.setDate(conceptionDate.getDate() - 280);

  const diffDays = Math.floor((today - conceptionDate) / (1000 * 60 * 60 * 24));
  this.currentWeek = Math.max(1, Math.min(42, Math.floor(diffDays / 7)));

  if (this.currentWeek <= 12) this.trimester = 1;
  else if (this.currentWeek <= 27) this.trimester = 2;
  else this.trimester = 3;

  next();
});

module.exports = mongoose.model('Pregnancy', pregnancySchema);
